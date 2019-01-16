'use strict';

const PluginInterface					= require( './../plugin_interface' );
const { Session, SESSIONS_NAMESPACE }	= require( '../../components/session/session' );

/**
 * @brief	Adds session the the event request
 */
class SessionPlugin extends PluginInterface
{
	/**
	 * @brief	This plugin depends on having a cache
	 *
	 * @return	Array
	 */
	getPluginDependencies()
	{
		return ['er_cache_server'];
	}

	/**
	 * @brief	creates the namespace when attaching to the server
	 *
	 * @param	Server server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		let cachingServer	= server.getPlugin( 'er_cache_server' ).getServer();
		let callback		= typeof this.options === 'object' && typeof this.options.callback === 'function'
							? this.options.callback
							: ()=>{};

		if ( cachingServer === null )
		{
			throw new Error( `Before adding ${this.getPluginId()}, make sure to start the caching server from 'er_cache_server'` )
		}

		if ( cachingServer.getServerState() === SERVER_STATES.running )
		{
			this.setUpNamespace( cachingServer, callback );
		}
		else
		{
			cachingServer.on( 'state_changed', ( state )=>{
				if ( state === SERVER_STATES.running )
				{
					this.setUpNamespace( cachingServer, callback );
				}
			} );
		}
	}

	/**
	 * @brief	Sets up the namespace of the current server
	 *
	 * @param	DataServer cachingServer
	 * @param	Function callback
	 *
	 * @return	void
	 */
	setUpNamespace( cachingServer, callback )
	{
		cachingServer.existsNamespace( SESSIONS_NAMESPACE ).then( ( exist )=>{
			if ( ! exist )
			{
				cachingServer.createNamespace( SESSIONS_NAMESPACE ).then( callback ).catch( callback );
			}
			else
			{
				callback( false );
			}
		} ).catch( callback );
	}

	/**
	 * @brief	Adds a session to the event request
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		let setUpPluginMiddleware	= {
			handler	: ( event ) =>
			{
				if ( event.session == null )
				{
					event.session	= new Session( event, this.options );

					event.on( 'cleanUp', ()=>{
						event.session	= undefined;
					} );

					event.on( 'send', ()=>{
						event.session.saveSession( ()=>{} );
					} );
				}

				event.next();
			}
		};

		let initSessionForPathMiddleware	= {
			handler	: ( event )=>{
				event.initSession	= ( callback )=>{
					event.session.hasSession( ( hasSession )=>{
						if ( ! hasSession )
						{
							event.session.newSession( callback );
						}
						else
						{
							event.session.fetchSession( callback );
						}
					});
				};

				event.next();
			}
		};

		return [setUpPluginMiddleware, initSessionForPathMiddleware];
	}
}

module.exports	= SessionPlugin;
