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
		this.cachingServer	= server.getPlugin( 'er_cache_server' ).getServer();
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
						if ( Object.keys( event.session.session ).length !== 0 )
						{
							event.session.saveSession();
						}
					} );
				}

				event.next();
			}
		};

		let initSessionForPathMiddleware	= {
			handler	: ( event )=>{
				event.initSession	= ( callback )=>{
					const hasSession	= event.session.hasSession();

					if ( ! hasSession )
					{
						callback( event.session.newSession() === false );
					}
					else
					{
						callback( event.session.fetchSession() === false );
					}
				};

				event.next();
			}
		};

		return [setUpPluginMiddleware, initSessionForPathMiddleware];
	}
}

module.exports	= SessionPlugin;
