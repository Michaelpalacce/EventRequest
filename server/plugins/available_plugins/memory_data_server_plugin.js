'use strict';

const PluginInterface		= require( '../plugin_interface' );
const DataServer			= require( '../../components/caching/data_server' );

/**
 * @brief	MemoryDataServerPlugin responsible for
 */
class MemoryDataServerPlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );
		this.server	= new DataServer();
	}

	/**
	 * @brief	Use the server given
	 *
	 * @param	DataServer server
	 *
	 * @return	void
	 */
	use( server )
	{
		if ( server instanceof DataServer )
		{
			this.server	= server;
		}
	}

	/**
	 * @brief	Returns the DataServer
	 *
	 * @returns	DataServer|false
	 */
	getServer()
	{
		return this.server === null ? false : this.server;
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
		let pluginMiddleware	= {
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
