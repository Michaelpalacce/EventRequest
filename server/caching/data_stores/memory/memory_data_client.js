'use strict';
const net	= require( 'net' );
const path	= require( 'path' );

const PIPE_NAME		= path.join( __dirname, 'memory_data_client.js' );
const PIPE_PATH		= "\\\\.\\pipe\\" + PIPE_NAME;

/**
 * @brief	Constants
 */
const TIMEOUT_OPTION		= 'timeout';

const PING					= 'ping';
const SET_UP				= 'setUp';
const CREATE_NAMESPACE		= 'createNamespace';
const EXISTS_NAMESPACE		= 'existsNamespace';
const CREATE_DATA_RECORD	= 'create';
const EXISTS_DATA_RECORD	= 'exists';
const TOUCH_DATA_RECORD		= 'touch';

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
	 * @return	void
	 */
	executeInternalCommand( command, args, callback )
	{
		command	= typeof command === 'string' ? command : false;
		args	= typeof args === 'object' ? args : false;
		if ( typeof callback !== 'function' )
		{
			this.processCommand( '', callback );
		}

		command	= {
			command	: command,
			args	: args
		};

		this.processCommand( command, callback );
	};

	/**
	 * @brief	Processes the given command
	 *
	 * @param	Object data
	 * @param	Function callback
	 *
	 * @return	void
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
				callback( false, 'pong' );
				break;

			case CREATE_DATA_RECORD:
				this.create( args, callback );
				break;

			case EXISTS_DATA_RECORD:
				this.exists( args, callback );
				break;

			case TOUCH_DATA_RECORD:
				this.touch( args, callback );
				break;

			default:
				callback( new Error( 'Invalid command' ) );
				break;
		}
	}

	/**
	 * @see	DataServer::touch()
	 */
	touch( args, callback )
	{
		this.executeInternalCommand( 'exists', args, ( err, exists ) => {
			if ( ! err && exists )
			{
				let namespace	= args.namespace;
				let recordName	= args.recordName;

				this.clearTimeoutFromData( namespace, recordName );
				this.addTimeoutToData( namespace, recordName, this.getTTL( args ) );
				callback( false );
			}
			else
			{
				callback( new Error( 'Record does not exist' ) );
			}
		});
	}

	/**
	 * @see	DataServer::exists()
	 */
	exists( args, callback )
	{
		let namespace	= args.namespace;
		let recordName	= typeof args.recordName === 'string'
						? args.recordName
						: false;

		if ( ! recordName )
		{
			callback( new Error( 'Invalid record name' ) );
			return;
		}

		this.executeInternalCommand( 'existsNamespace', args, ( err, exists ) =>{
			if ( ! err && exists )
			{
				callback( false, typeof this.data[namespace][recordName] !== 'undefined' )
			}
			else
			{
				callback( false, false );
			}
		});
	}

	/**
	 * @see	DataServer::create()
	 */
	create( args, callback )
	{
		this.executeInternalCommand( 'existsNamespace', args, ( err, exists ) => {
			if ( ! err && exists )
			{
				this.executeInternalCommand( 'exists', args, ( err, exists ) => {
					if ( err )
					{
						callback( err )
					}
					else
					{
						let namespace	= args.namespace;
						let data		= args.data;
						let recordName	= args.recordName;

						if ( exists )
						{
							this.clearTimeoutFromData( namespace, recordName );
						}

						this.data[namespace][recordName]	= { data : data };
						this.addTimeoutToData( namespace, recordName, this.getTTL( args ) );

						callback( false );
					}
				});
			}
			else
			{
				callback( new Error( 'Cannot create record in undefined namespace' ) );
			}
		});
	}

	/**
	 * @see	DataServer::existsNamespace()
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
	 * @see	DataServer::createNamespace()
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
			this.executeInternalCommand( 'existsNamespace', args, ( err, exists )=>{

				if ( ! err && ! exists )
				{
					this.data[namespace]	= {};
				}

				if ( err )
				{
					callback( err );
				}
				else
				{
					callback( false );
				}
			});
		}
	};

	/**
	 * @brief	Adds a timeout to the given data
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Number ttl
	 *
	 * @return	void
	 */
	addTimeoutToData( namespace, recordName, ttl )
	{
		if ( ttl > 0 )
		{
			this.data[namespace][recordName][TIMEOUT_OPTION]	= setTimeout( () => {
				if ( typeof this.data[namespace] !== 'undefined' )
				{
					delete this.data[namespace][recordName];
				}
			}, ttl );
		}
	}

	/**
	 * @brief	Clears up the timeout from the data
	 *
	 * @param	String namespace
	 * @param	String recordName
	 *
	 * @return	void
	 */
	clearTimeoutFromData( namespace, recordName )
	{
		clearInterval( this.data[namespace][recordName][TIMEOUT_OPTION] );
	}

	/**
	 * @brief	Extracts the ttl from the options
	 *
	 * @param	object args
	 *
	 * @return	Number
	 */
	getTTL( args )
	{
		return ( typeof args.options === 'object' && typeof args.options.ttl === 'number' && args.options.ttl > 0 )
				? args.options.ttl
				: 0;
	}
}

let memoryWorker	= new MemoryWorker();
