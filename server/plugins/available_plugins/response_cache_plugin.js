'use strict';

const PluginInterface	= require( '../plugin_interface' );

// Defaults for the plugin
const DEFAULT_TTL		= 60 * 5000;
const DEFAULT_USE_IP	= false;
/**
 * @brief	Plugin responsible for caching requests to the cache server.
 */
class ResponseCachePlugin extends PluginInterface
{
	constructor( id, options = {} )
	{
		super( id, options );
		this.cachingServer	= null;
	}

	/**
	 * @brief	Dependent on a cache server created by the event request
	 *
	 * @return	Array
	 */
	getPluginDependencies()
	{
		return ['er_data_server'];
	}

	/**
	 * @brief	Creates a rcp namespace to be used
	 *
	 * @param	server Server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.cachingServer	= server.getPlugin( 'er_data_server' ).getServer();

		server.define( 'cache.request', ( event )=>{
			event.cacheCurrentRequest();
		} );
	}

	/**
	 * @brief	Attaches an event to cache the response on send
	 *
	 * @param	event EventRequest
	 *
	 * @return	void
	 */
	attachCachingEvent( event )
	{
		event.on( 'send', async ( responseData )=>{
			if ( typeof responseData.response === 'undefined' )
				return;

			const { response, code, headers }	= responseData;

			if ( typeof response === 'string' )
			{
				const ttl			= this.getTimeToLive( event );
				const recordName	= this.getCacheId( event );

				await this.cachingServer.set( recordName, { response, code, headers }, ttl, { persist: false } );
			}
		} );
	}

	/**
	 * @brief	Gets the cache id for the current response that is going to be cached
	 *
	 * @details	This will check if this request should be cached using the client's ip or not
	 *
	 * @param	event EventRequest
	 *
	 * @return	String
	 */
	getCacheId( event )
	{
		let cacheId		= event.path;
		const config	= event.currentResponseCacheConfig;

		const useIp		= typeof config !== 'undefined' && typeof config['useIp'] === 'boolean'
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
	 * @param	event EventRequest
	 *
	 * @return	Number
	 */
	getTimeToLive( event )
	{
		const config	= event.currentResponseCacheConfig;

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
		const pluginMiddleware	= {
			handler	: ( event )	=>{
				event.on( 'cleanUp', ()=>{
					event.cacheCurrentRequest	= undefined;
				} );

				event.cacheCurrentRequest	= async ( options = {} )=>{
					event.currentResponseCacheConfig	= options;
					const cacheId						= this.getCacheId( event );
					const cachedDataSet					= await this.cachingServer.get( cacheId );

					if ( cachedDataSet === null )
					{
						this.attachCachingEvent( event );
						event.next();
					}
					else
					{
						const ttl		= this.getTimeToLive( event );
						const status	= await this.cachingServer.touch( cacheId, ttl );

						if ( ! status )
						{
							await this.cachingServer.set( cacheId, cachedDataSet, ttl, { persist: false } );
						}

						const { response, code, headers }	= cachedDataSet;
						const headersKeys					= Object.keys( headers );

						headersKeys.forEach(( headerKey )=>{
							const headerValue	= headers[headerKey];

							event.setResponseHeader( headerKey, headerValue );
						});

						event.emit( 'cachedResponse' );
						event.send( response, code );
					}
				};

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= ResponseCachePlugin;