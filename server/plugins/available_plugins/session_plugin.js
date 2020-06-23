'use strict';

const PluginInterface	= require( './../plugin_interface' );
const Session		= require( '../../components/session/session' );

/**
 * @brief	Adds session the the event request
 */
class SessionPlugin extends PluginInterface
{
	constructor( id, options = {} )
	{
		super( id, options );

		this.server	= null;
	}

	/**
	 * @brief	This plugin depends on having a cache
	 *
	 * @return	Array
	 */
	getPluginDependencies()
	{
		return ['er_data_server'];
	}

	/**
	 * @brief	creates the namespace when attaching to the server
	 *
	 * @param	server Server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.cachingServer	= server.getPlugin( 'er_data_server' ).getServer();
	}

	/**
	 * @brief	Adds a session to the event request
	 *
	 * @details	Even tho the cleanUp will remove the event.session
	 * 			the event.session.saveSession() in the send
	 * 			has already queued up the session save so it will still execute
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		const setUpPluginMiddleware	= {
			handler	: ( event ) =>
			{
				if ( event.session == null )
				{
					event.session	= new Session( event, this.options );

					event.on( 'cleanUp', ()=>{
						event.session	= undefined;
					} );

					event.on( 'send', async ()=>{
						if ( Object.keys( event.session.session ).length !== 0 )
						{
							await event.session.saveSession();
						}
					} );
				}

				event.next();
			}
		};

		const initSessionForPathMiddleware	= {
			handler	: ( event )=>{
				event.initSession	= async ( callback )=>{
					const hasSession	= await event.session.hasSession();

					if ( ! hasSession )
					{
						callback( await event.session.newSession() === false );
					}
					else
					{
						callback( await event.session.fetchSession() === false );
					}
				};

				event.next();
			}
		};

		return [setUpPluginMiddleware, initSessionForPathMiddleware];
	}
}

module.exports	= SessionPlugin;
