'use strict';

const PluginInterface			= require( '../plugin_interface' );
const { Loggur, LOG_LEVELS }	= require( '../../components/logger/loggur' );
const MemoryDataServer			= require( '../../components/caching/memory/memory_data_server' );

/**
 * @brief	MemoryDataServerPlugin responsible for starting and stopping the caching server
 */
class MemoryDataServerPlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );
		this.server	= null;
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
			this.server	= new MemoryDataServer();

			let onFulfilled	= ( data )=>{
				Loggur.log( data, LOG_LEVELS.info );

				callback( false, this.server );
			};
			let onRejected	= ( err )=>{
				Loggur.log( `Non false returned when trying to setUp caching server: ${err}`, LOG_LEVELS.error );
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
	 * @brief	Returns the MemoryDataServer
	 *
	 * @returns	MemoryDataServer|false
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
				Loggur.log( err, LOG_LEVELS.error );

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
