'use strict';

const PluginInterface		= require( './../plugin_interface' );
const Router				= require( './../../components/routing/router' );
const fs					= require( 'fs' );
const path					= require( 'path' );

const RATE_LIMIT_KEY				= 'rate_limit';
const INTERVAL_KEY					= 'interval';
const RULES_KEY						= 'rules';
const MESSAGE_KEY					= 'message_key';
const STATUS_CODE_KEY				= 'status_code';
const PATH_KEY						= 'path';
const METHOD_KEY					= 'method';
const DEFAULT_RATE_LIMIT			= 100;
const DEFAULT_INTERVAL				= 60 * 1000;
const DEFAULT_MESSAGE				= `Rate limit reached`;
const DEFAULT_MESSAGE_STATUS_CODE	= 403;
const DEFAULT_RULES					= [];
const PROJECT_ROOT					= path.parse( require.main.filename ).dir;
const FILE_LOCATION					= path.join( PROJECT_ROOT, 'rate_limits.json' );

/**
 * @brief	Plugin used to limit user's requests
 */
class RateLimitsPlugin extends PluginInterface
{
	constructor( id, options )
	{
		super( id, options );

		this.requests				= {};
		this.rules					= DEFAULT_RULES;
		this.rateLimit				= DEFAULT_RATE_LIMIT;
		this.interval				= DEFAULT_INTERVAL;
		this.fileLocation			= FILE_LOCATION;
		this.limitReachedMessage	= DEFAULT_MESSAGE;
		this.limitReachedStatusCode	= DEFAULT_MESSAGE_STATUS_CODE;
	}

	/**
	 * @brief	Loads the config into memory and uses the configuration set there to set rules for the server
	 *
	 * @return	void
	 */
	loadConfig()
	{
		if ( ! fs.existsSync( FILE_LOCATION ) )
		{
			let writeStream	= fs.createWriteStream( this.fileLocation );

			this.config			= {
				[RATE_LIMIT_KEY]	: this.rateLimit,
				[INTERVAL_KEY]		: this.interval,
				[MESSAGE_KEY]		: this.limitReachedMessage,
				[STATUS_CODE_KEY]	: this.limitReachedStatusCode,
				[RULES_KEY]			: this.rules
			};

			writeStream.write( JSON.stringify( this.config ) );
			writeStream.end();
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

				this.parseConfig( config );
			});
		}
	}

	/**
	 * @brief	Parses the configuration retrieved from the file
	 *
	 * @param	Object config
	 *
	 * @return	void
	 */
	parseConfig( config = {} )
	{
		let interval				= parseInt( config[INTERVAL_KEY] );
		this.interval				= typeof interval === 'number' && ! isNaN( interval )
									? interval
									: DEFAULT_INTERVAL;

		let rateLimit				= parseInt( config[RATE_LIMIT_KEY] );
		this.rateLimit				= typeof rateLimit === 'number' && ! isNaN( rateLimit )
									? rateLimit
									: DEFAULT_RATE_LIMIT;

		this.rules					= Array.isArray( config[RULES_KEY] )
									? config[RULES_KEY]
									: DEFAULT_RULES;

		this.limitReachedMessage	= typeof config[MESSAGE_KEY] === 'string'
									? config[MESSAGE_KEY]
									: DEFAULT_MESSAGE;

		let statusCode				= parseInt( config[STATUS_CODE_KEY] );
		this.limitReachedStatusCode	= typeof statusCode === 'number' && ! isNaN( statusCode )
									? statusCode
									: DEFAULT_MESSAGE_STATUS_CODE;
	}

	/**
	 * @brief	Attaches the listener
	 *
	 * @param	Server server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.loadConfig();

		server.on( 'eventRequestResolved', ( eventData )=>{
			let { eventRequest }	= eventData;
			let shouldPass			= this.getRequestRate( eventRequest );

			if ( ! shouldPass )
			{
				server.once( 'eventRequestBlockSet', ( eventData )=>{
					let { eventRequest }	= eventData;
					eventRequest.setBlock( [this.getRateLimitReachedMiddleware( eventRequest )] );
				} );
			}
		} );
	}

	/**
	 * @brief	Gets a middleware that is supposed to send a response that the rate of requests have been reached
	 *
	 * @return	Object
	 */
	getRateLimitReachedMiddleware()
	{
		return ( event )=>{
			event.send( this.limitReachedMessage, this.limitReachedStatusCode );
		};
	}

	/**
	 * @brief	Checks whether the client's ip has reached the limit of requests
	 *
	 * @param	EventRequest eventRequest
	 *
	 * @return	Boolean
	 */
	getRequestRate( eventRequest )
	{
		let path		= eventRequest.path;
		let method		= eventRequest.method;
		let clientIp	= eventRequest.clientIp;

		if ( typeof this.requests[clientIp] === 'undefined' )
		{
			this.requests[clientIp]	= {};
		}

		if ( typeof this.requests[clientIp][path] === 'undefined' )
		{
			this.requests[clientIp][path]	= 0;
		}

		let limit		= this.rateLimit;
		let interval	= this.interval;

		this.rules.forEach(( rule )=>{
			let ruleRateLimit	= rule[RATE_LIMIT_KEY];
			let ruleInterval	= rule[INTERVAL_KEY];
			let rulePath		= rule[PATH_KEY];
			let ruleMethod		= rule[METHOD_KEY];

			if ( Router.matchMethod( method, ruleMethod ) && Router.matchRoute( path, rulePath ) )
			{
				limit		= ruleRateLimit;
				interval	= ruleInterval;
			}
		});

		if ( limit === 0 )
		{
			return true;
		}

		setTimeout(()=>{
			-- this.requests[clientIp][path];
		}, interval );

		return ++ this.requests[clientIp][path] <= limit;
	}
}

module.exports	= RateLimitsPlugin;