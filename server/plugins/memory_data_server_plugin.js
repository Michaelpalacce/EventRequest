'use strict';

const PluginInterface			= require( './plugin_interface' );
const { Loggur, LOG_LEVELS }	= require( './../components/logger/loggur' );
const MemoryDataServer			= require( './../components/caching/memory/memory_data_server' );

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
	 * @return	void
	 */
	startServer()
	{
		if ( this.server === null )
		{
			this.server	= new MemoryDataServer();

			let onFulfilled	= ( data )=>{
				Loggur.log({
						level	: LOG_LEVELS.info,
						message	: data
					}
				);
			};
			let onRejected	= ( err )=>{
				Loggur.log({
						level	: LOG_LEVELS.error,
						message	: err
					}
				);
			};

			this.server.setUp( this.options ).then( onFulfilled, onRejected );
		}
	}

	/**
	 * @brief	Stops the server if it is started
	 *
	 * @return	void
	 */
	stopServer()
	{
		if ( this.server !== null )
		{
			let onFulfilled	= ()=>{
				this.server	= null;
			};
			let onRejected	= ( err )=>{
				Loggur.log({
					level	: LOG_LEVELS.error,
					message	: err
				});
			};

			this.server.exit( {} ).then( onFulfilled, onRejected );
		}
	}
}

module.exports	= MemoryDataServerPlugin;
