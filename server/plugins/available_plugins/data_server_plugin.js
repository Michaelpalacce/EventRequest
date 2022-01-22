'use strict';

const PluginInterface	= require( '../plugin_interface' );
const DataServer		= require( '../../components/caching/data_server' );

/**
 * @brief	DataServerPlugin responsible for creating a data server that other components can use
 */
class DataServerPlugin extends PluginInterface {
	constructor( pluginId, options = {} ) {
		super( pluginId, options );
	}

	/**
	 * @brief	Returns the DataServer
	 *
	 * @returns	DataServer
	 */
	getServer() {
		if ( this.server )
			return this.server;

		this.dataServerOptions	= typeof this.options.dataServerOptions === 'object'
								? this.options.dataServerOptions
								: {};

		return this.server		= this.isValidDataServer( this.options.dataServer )
								? this.options.dataServer
								: new DataServer( this.dataServerOptions );
	}

	/**
	 * @brief	Uses Duck-Typing to check if the Data Server is a valid data server
	 *
	 * @property	{Object} dataServer
	 *
	 * @return {boolean}
	 */
	isValidDataServer( dataServer ) {
		if ( typeof dataServer !== 'object' )
			return false;

		if ( dataServer instanceof DataServer )
			return true;

		let isValid					= true;
		const mandatoryFunctions	= ['get', 'set', 'delete', 'lock', 'unlock', 'increment', 'decrement', 'stop', 'touch', '_configure'];

		mandatoryFunctions.forEach( ( value ) => {
			if ( typeof dataServer[value] !== 'function' )
				isValid	= false;
		});

		return isValid;
	}


	/**
	 * @brief	Attaches the middleware to the eventRequest
	 *
	 * @details	Attaches a cleanUp event as well
	 *
	 * @returns	Array
	 */
	getPluginMiddleware() {
		const pluginMiddleware	= {
			handler	: ( event ) => {
				event.dataServer	= this.getServer();

				event.on( 'cleanUp', () => {
					event.dataServer	= null;
				});

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= DataServerPlugin;
