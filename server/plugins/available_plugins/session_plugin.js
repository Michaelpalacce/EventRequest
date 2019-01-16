'use strict';

const PluginInterface					= require( './../plugin_interface' );
const { Session, SESSIONS_NAMESPACE }	= require( '../../components/session/session' );

/**
 * @brief	Adds session the the event request
 */
class SessionPlugin extends PluginInterface
{
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

				event.cachingServer.existsNamespace( SESSIONS_NAMESPACE ).then( ( exist )=>{
					if ( ! exist )
					{
						event.cachingServer.createNamespace( SESSIONS_NAMESPACE ).then( event.next ).catch( event.next );
					}
					else
					{
						event.next();
					}
				} ).catch( event.next );
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
