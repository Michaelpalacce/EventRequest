'use strict';

const PluginInterface	= require( './../plugin_interface' );
const Session			= require( '../../components/session/session' );

/**
 * @brief	Adds session the the event request
 */
class SessionPlugin extends PluginInterface {
	constructor( id, options = {} ) {
		super( id, options );
		this.server	= null;
	}

	/**
	 * @brief	This plugin depends on having a cache
	 *
	 * @return	Array
	 */
	getPluginDependencies() {
		return ['er_data_server'];
	}

	/**
	 * @brief	creates the namespace when attaching to the server
	 *
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server ) {
		this.dataServer	= server.er_data_server.getServer();
	}

	/**
	 * Adds a session to the event request
	 *
	 * Even tho the cleanUp will remove the event.session
	 * the event.session.saveSession() in the send
	 * has already queued up the session save so it will still execute.
	 *
	 * @return	Array
	 */
	getPluginMiddleware() {
		return [{
			handler	: async ( event ) => {
				if ( ! event.session ) {
					event.session	= new Session( event, this.options );
					await event.session.init();

					event.on( 'cleanUp', async () => {
						await event.session.saveSession();

						event.session	= undefined;

					});
				}

				event.next();
			}
		}];
	}
}

module.exports	= SessionPlugin;
