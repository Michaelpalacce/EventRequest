'use strict';

const PluginInterface			= require( '../plugin_interface' );
const { Loggur, LOG_LEVELS }	= require( '../../components/logger/loggur' );
const { SERVER_STATES }			= require( '../../components/caching/data_server' );

// Defaults for the plugin
const DEFAULT_TTL		= 60 * 5000;
const DEFAULT_USE_IP	= false;
const NAMESPACE			= 'rcp';
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

		cachingServer.existsNamespace( NAMESPACE ).then( ( exists )=>{
			if ( ! exists )
			{
				cachingServer.createNamespace( NAMESPACE ).then( logOnSuccess ).catch( throwOnRejected );
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
				event.cachingServer.create(
					'rcp',
					this.getCacheId( event ),
					{ response, code, headers },
					{ ttl: this.getTimeToLive( event ) }
				).then();
			}
		} );
	}

	/**
	 * @brief	Gets the cache id for the current response that is going to be cached
	 *
	 * @details	This will check if this request should be cached using the client's ip or not
	 *
	 * @param	EventRequest event
	 *
	 * @return	String
	 */
	getCacheId( event )
	{
		let cacheId	= event.path;
		let config	= event.currentResponseCacheConfig;

		let useIp	= typeof config !== 'undefined' && typeof config['useIp'] === 'boolean'
					? config['useIp']
					: typeof this.options !== 'undefined' && typeof this.options['useIp'] === 'boolean'
					? this.options['useIp']
					: DEFAULT_USE_IP;

		if ( useIp === true )
		{
			cacheId	+= event.clientIp;
		}

		return cacheId;
	}

	/**
	 * @brief	Gets the time to live from the config passed or not from the options set
	 *
	 * @param	EventRequest event
	 *
	 * @return	Number
	 */
	getTimeToLive( event )
	{
		let config	= event.currentResponseCacheConfig;

		return typeof config !== 'undefined' && typeof config['ttl'] === 'number'
				? config['ttl']
				: typeof this.options !== 'undefined' && typeof this.options['ttl'] === 'number'
				? this.options['ttl']
				: DEFAULT_TTL;
	}

	/**
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		let pluginMiddleware	= {
			handler	: ( event )	=>{
				event.cacheCurrentRequest	= ( options = {}, errCallback = event.next )=>{
					errCallback							= typeof errCallback === 'function' ? errCallback : event.next;
					event.currentResponseCacheConfig	= options;
					let cacheId							= this.getCacheId( event );

					event.cachingServer.exists( NAMESPACE, cacheId ).then( ( exists )=>{
						if ( exists )
						{
							event.cachingServer.read( NAMESPACE, cacheId, { ttl: this.getTimeToLive( event ) } ).then( ( data )=>{

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