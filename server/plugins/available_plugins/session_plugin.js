'use strict';

const PluginInterface					= require( './../plugin_interface' );
const { Session, SESSIONS_NAMESPACE }	= require( '../../components/session/session' );
const { SERVER_STATES }					= require( '../../components/caching/data_server' );

/**
 * @brief	Adds session the the event request
 */
class SessionPlugin extends PluginInterface
{
	constructor( id, options = {} )
	{
		super( id, options );

		this.model	= null;
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
		let cachingServer	= server.getPlugin( 'er_cache_server' ).getServer();
		let callback		= typeof this.options === 'object' && typeof this.options.callback === 'function'
							? this.options.callback
							: ()=>{};

		if ( cachingServer === null )
		{
			throw new Error( `Before adding ${this.getPluginId()}, make sure to start the caching server from 'er_cache_server'` )
		}

		this.model	= cachingServer.model( SESSIONS_NAMESPACE );

		if ( cachingServer.getServerState() === SERVER_STATES.running )
		{
			this.model.createNamespaceIfNotExists().then( callback ).catch( callback );
		}
		else
		{
			cachingServer.on( 'state_changed', ( state )=>{
				if ( state === SERVER_STATES.running )
				{
					this.model.createNamespaceIfNotExists().then( callback ).catch( callback )
				}
			} );
		}
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
