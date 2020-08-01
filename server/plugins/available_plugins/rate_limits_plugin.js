'use strict';

const Bucket			= require( './../../components/rate_limiter/bucket' );
const PluginInterface	= require( './../plugin_interface' );
const Router			= require( './../../components/routing/router' );
const DataServer		= require( './../../components/caching/data_server' );
const fs				= require( 'fs' );
const path				= require( 'path' );

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

const PROJECT_ROOT						= path.parse( require.main.filename ).dir;

const OPTIONS_FILE_PATH					= 'fileLocation';
const OPTIONS_DATA_STORE				= 'dataStore';
const OPTIONS_RULES						= 'rules';
const OPTIONS_USE_FILE					= 'useFile';

const DEFAULT_FILE_LOCATION				= path.join( PROJECT_ROOT, 'rate_limits.json' );
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

		this.setOptions( options );
	}

	/**
	 * @inheritDoc
	 */
	setOptions( options )
	{
		super.setOptions( options );

		this.useFile		= typeof options[OPTIONS_USE_FILE] === 'boolean'
							? options[OPTIONS_USE_FILE]
							: false;

		this.rules			= Array.isArray( options[OPTIONS_RULES] )
							? options[OPTIONS_RULES]
							: [];

		this.fileLocation	= typeof options[OPTIONS_FILE_PATH] === 'string'
							? options[OPTIONS_FILE_PATH]
							: DEFAULT_FILE_LOCATION;

		this.dataStore		= options[OPTIONS_DATA_STORE] instanceof DataServer
							? options[OPTIONS_DATA_STORE]
							: DEFAULT_DATA_STORE;
	}

	/**
	 * @brief	Loads the config into memory and uses the configuration set there to set rules for the server
	 *
	 * @return	void
	 */
	loadConfig()
	{
		let config	= [DEFAULT_RULE];

		if ( this.rules.length !== 0 )
		{
			config	= this.rules;
		}
		else if ( ! fs.existsSync( this.fileLocation ) && this.useFile )
		{
			const writeStream	= fs.createWriteStream( this.fileLocation );

			writeStream.write( JSON.stringify( config ) );
			writeStream.end();
		}
		else if ( this.useFile )
		{
			const buffer	= fs.readFileSync( this.fileLocation );

			try
			{
				config	= JSON.parse( buffer.toString( 'utf-8' ) || JSON.stringify( config ) );
			} catch ( e ) {}
		}

		this.sanitizeConfig( config );
	}

	/**
	 * @brief	Parses and sanitizes the config
	 *
	 * @param	{Array} [config=[]]
	 *
	 * @return	void
	 */
	sanitizeConfig( config = [] )
	{
		config.forEach( this.validateRule );

		this.rules	= config;
	}

	/**
	 * @brief	Does rule validation
	 *
	 * @param	{Object} options
	 *
	 * @return	void
	 */
	validateRule( options )
	{
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
			) {
				throw new Error( `app.er.rateLimits.${CONNECTION_DELAY_POLICY}.missingDelayTimeOrDelayRetries` );
			}

			if ( typeof options.stopPropagation !== 'boolean' )
				options.stopPropagation	= false;

			if ( typeof options.ipLimit !== 'boolean' )
				options.ipLimit	= false;
		}
		else
		{
			throw new Error( 'app.er.rateLimits.invalidOptions' );
		}
	}

	/**
	 * @brief	Gets a new Bucket from the rule options
	 *
	 * @param	{String} key
	 * @param	{Object} options
	 *
	 * @return	Bucket
	 */
	async getNewBucketFromOptions( key, options )
	{
		const maxAmount		= options.maxAmount;
		const refillTime	= options.refillTime;
		const refillAmount	= options.refillAmount;

		const bucket		= new Bucket( refillAmount, refillTime, maxAmount, null, key, this.dataStore );

		await bucket.init();

		return bucket;
	}

	/**
	 * @brief	Attaches the listener
	 *
	 * @details	Loads the config, attaches a process that will clear the IP based buckets if they are full once every 60 minutes
	 *
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.loadConfig();

		if ( this.dataStore === null )
		{
			if ( server.hasPlugin( 'er_data_server' ) )
			{
				this.dataStore	= server.getPlugin( 'er_data_server' ).getServer();
				return;
			}

			this.dataStore	= new DataServer( { ttl : -1 } );
		}
	}

	/**
	 * @brief	Global middleware that can be used to dynamically rate limit requests
	 *
	 * @details	Cretes a default data store if one is not set
	 *
	 * @param	{Object} rule
	 *
	 * @return	Function
	 */
	rateLimit( rule )
	{
		if ( this.dataStore === null )
		{
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
	 * @brief	Gets the plugin middlewares
	 *
	 * @returns	Array
	 */
	getPluginMiddleware()
	{
		return [{
			handler: ( event ) => {
				this._rateLimit( event, this.rules.slice() );
			}
		}];
	}

	/**
	 * @brief	Checks whether the client's ip has reached the limit of requests
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

		if ( typeof eventRequest.rateLimited !== 'boolean' )
			eventRequest.rateLimited		= false;

		if ( typeof eventRequest.erRateLimitRules !== 'object' )
			eventRequest.erRateLimitRules	= rules;
		else
			eventRequest.erRateLimitRules	= Object.assign( eventRequest.erRateLimitRules, rules );

		eventRequest.on( 'cleanUp', () => {
			eventRequest.rateLimited		= undefined;
			eventRequest.erRateLimitRules	= undefined;
		});

		const path							= eventRequest.path;
		const method						= eventRequest.method;
		const clientIp						= eventRequest.clientIp;

		let hasConnectionDelayPolicy		= false;
		let connectionDelayPolicyOptions	= null;
		let bucketsHit						= [];

		for ( let i = 0; i < rules.length; ++ i )
		{
			const rule			= rules[i];
			const ruleMethod	= rule.methods;
			const rulePath		= rule.path;

			if ( Router.matchMethod( method, ruleMethod ) && Router.matchRoute( path, rulePath ) )
			{
				const ipLimit	= rule.ipLimit;
				const policy	= rule.policy;

				let bucketKey	= Bucket.DEFAULT_PREFIX;
				bucketKey	+= `${rulePath}${policy}`;

				if ( ipLimit === true )
					bucketKey	+= clientIp;

				const bucket	= await this.getNewBucketFromOptions( bucketKey, rule );
				const hasToken	= await bucket.reduce();

				if ( ! hasToken )
				{
					const refillTime			= rule.refillTime;
					eventRequest.rateLimited	= true;
					eventRequest.emit( 'rateLimited', { policy, rule } );
					bucketsHit.push( bucket );

					switch( policy )
					{
						case PERMISSIVE_POLICY:
							break;

						case CONNECTION_DELAY_POLICY:
							if ( ! hasConnectionDelayPolicy )
							{
								hasConnectionDelayPolicy		= true;
								connectionDelayPolicyOptions	= rule;
							}

							break;

						case STRICT_POLICY:
							this.sendRetryAfterRequest( eventRequest, refillTime );
							return;
					}

					if ( rule.stopPropagation === true )
					{
						break;
					}
				}
			}
		}

		if ( hasConnectionDelayPolicy )
		{
			const rule			= connectionDelayPolicyOptions;
			const buckets		= bucketsHit;
			const delayTime		= rule.delayTime;
			const delayRetries	= rule.delayRetries;
			const refillTime	= rule.refillTime;

			let tries			= 0;

			const interval		= setInterval( async() => {
				if ( ++ tries >= delayRetries )
				{
					clearInterval( interval );
					this.sendRetryAfterRequest( eventRequest, refillTime );
					return;
				}

				for ( let b = 0; b < buckets.length; ++ b )
				{
					const bucket	= buckets[b];

					if ( ! await bucket.reduce() )
						return;
				}

				clearInterval( interval );
				eventRequest.next();
			}, delayTime * 1000 );

			return;
		}

		eventRequest.next();
	}

	/**
	 * @brief	Sends a 429 response
	 *
	 * @param	{EventRequest} eventRequest
	 * @param	{Number} retryAfterTime
	 *
	 * @return	void
	 */
	sendRetryAfterRequest( eventRequest, retryAfterTime )
	{
		eventRequest.sendError(
			{
				code: 'app.er.rateLimits.tooManyRequests',
				status: TOO_MANY_REQUESTS_STATUS_CODE,
				headers: { 'Retry-After': retryAfterTime }
			}
		);
	}
}

module.exports	= RateLimitsPlugin;