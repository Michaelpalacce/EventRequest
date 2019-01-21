'use strict';

const PluginInterface		= require( './../plugin_interface' );
const fs					= require( 'fs' );
const path					= require( 'path' );

const RATE_LIMIT_KEY		= 'rate_limit';
const INTERVAL_KEY			= 'interval';
const RULES_KEY				= 'rules';
const DEFAULT_RATE_LIMIT	= 100;
const DEFAULT_INTERVAL		= 60 * 1000;
const PROJECT_ROOT			= path.parse( require.main.filename ).dir;
const FILE_LOCATION			= path.join( PROJECT_ROOT, 'rate_limits.json' );

/**
 * @brief	Plugin used to limit user's requests
 */
class RateLimitsPlugin extends PluginInterface
{
	constructor( id, options )
	{
		super( id, options );

		this.requests	= {};
		this.config		= {};
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
			let writeStream	= fs.createWriteStream( FILE_LOCATION );

			this.config			= {
				[RATE_LIMIT_KEY]	: DEFAULT_RATE_LIMIT,
				[INTERVAL_KEY]		: DEFAULT_INTERVAL,
				[RULES_KEY]			: []
			};

			writeStream.write( JSON.stringify( this.config ) );
			writeStream.end();
		}
		else
		{
			let readStream	= fs.createReadStream( FILE_LOCATION );
			let chunks		= [];

			readStream.on( 'error', ( err ) => {
				throw new Error( err );
			});

			readStream.on( 'data', ( chunk ) => {
				chunks.push( chunk );
			});

			readStream.on( 'close', () => {
				this.config	= JSON.parse( Buffer.concat( chunks ).toString( 'utf-8' ) );
			});
		}
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
					//@TODO CHECK WHY IT IS 2
					eventRequest.setBlock( [this.getRateLimitReachedMiddleware( eventRequest )] );
				} );
			}
		} );
	}

	/**
	 * @brief	Gets a middleware that is supposed to send a response that the rate of requests have been reached
	 *
	 * @param	EventRequest eventRequest
	 *
	 * @return	Object
	 */
	getRateLimitReachedMiddleware( eventRequest )
	{
		let path	= eventRequest.path;
		let ip		= eventRequest.clientIp;

		return ( event )=>{
			event.send( `Rate limit reached for ${path} from ${ip}` );
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
		let clientIp	= eventRequest.clientIp;

		if ( typeof this.requests[clientIp] === 'undefined' )
		{
			this.requests[clientIp]	= {};
		}

		if ( typeof this.requests[clientIp][path] === 'undefined' )
		{
			this.requests[clientIp][path]	= 0;
		}

		setTimeout(()=>{
			-- this.requests[clientIp][path];
		}, DEFAULT_INTERVAL );

		return ++ this.requests[clientIp][path] <= DEFAULT_RATE_LIMIT;
	}
}

module.exports	= RateLimitsPlugin;