'use strict';

const PluginInterface	    = require( '../plugin_interface' );
const { SessionHandler }	= require( '../../components/session/session_handler' );

/**
 * @brief	Session plugin responsible for managing the security and session
 */
class SessionPlugin extends PluginInterface
{
	/**
	 * @brief	Attaches the session to the event_request
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		let pluginMiddleware	= {
			handler	: ( event ) =>{
				let sessionHandler	= new SessionHandler( event, this.options );
				sessionHandler.handle( ( err ) =>{
					event.next();
				});
			}
		};

		return [pluginMiddleware];
	}

	/**
	 * @brief	Requires the event_request_memory_cache to work
	 *
	 * @return	Array
	 */
	getPluginDependencies()
	{
		return	['er_cache_server'];
	}
}

module.exports	= SessionPlugin;