'use strict';

const PluginInterface		= require( '../plugin_interface' );
const InMemoryDataServer	= require( '../../components/caching/in_memory/in_memory_data_server' );
const MemoryDataServer		= require( '../../components/caching/memory/memory_data_server' );
const { DataServer }		= require( '../../components/caching/data_server' );

/**
 * @brief	MemoryDataServerPlugin responsible for starting and stopping the caching server
 */
class MemoryDataServerPlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );
		this.server	= null;
		this.serverConstructor	= InMemoryDataServer;
	}

	/**
	 * @brief	Use the server given
	 *
	 * @details	Supports memory and in_memory servers which will both be set up.
	 * 			If an instance of DataServer is given then that one will be used but it must be already set up
	 *
	 * @param	String|DataServer server
	 *
	 * @return	void
	 */
	use( server )
	{
		if ( server instanceof DataServer )
		{
			this.server	= server;
			return;
		}

		switch ( server )
		{
			case 'memory':
				console.log( 'The MemoryDataServer is DEPRECATED, use InMemoryDataServer Instead' );
				this.serverConstructor	= MemoryDataServer;
				break;

			case 'in_memory':
			default:
				this.serverConstructor	= InMemoryDataServer;
		}
	}

	/**
	 * @brief	Starts the memory server
	 *
	 * @param	function callback
	 *
	 * @return	void
	 */
	startServer( callback = ()=>{} )
	{
		if ( this.server === null )
		{
			this.server	= new this.serverConstructor();

			let onFulfilled	= ()=>{
				callback( false, this.server );
			};
			let onRejected	= ( err )=>{
				this.server	= null;

				callback( err );
			};

			this.server.setUp( this.options ).then( onFulfilled, onRejected );
		}
		else
		{
			callback( false, this.server );
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
	 * @brief	Stops the server if it is started
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	stopServer( callback = ()=>{} )
	{
		if ( this.server !== null )
		{
			let onFulfilled	= ()=>{
				this.server	= null;

				callback( false );
			};
			let onRejected	= ( err )=>{
				callback( err );
			};

			this.server.exit( {} ).then( onFulfilled, onRejected );
		}
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
