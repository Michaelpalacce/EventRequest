'use strict';

const Bucket			= require( './../../components/rate_limiter/bucket' );
const PluginInterface	= require( './../plugin_interface' );
const Router			= require( './../../components/routing/router' );
const DataServer		= require( './../../components/caching/data_server' );

/**
 * @brief	Status code send during strict policy in case of rate limit reached
 *
 * @var		Number TOO_MANY_REQUESTS_STATUS_CODE
 */
const TOO_MANY_REQUESTS_STATUS_CODE		= 429;

/**
 * @brief	Permissive policy of client requests
 *
 * @details	This policy will let the client connect freely but a flag will be set that it was rate limited
 *
 * @var		String PERMISSIVE_POLICY
 */
const PERMISSIVE_POLICY					= 'permissive';

/**
 * @brief	Connection delay policy of client requests
 *
 * @details	This policy will rate limit normally the request and will hold the connection until a token is freed
 * 			If this is the policy specified then delayTime and delayRetries must be given. This will be the time after
 * 			a check should be made if there is a free token.
 * 			The first connection delay policy hit in the case of many will be used to determine the delay time but
 * 			all buckets affected by such a connection delay will be affected
 *
 * @var		String CONNECTION_DELAY_POLICY
 */
const CONNECTION_DELAY_POLICY			= 'connection_delay';

/**
 * @brief	Strict policy of client requests
 *
 * @details	This policy will instantly reject if there are not enough tokens and return an empty response with a 429 header.
 * 			This will also include a Retry-After header. If this policy is triggered, stopPropagation will be ignored and
 * 			the request will be immediately canceled
 *
 * @var		String STRICT_POLICY
 */
const STRICT_POLICY						= 'strict';

const OPTIONS_DATA_STORE				= 'dataStore';
const OPTIONS_RULES						= 'rules';
const DEFAULT_DATA_STORE				= null;
const DEFAULT_RULE						= {
	"path":"",
	"methods":[],
	"maxAmount":10000,
	"refillTime":10,
	"refillAmount":1000,
	"policy": CONNECTION_DELAY_POLICY,
	"delayTime": 3,
	"delayRetries": 5,
	"stopPropagation": false,
	"ipLimit": false
};

/**
 * @brief	Plugin used to limit the rate of clients requests
 */
class RateLimitsPlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );

		this.buckets	= {};
		this.rules		= [];
	}

	/**
	 * @inheritDoc
	 */
	setOptions( options ) {
		super.setOptions( options );

		this.rules		= Array.isArray( options[OPTIONS_RULES] )
						? options[OPTIONS_RULES]
						: [DEFAULT_RULE];

		this.dataStore	= options[OPTIONS_DATA_STORE] instanceof DataServer
						? options[OPTIONS_DATA_STORE]
						: DEFAULT_DATA_STORE;

		this.rules.forEach( this.validateRule );
	}

	/**
	 * @brief	Does rule validation for each parameter
	 *
	 * @param	{Object} options
	 *
	 * @return	void
	 */
	validateRule( options ) {
		if (
			typeof options.maxAmount === 'number'
			&& typeof options.refillTime === 'number'
			&& typeof options.refillAmount === 'number'
			&& typeof options.methods !== 'undefined'
			&& Array.isArray( options.methods )
			&& ( typeof options.path === 'string' || options.path instanceof RegExp )
			&& typeof options.policy === 'string'
		) {
			const policy	= options.policy;

			if (
				policy === CONNECTION_DELAY_POLICY
				&& ( typeof options.delayTime !== 'number' || typeof options.delayRetries !== 'number' )
			)
				throw new Error( `app.er.rateLimits.${CONNECTION_DELAY_POLICY}.missingDelayTimeOrDelayRetries` );

			if ( typeof options.stopPropagation !== 'boolean' )
				options.stopPropagation	= false;

			if ( typeof options.ipLimit !== 'boolean' )
				options.ipLimit	= false;
		}
		else
			throw new Error( 'app.er.rateLimits.invalidOptions' );
	}

	/**
	 * Gets a Bucket from the rule options and key
	 *
	 * @param	{String} key
	 * @param	{Object} options
	 *
	 * @return	Bucket
	 */
	async getBucketFromOptions( key, options ) {
		if ( typeof this.buckets[key] !== 'undefined' )
			return this.buckets[key];

		this.buckets[key]	= new Bucket(
			options.refillAmount,
			options.refillTime,
			options.maxAmount,
			null,
			key,
			this.dataStore
		);

		return await this.buckets[key].init();
	}

	/**
	 * If a DataStore was not passed, gets the data store from the server er_data_server plugin, otherwise
	 * creates a new datastore with persistence and not ttl.
	 *
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server ) {
		if ( this.dataStore === null ) {
			if ( server.hasPlugin( 'er_data_server' ) ) {
				this.dataStore	= server.getPlugin( 'er_data_server' ).getServer();
				return;
			}

			this.dataStore	= new DataServer( { ttl : -1 } );
		}
	}

	/**
	 * Global middleware that can be used to dynamically rate limit requests
	 * Creates a default data store if one is not set.
	 *
	 * @param	{Object} rule
	 *
	 * @return	Function
	 */
	rateLimit( rule ) {
		if ( ! this.dataStore ) {
			this.dataStore	= new DataServer({
				ttl		: -1,
				persist	: false
			});
		}

		rule.path		= '';
		rule.methods	= [''];

		this.validateRule( rule );

		return ( event ) => {
			rule.path		= event.path;
			rule.methods	= [event.method];

			const rules	= this.rules.slice( 0 );
			rules.unshift( rule );

			this._rateLimit( event, rules );
		};
	}

	/**
	 * Gets the plugin middlewares
	 *
	 * @returns`Array
	 */
	getPluginMiddleware() {
		return [{ handler: ( event ) => this._rateLimit( event, this.rules.slice() ) }];
	}

	/**
	 * Checks whether the client's ip has reached the limit of requests.
	 * Adds a rateLimited key IF one is not set already. This also detects that this is the first time
	 * this plugin is invoked and will attach an on `cleanUp` event
	 *
	 * @param	{EventRequest} eventRequest
	 * @param	{Array} rules
	 *
	 * @return	void
	 */
	async _rateLimit( eventRequest, rules )
	{
		if ( eventRequest.isFinished() )
			return;

		if ( typeof eventRequest.rateLimited !== 'boolean' ){

			eventRequest.rateLimited	= false;

			eventRequest.on( 'cleanUp', () => {
				eventRequest.rateLimited	= undefined;
			});
		}

		const path		= eventRequest.path;
		const method	= eventRequest.method;
		const clientIp	= eventRequest.clientIp;
		let i;

		for ( i = 0; i < rules.length; ++ i ) {
			const rule			= rules[i];
			const ruleMethod	= rule.methods;
			const rulePath		= rule.path;

			if (
				Router.matchMethod( method, ruleMethod )
				&& Router.matchRoute( path, rulePath )
			) {
				const ipLimit	= rule.ipLimit;
				const policy	= rule.policy;
				const bucketKey	= `${Bucket.DEFAULT_PREFIX}${rulePath}${policy}${ipLimit ? clientIp : ''}`;

				const bucket	= await this.getBucketFromOptions( bucketKey, rule );
				const hasToken	= await bucket.reduce();

				if ( ! hasToken ) {
					eventRequest.rateLimited	= true;
					const shouldRateLimit		= await this._shouldRateLimitRule( rule, bucket );

					if ( shouldRateLimit ) {
						await this.sendRetryAfterResponse( eventRequest, rule.refillTime );
						return;
					}

					if ( rule.stopPropagation === true )
						break;
				}
			}
		}

		eventRequest.next();
	}

	/**
	 * Returns true if the request has been rate limited and a retry after should be sent,
	 * otherwise return false
	 *
	 * @param	{Object} rule
	 * @param	{Bucket} bucket
	 *
	 * @returns	Promise<boolean>
	 */
	async _shouldRateLimitRule( rule, bucket ) {
		return new Promise(( resolve, reject ) => {
			switch( rule.policy )
			{
				case PERMISSIVE_POLICY:
					resolve( false );
					break;

				case CONNECTION_DELAY_POLICY:
					const delayTime		= rule.delayTime;
					const delayRetries	= rule.delayRetries;
					let tries			= 0;

					const interval		= setInterval( async() => {
						if ( ++ tries >= delayRetries ) {
							clearInterval( interval );
							return resolve( true );
						}

						if ( ! await bucket.reduce() )
							return;

						clearInterval( interval );
						resolve( false );
					}, delayTime * 1000 );
					break;

				case STRICT_POLICY:
				default:
					resolve( true );
					break;
			}
		});
	}

	/**
	 * Sends a 429 response whenever a request was rateLimited
	 *
	 * @param	{EventRequest} eventRequest
	 * @param	{Number} retryAfterTime
	 *
	 * @return	void
	 */
	async sendRetryAfterResponse( eventRequest, retryAfterTime ) {
		await eventRequest.sendError({
			code: 'app.er.rateLimits.tooManyRequests',
			status: TOO_MANY_REQUESTS_STATUS_CODE,
			headers: { 'Retry-After': retryAfterTime }
		});
	}
}

module.exports	= RateLimitsPlugin;