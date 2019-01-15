'use strict';

const PluginInterface					= require( './../plugin_interface' );
const { Session, SESSIONS_NAMESPACE }	= require( './../../components/new_session/new_session' );

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


		return [setUpPluginMiddleware];
	}
}

module.exports	= SessionPlugin;
