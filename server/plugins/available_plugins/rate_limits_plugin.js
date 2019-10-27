'use strict';

const Bucket			= require( './../../components/rate_limiter/bucket' );
const PluginInterface	= require( './../plugin_interface' );
const Router			= require( './../../components/routing/router' );
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
const DEFAULT_FILE_LOCATION				= path.join( PROJECT_ROOT, 'rate_limits.json' );
const OPTIONS_FILE_PATH					= 'path';
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
	constructor( id, options = {} )
	{
		super( id, options );

		this.rules			= [];
		this.fileLocation	= typeof options[OPTIONS_FILE_PATH] === 'string'
							? options[OPTIONS_FILE_PATH]
							: DEFAULT_FILE_LOCATION;
	}

	/**
	 * @brief	Loads the config into memory and uses the configuration set there to set rules for the server
	 *
	 * @return	void
	 */
	loadConfig()
	{
		if ( ! fs.existsSync( this.fileLocation ) )
		{
			let writeStream	= fs.createWriteStream( this.fileLocation );
			let config		= [DEFAULT_RULE];

			writeStream.write( JSON.stringify( config ) );
			writeStream.end();
			this.sanitizeConfig( config )
		}
		else
		{
			let readStream	= fs.createReadStream( this.fileLocation );
			let chunks		= [];

			readStream.on( 'error', ( err ) => {
				throw new Error( err );
			});

			readStream.on( 'data', ( chunk ) => {
				chunks.push( chunk );
			});

			readStream.on( 'close', () => {
				let config	= JSON.parse( Buffer.concat( chunks ).toString( 'utf-8' ) );

				this.sanitizeConfig( config );
			});
		}
	}

	/**
	 * @brief	Parses and sanitizes the config
	 *
	 * @param	Array config
	 *
	 * @return	void
	 */
	sanitizeConfig( config = [] )
	{
		config.forEach( ( options )=>{
			if (
				typeof options['maxAmount'] === 'number'
				&& typeof options['refillTime'] === 'number'
				&& typeof options['refillAmount'] === 'number'
				&& typeof options['methods'] !== 'undefined'
				&& Array.isArray( options['methods'] )
				&& typeof options['path'] === 'string'
				&& typeof options['policy'] === 'string'
				&& typeof options['stopPropagation'] === 'boolean'
				&& typeof options['ipLimit'] === 'boolean'
			) {
				const policy	= options['policy'];
				const ipLimit	= options['ipLimit'];

				if (
					policy === CONNECTION_DELAY_POLICY
					&& typeof options['delayTime'] !== 'number'
					&& typeof options['delayRetries'] !== 'number'
				) {
					throw new Error( `Rate limit with ${CONNECTION_DELAY_POLICY} must have delayTime set` );
				}
				const buckets	= ipLimit === true
								? {}
								: { [options['path']]: this.getNewBucketFromOptions( options ) };

				this.rules.push( { buckets, options } );
			}
			else
			{
				throw new Error( 'Invalid rate limit options set: ' + JSON.stringify( options ) );
			}
		});
	}

	/**
	 * @brief	Gets a new Bucket from the rule options
	 *
	 * @param	Object options
	 *
	 * @return	Bucket
	 */
	getNewBucketFromOptions( options )
	{
		const maxAmount		= options['maxAmount'];
		const refillTime	= options['refillTime'];
		const refillAmount	= options['refillAmount'];

		return new Bucket( refillAmount, refillTime, maxAmount );
	}

	/**
	 * @brief	Attaches the listener
	 *
	 * @details	Loads the config, attaches a process that will clear the IP based buckets if they are full once every 15 minutes,
	 * 			attaches a middleware that will handle the rate limiting
	 *
	 * @param	Server server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.loadConfig();

		setInterval(()=>{
			for ( let i = 0; i < this.rules.length; ++ i )
			{
				const options	= this.rules[i]['options'];

				if ( options['ipLimit'] === true )
				{
					const buckets	= this.rules[i]['buckets'];

					for ( let path in buckets )
					{
						let bucket	= buckets[path];

						if ( bucket instanceof Bucket && bucket.isFull() )
						{
							delete this.rules[i]['buckets'][path];
						}
					}
				}
			}
		}, 60 * 60 * 1000 );
	}

	/**
	 * @brief	Gets the plugin middlewares
	 *
	 * @returns	Array
	 */
	getPluginMiddleware()
	{
		return [{
			handler: this.rateLimit.bind( this )
		}];
	}

	/**
	 * @brief	Checks whether the client's ip has reached the limit of requests
	 *
	 * @param	EventRequest eventRequest
	 *
	 * @return	void
	 */
	rateLimit( eventRequest )
	{
		if ( eventRequest.isFinished() )
		{
			return;
		}

		eventRequest.rateLimited	= false;

		eventRequest.on( 'cleanUp', ()=>{
			eventRequest.rateLimited	= undefined;
		} );

		let path							= eventRequest.path;
		let method							= eventRequest.method;
		let clientIp						= eventRequest.clientIp;

		let hasConnectionDelayPolicy		= false;
		let connectionDelayPolicyOptions	= null;
		let bucketsHit						= [];

		for ( let i = 0; i < this.rules.length; ++ i )
		{
			const options		= this.rules[i]['options'];
			const ruleMethod	= options['methods'];
			const rulePath		= options['path'];

			if ( Router.matchMethod( method, ruleMethod ) && Router.matchRoute( path, rulePath ) )
			{
				const ipLimit	= options['ipLimit'];
				let bucketKey	= '';

				if ( ipLimit === true )
				{
					const ipLimitKey	= rulePath + clientIp;

					if ( typeof this.rules[i]['buckets'][ipLimitKey] === 'undefined' )
					{
						this.rules[i]['buckets'][ipLimitKey]	= this.getNewBucketFromOptions( options );
					}

					bucketKey	= ipLimitKey;
				}
				else
				{
					bucketKey	= rulePath;
				}

				const bucket	= this.rules[i]['buckets'][bucketKey];
				const hasToken	= bucket.reduce();

				if ( ! hasToken )
				{
					const policy				= options['policy'];
					const refillTime			= options['refillTime'];
					eventRequest.rateLimited	= true;
					bucketsHit.push( bucket );

					switch( policy )
					{
						case PERMISSIVE_POLICY:
							break;

						case CONNECTION_DELAY_POLICY:
							if ( ! hasConnectionDelayPolicy )
							{
								hasConnectionDelayPolicy		= true;
								connectionDelayPolicyOptions	= options;
							}

							break;

						case STRICT_POLICY:
							this.sendRetryAfterRequest( eventRequest, refillTime );
							return;
					}

					if ( options['stopPropagation'] === true )
					{
						break;
					}
				}
			}
		}

		if ( hasConnectionDelayPolicy )
		{
			const options		= connectionDelayPolicyOptions;
			const buckets		= bucketsHit;
			const delayTime		= options['delayTime'];
			const delayRetries	= options['delayRetries'];
			const refillTime	= options['refillTime'];

			let tries			= 0;

			const interval		= setInterval(()=>{
				if ( ++ tries >= delayRetries )
				{
					clearInterval( interval );
					this.sendRetryAfterRequest( eventRequest, refillTime );
					return;
				}

				for ( let b = 0; b < buckets.length; ++ b )
				{
					const bucket	= buckets[b];

					if ( ! bucket.reduce() )
					{
						return;
					}
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
	 * @param	EventRequest eventRequest
	 * @param	Number retryAfterTime
	 *
	 * @return	void
	 */
	sendRetryAfterRequest( eventRequest, retryAfterTime )
	{
		eventRequest.setHeader( 'Retry-After', retryAfterTime );
		eventRequest.sendError( 'Too many requests', TOO_MANY_REQUESTS_STATUS_CODE );
	}
}

module.exports	= RateLimitsPlugin;