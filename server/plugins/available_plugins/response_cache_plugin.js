'use strict';

const PluginInterface			= require( '../plugin_interface' );
const { Loggur, LOG_LEVELS }	= require( '../../components/logger/loggur' );
const { SERVER_STATES }			= require( '../../components/caching/data_server' );

/**
 * @brief	Plugin responsible for caching requests to the cache server.
 */
class ResponseCachePlugin extends PluginInterface
{
	/**
	 * @brief	Dependent on a cache server created by the event request
	 *
	 * @return	Array
	 */
	getPluginDependencies()
	{
		return ['er_cache_server'];
	}

	/**
	 * @brief	Sets up a new namespace
	 *
	 * @param	DataServer cachingServer
	 *
	 * @return	void
	 */
	setUpNamespace( cachingServer )
	{
		let throwOnRejected	= ( err )=>{
			throw new Error( err );
		};

		let logOnSuccess	= ()=>{
			Loggur.log( 'Response Cache Plugin created namespace successfully', LOG_LEVELS.notice );
		};

		cachingServer.existsNamespace( 'rcp' ).then( ( exists )=>{
			if ( ! exists )
			{
				cachingServer.createNamespace( 'rcp' ).then( logOnSuccess ).catch( throwOnRejected );
			}
			else
			{
				logOnSuccess();
			}
		} ).catch( throwOnRejected );
	}

	/**
	 * @brief	Creates a rcp namespace to be used
	 *
	 * @param	Server server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		let cachingServer	= server.getPlugin( 'er_cache_server' ).getServer();

		if ( cachingServer === null )
		{
			throw new Error( `Before adding ${this.getPluginId()}, make sure to start the caching server from 'er_cache_server'` )
		}

		if ( cachingServer.getServerState() === SERVER_STATES.running )
		{
			this.setUpNamespace( cachingServer );
		}
		else
		{
			cachingServer.on( 'state_changed', ( state )=>{
				if ( state === SERVER_STATES.running )
				{
					this.setUpNamespace( cachingServer );
				}
			} );
		}
	}

	/**
	 * @brief	Attaches an event to cache the response on send
	 *
	 * @param	EventRequest event
	 *
	 * @return	void
	 */
	attachCachingEvent( event )
	{
		event.on( 'send', ( responseData )=>{
			let { response, code, headers }	= responseData;

			if ( typeof response === 'string' )
			{
				event.cachingServer.create( 'rcp', event.path, { response, code, headers }, { ttl: 60 * 5000 } ).then();
			}
		} );
	}

	/**
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		let pluginMiddleware	= {
			handler	: ( event ) =>{
				event.cacheCurrentRequest	= ( errCallback )=>{
					errCallback	= typeof errCallback === 'function' ? errCallback : event.next;

					event.cachingServer.exists( 'rcp', event.path ).then( ( exists )=>{

						if ( exists )
						{
							event.cachingServer.read( 'rcp', event.path, { ttl: 60 * 5000 } ).then( ( data )=>{

								let { response, code, headers }	= data;
								let headersKeys					= Object.keys( headers );

								headersKeys.forEach(( headerKey )=>{
									let headerValue	= headers[headerKey];

									event.setHeader( headerKey, headerValue );
								});

								event.emit( 'cachedResponse' );
								event.send( response, code );
							} ).catch( errCallback );
						}
						else
						{
							this.attachCachingEvent( event );
							event.next();
						}
					}).catch( errCallback );
				};

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= ResponseCachePlugin;