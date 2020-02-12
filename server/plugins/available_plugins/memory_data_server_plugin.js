'use strict';

const PluginInterface	= require( '../plugin_interface' );
const DataServer		= require( '../../components/caching/data_server' );

/**
 * @brief	MemoryDataServerPlugin responsible for
 */
class MemoryDataServerPlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );
	}

	/**
	 * @brief	Returns the DataServer
	 *
	 * @returns	DataServer
	 */
	getServer()
	{
		if ( this.server )
			return this.server;

		this.dataServerOptions	= typeof options['dataServerOptions'] === 'object'
								? options['dataServerOptions']
								: {};

		return this.server		= options['dataServer'] instanceof DataServer
								? options['dataServer']
								: new DataServer( this.dataServerOptions );
	}

	/**
	 * @brief	Attaches the middleware to the eventRequest
	 *
	 * @details	Attaches a cleanUp event as well
	 *
	 * @returns	Array
	 */
	getPluginMiddleware()
	{
		const pluginMiddleware	= {
			handler	: ( event )=>{
				event.cachingServer	= this.getServer();

				event.on( 'cleanUp', ()=>{
					event.cachingServer	= null;
				} );

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= MemoryDataServerPlugin;
