'use strict';

const PluginInterface	= require( '../plugin_interface' );

// Defaults for the plugin
const DEFAULT_TTL		= 60 * 5000;
const DEFAULT_USE_IP	= false;

/**
 * @brief	Plugin responsible for caching requests to the cache server.
 *
 * @deprecated	This will be removed completely from the server, it will not be supported at all anymore.
 */
class ResponseCachePlugin extends PluginInterface {
	constructor( id, options = {} ) {
		super( id, options );
		this.dataServer	= null;
	}

	/**
	 * @brief	Dependent on a cache server created by the event request
	 *
	 * @return	Array
	 */
	getPluginDependencies() {
		return ['er_data_server'];
	}

	/**
	 * @brief	Creates a rcp namespace to be used
	 *
	 * @property	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server ) {
		this.dataServer	= server.getPlugin( 'er_data_server' ).getServer();

		server.define( 'cache.request', ( event ) => {
			event.cacheCurrentRequest();
		});
	}

	/**
	 * @brief	Gets the cache id for the current response that is going to be cached
	 *
	 * @details	This will check if this request should be cached using the client's ip or not
	 *
	 * @property	{EventRequest} event
	 *
	 * @return	String
	 */
	getCacheId( event ) {
		let cacheId		= event.path;
		const config	= event.currentResponseCacheConfig;

		const useIp		= typeof config !== 'undefined' && typeof config.useIp === 'boolean'
						? config.useIp
						: typeof this.options !== 'undefined' && typeof this.options.useIp === 'boolean'
						? this.options.useIp
						: DEFAULT_USE_IP;

		if ( useIp === true )
			cacheId	+= event.clientIp;

		return cacheId;
	}

	/**
	 * @brief	Gets the time to live from the config passed or not from the options set
	 *
	 * @property	{EventRequest} event
	 *
	 * @return	Number
	 */
	getTimeToLive( event ) {
		const config	= event.currentResponseCacheConfig;

		return typeof config !== 'undefined' && typeof config.ttl === 'number'
				? config.ttl
				: typeof this.options !== 'undefined' && typeof this.options.ttl === 'number'
				? this.options.ttl
				: DEFAULT_TTL;
	}

	/**
	 * @return	Array
	 */
	getPluginMiddleware() {
		const pluginMiddleware	= {
			handler	: ( event ) => {
				event.on( 'cleanUp', () => {
					event.cacheCurrentRequest	= undefined;
				});

				event.cacheCurrentRequest	= async ( options = {} ) => {
					event.currentResponseCacheConfig	= options;
					const cacheId						= this.getCacheId( event );
					const cachedDataSet					= await this.dataServer.get( cacheId );

					if ( cachedDataSet === null ) {
						event.on( 'send', ( { payload, code } ) => {
							if ( code < 200 || code >= 300 )
								return;

							const response		= Buffer.isBuffer( payload ) ? payload.toString() : payload;
							const headers		= event.response.getHeaders();
							const ttl			= this.getTimeToLive( event );
							const recordName	= this.getCacheId( event );

							this.dataServer.set( recordName, { response, code, headers }, ttl, { persist: false } );
						});

						event.next();
					}
					else {
						await this.dataServer.touch( cacheId, this.getTimeToLive( event ) );

						const { response, code, headers }	= cachedDataSet;
						const headersKeys					= Object.keys( headers );

						headersKeys.forEach(( headerKey ) => {
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
