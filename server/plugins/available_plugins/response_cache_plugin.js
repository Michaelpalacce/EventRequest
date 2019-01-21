'use strict';

const PluginInterface	= require( '../plugin_interface' );
const { SERVER_STATES }	= require( '../../components/caching/data_server' );

// Defaults for the plugin
const DEFAULT_TTL		= 60 * 5000;
const DEFAULT_USE_IP	= false;
const NAMESPACE			= 'rcp';
/**
 * @brief	Plugin responsible for caching requests to the cache server.
 */
class ResponseCachePlugin extends PluginInterface
{
	constructor( id, options = {} )
	{
		super( id, options );

		this.model	= null;
	}

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
	 * @brief	Creates a rcp namespace to be used
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

		this.model	= cachingServer.model( NAMESPACE );

		if ( cachingServer.getServerState() === SERVER_STATES.running )
		{
			this.model.createNamespaceIfNotExists().then( callback ).catch( callback );
		}
		else
		{
			cachingServer.on( 'state_changed', ( state )=>{
				if ( state === SERVER_STATES.running )
				{
					this.model.createNamespaceIfNotExists().then( callback ).catch( callback );
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
				let ttl				= this.getTimeToLive( event );
				let recordName		= this.getCacheId( event );

				this.model.make( recordName, { response, code, headers }, { ttl } );
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
				event.on( 'cleanUp', ()=>{
					event.cacheCurrentRequest	= undefined;
				} );

				event.cacheCurrentRequest	= ( options = {}, errCallback = event.next )=>{
					errCallback							= typeof errCallback === 'function' ? errCallback : event.next;
					event.currentResponseCacheConfig	= options;
					let cacheId							= this.getCacheId( event );

					this.model.find( cacheId ).then(( model )=>{
						if ( model === null )
						{
							this.attachCachingEvent( event );
							event.next();
						}
						else
						{
							let ttl	= this.getTimeToLive( event );

							model.touch( ttl ).then(()=>{
								let { response, code, headers }	= model.recordData;
								let headersKeys					= Object.keys( headers );

								headersKeys.forEach(( headerKey )=>{
									let headerValue	= headers[headerKey];

									event.setHeader( headerKey, headerValue );
								});

								event.emit( 'cachedResponse' );
								event.send( response, code );
							}).catch( errCallback );
						}
					});
				};

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= ResponseCachePlugin;