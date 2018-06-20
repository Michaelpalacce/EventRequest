'use strict';
const net	= require( 'net' );
const path	= require( 'path' );

const PIPE_NAME		= path.join( __dirname, 'memory_data_client.js' );
const PIPE_PATH		= "\\\\.\\pipe\\" + PIPE_NAME;

/**
 * @brief	Constants
 */
const PING					= 'ping';
const SET_UP				= 'setUp';
const CREATE_NAMESPACE		= 'createNamespace';
const EXISTS_NAMESPACE		= 'existsNamespace';
const CREATE_DATA_RECORD	= 'create';

/**
 * @brief	Memory worker that stores data in memory
 *
 * @return	void
 */
class MemoryWorker
{
	constructor()
	{
		this.data	= {};
		this.setUpServer();
	}

	/**
	 * @brief	Set ups the server for communication
	 *
	 * @return	void
	 */
	setUpServer()
	{
		let server	= net.createServer( ( stream ) => {
			stream.on( 'data', ( chunk ) => {
				chunk	= chunk.toString( 'utf8' );

				try
				{
					chunk	= JSON.parse( chunk );
				}
				catch ( error )
				{
					chunk	= {};
				}

				this.processCommand( chunk, ( error, data ) => {
					error			= typeof error !== 'undefined' ? error : true;
					error			= error instanceof Error ? error.stack : error;
					data			= typeof data !== 'undefined' ? data : {};

					let response	= {
						error	: error,
						data	: data
					};

					stream.end( JSON.stringify( response ) );
				});
			});
		}).listen( PIPE_PATH, ( err )=>{
			process.send(
				{
					error	: typeof err === 'undefined' ? false : err,
					pipe	: PIPE_PATH
				}
			);

			if ( err )
			{
				process.exit();
			}
		});
	}

	/**
	 * @brief	Gets a command given command name and arguments
	 *
	 * @param	String command
	 * @param	Object args
	 *
	 * @return	Function
	 */
	getInternalCommand( command, args, callback )
	{
		command	= typeof command === 'string' ? command : false;
		args	= typeof args === 'object' ? args : false;
		if ( typeof callback !== 'function' )
		{
			throw new Error( 'Callback must be provided' );
		}

		command	= {
			command	: command,
			args	: args
		};

		return () => {
			this.processCommand( command, callback );
		}
	};

	/**
	 * @brief	Processes the given command
	 * @param data
	 * @param callback
	 */
	processCommand( data, callback )
	{
		let command	= data.command;
		let args	= data.args;

		switch ( command )
		{
			case SET_UP:
				callback( false );
				break;

			case EXISTS_NAMESPACE:
				this.existsNamespace( args, callback );
				break;

			case CREATE_NAMESPACE:
				this.createNamespace( args, callback );
				break;

			case PING:
				console.log( 'PINGED!' );
				callback( false, 'pong' );
				break;

			case CREATE_DATA_RECORD:
			default:
				callback( 'Invalid command' );
				break;
		}
	}


	/**
	 * @see	DataServer::existsNamespace
	 */
	existsNamespace( args, callback )
	{
		let namespace	= args.namespace;

		if ( typeof namespace !== 'string' )
		{
			callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
			return;
		}

		callback( false, typeof this.data[namespace] === 'object' );
	};


	/**
	 * @see	DataServer::createNamespace
	 */
	createNamespace( args, callback )
	{
		let namespace	= args.namespace;
		if ( typeof namespace !== 'string' )
		{
			callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
		}
		else
		{
			let command	= this.getInternalCommand( 'existsNamespace', args, ( err, exists )=>{

				if ( ! err && ! exists )
				{
					this.data[namespace]	= {};
					callback( false, namespace );
				}
				else
				{
					callback( 'Namespace already exists' )
				}
			});

			command();
		}
	};
}

let memoryWorker	= new MemoryWorker();
