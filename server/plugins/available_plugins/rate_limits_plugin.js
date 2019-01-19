'use strict';

const PluginInterface		= require( './../plugin_interface' );

const DEFAULT_RATE_LIMIT	= 5;
const DEFAULT_INTERVAL		= 10 * 1000;

/**
 * @brief	Plugin used to limit user's requests
 */
class RateLimitsPlugin extends PluginInterface
{
	constructor( id, options )
	{
		super( id, options );

		this.requests	= {};
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
		server.on( 'eventRequestResolved', ( eventData )=>{
			let { eventRequest }	= eventData;
			let shouldPass			= this.getRequestRate( eventRequest );

			console.log( shouldPass );

			if ( ! shouldPass )
			{
				server.once( 'eventRequestBlockSet', ( eventData )=>{
					let { eventRequest }	= eventData;
					eventRequest.setBlock( [this.getRateLimitReachedMiddleware( eventRequest ), this.getRateLimitReachedMiddleware( eventRequest )] );
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

		return ++ this.requests[clientIp][path] < DEFAULT_RATE_LIMIT;
	}
}

module.exports	= RateLimitsPlugin;