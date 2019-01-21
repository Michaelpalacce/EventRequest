'use strict';

const net	= require( 'net' );
const fs	= require( 'fs' );

// If it is windows then create a named pipe if not use UNIX sockets
const isWinOs	= process.platform === 'win32';
const PIPE_PATH	= isWinOs ? "\\\\.\\pipe\\" + __filename : '/tmp/memory_data_client.sock';

/**
 * @brief	Constants
 */
const SET_UP				= 'setUp';
const EXIT					= 'exit';
const CREATE_NAMESPACE		= 'createNamespace';
const EXISTS_NAMESPACE		= 'existsNamespace';
const REMOVE_NAMESPACE		= 'removeNamespace';
const GET_ALL_NAMESPACE		= 'getAll';
const CREATE_DATA_RECORD	= 'create';
const EXISTS_DATA_RECORD	= 'exists';
const TOUCH_DATA_RECORD		= 'touch';
const UPDATE_DATA_RECORD	= 'update';
const READ_DATA_RECORD		= 'read';
const DELETE_DATA_RECORD	= 'delete';

/**
 * @brief	Memory worker that stores data in memory
 *
 * @return	void
 */
class MemoryWorker
{
	constructor()
	{
		this.data			= {};
		this.timeouts		= {};
		this.memoryLimit	= 0;
		this.connections	= {};

		if ( ! isWinOs )
		{
			fs.stat( PIPE_PATH, ( err, stats )=> {
				if ( err )
				{
					this.setUpServer();
					return;
				}

				fs.unlink( PIPE_PATH, ( err )=> {
					if( err )
					{
						process.send({
							error	: true,
							data	: 'Could not unlink socket file'
						});
						process.exit( 0 );
					}

					this.setUpServer();
				});
			});
		}
		else
		{
			this.setUpServer();
		}

		process.on( 'SIGINT', ()=>{
			if( Object.keys( this.connections ).length )
			{
				let clients	= Object.keys( this.connections );
				while( clients.length )
				{
					let client	= clients.pop();
					this.connections[client].write( '__disconnect' );
					this.connections[client].end();
				}
			}
			this.server.close();
			process.exit( 0 );
		});
	}

	/**
	 * @brief	Set ups the server for communication
	 *
	 * @return	void
	 */
	setUpServer()
	{
		// Create a new server
		this.server	= net.createServer( ( stream ) => {
			let self	= Date.now();
			this.connections[self] = (stream);
			stream.on( 'end', ()=>{
				delete this.connections[self];
			});

			// Listen for incoming data
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

				// Process the incoming data
				this.processCommand( chunk, ( error, data ) => {
					error			= typeof error !== 'undefined' ? error : 'Internal error';
					error			= error instanceof Error ? error.stack : error;
					data			= typeof data !== 'undefined' ? data : false;

					let response	= { error, data };

					// Send a response for the incoming data
					stream.end( JSON.stringify( response ) );
				});
			});
		});

		// Start the server listening on the given PIPE
		this.server.listen( PIPE_PATH, ()=>{
			process.send({
				error	: false,
				data	: PIPE_PATH
			});
		} );

		// In case of an error, kill the process and send an error as a response.
		// If the error is EADDRINUSE that means that the server is already set up and in this case we want to ignore the
		// error. Then normal connections should happen.
		this.server.on( 'error', ( err )=>{
			let isNotInUse	= err.message.indexOf( 'EADDRINUSE' ) === -1;

			process.send({
				error	: isNotInUse ? err : false,
				data	: isNotInUse ? err : PIPE_PATH
			});

			if ( isNotInUse )
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
	executeInternalCommand( command, args, callback =()=>{} )
	{
		command	= typeof command === 'string' ? command : false;
		args	= typeof args === 'object' ? args : false;
		if ( typeof callback !== 'function' )
		{
			this.processCommand( '', callback );
		}

		command	= { command, args };

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
	processCommand( data, callback =()=>{} )
	{
		let { command, args }	= data;

		switch ( command )
		{
			case SET_UP:
				if ( typeof args.memoryLimit === 'number' )
				{
					this.memoryLimit	= args.memoryLimit;
				}

				callback( false, 'Caching server is set up' );
				break;

			case EXIT:
				this.server.close();
				callback( false, false );
				process.exit( 1 );
				break;

			case EXISTS_NAMESPACE:
				this.existsNamespace( args, callback );
				break;

			case CREATE_NAMESPACE:
				this.createNamespace( args, callback );
				break;

			case REMOVE_NAMESPACE:
				this.removeNamespace( args, callback );
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

			case UPDATE_DATA_RECORD:
				this.update( args, callback );
				break;

			case READ_DATA_RECORD:
				this.read( args, callback );
				break;

			case DELETE_DATA_RECORD:
				this.delete( args, callback );
				break;

			case GET_ALL_NAMESPACE:
				this.getAll( args, callback );
				break;

			default:
				callback( new Error( 'Invalid command' ) );
				break;
		}
	}

	/**
	 * @brief	Gets all data from namespace
	 *
	 * @param args
	 * @param callback
	 */
	getAll( args, callback =()=>{} )
	{
		this.executeInternalCommand( 'existsNamespace', args, ( err, exists ) =>{
			let { namespace }	= args;

			if ( ! err && exists )
			{
				callback( false, this.data[namespace] );
			}
			else
			{
				callback( new Error( `The namespace ${namespace} does not exist` ) );
			}
		});
	}

	/**
	 * @see	DataServer::delete()
	 */
	delete( args, callback =()=>{} )
	{
		this.executeInternalCommand( 'exists', args, ( err, exists ) => {
			if ( ! err && exists )
			{
				let { namespace, recordName } = args;

				this.clearTimeoutFromData( namespace, recordName );
				delete this.data[namespace][recordName];
				callback( false );
			}
			else
			{
				callback( new Error( 'Record does not exist' ) );
			}
		});
	}

	/**
	 * @see	DataServer::update()
	 */
	read( args, callback =()=>{} )
	{
		this.executeInternalCommand( 'touch', args, ( err ) => {
			if ( ! err )
			{
				let { namespace, recordName }	= args;

				callback( false, this.data[namespace][recordName] );
			}
			else
			{
				callback( err );
			}
		});
	}

	/**
	 * @see	DataServer::update()
	 */
	update( args, callback =()=>{} )
	{
		this.executeInternalCommand( 'touch', args, ( err ) => {
			if ( ! err )
			{
				let { namespace, recordName, data }	= args;
				this.data[namespace][recordName]	= data;
				callback( false );
			}
			else
			{
				callback( err );
			}
		});
	}

	/**
	 * @see	DataServer::exists()
	 */
	exists( args, callback =()=>{} )
	{
		let { namespace, recordName }	= args;
		if ( typeof recordName !== 'string' )
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
	 * @see	DataServer::touch()
	 */
	touch( args, callback =()=>{} )
	{
		this.executeInternalCommand( 'exists', args, ( err, exists ) => {
			if ( ! err && exists )
			{
				let { namespace, recordName } = args;

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
	 * @see	DataServer::create()
	 */
	create( args, callback =()=>{} )
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
						let { namespace, data, recordName }	= args;

						if ( exists )
						{
							this.clearTimeoutFromData( namespace, recordName );
						}

						this.data[namespace][recordName]	= data;
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
	existsNamespace( args, callback =()=>{} )
	{
		let { namespace }	= args;

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
	createNamespace( args, callback =()=>{} )
	{
		let { namespace }	= args;

		this.executeInternalCommand( 'existsNamespace', args, ( err, exists )=>{

			if ( ! err && ! exists )
			{
				this.data[namespace]	= {};
			}

			callback( err === true ? new Error( 'Could not create namespace since it probably exists already' ) : false );
		});
	};

	/**
	 * @see	DataServer::removeNamespace()
	 */
	removeNamespace( args, callback =()=>{} )
	{
		let { namespace }	= args;

		this.executeInternalCommand( 'existsNamespace', args, ( err, exists ) => {
			if ( err )
			{
				callback( err );
			}
			else
			{
				if ( exists )
				{
					Object.keys( this.data[namespace] ).forEach( ( key ) => {
						this.clearTimeoutFromData( namespace, key );
					});
					delete this.data[namespace];

					callback( false );
				}
				else
				{
					callback( false );
				}
			}
		});
	}

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
		this.clearTimeoutFromData( namespace, recordName );

		if ( ttl <= 0 )
		{
			ttl	= 24 * 60 * 60 * 1000;
		}


		let keyPair	= namespace + '||' + recordName;
		this.timeouts[keyPair]	= setTimeout( () => {
			if ( typeof this.data[namespace] !== 'undefined' )
			{
				delete this.data[namespace][recordName];
			}

			delete this.timeouts[keyPair]
		}, ttl );
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
		let keyPair	= namespace + '||' + recordName;

		clearTimeout( this.timeouts[keyPair] );
		delete this.timeouts[keyPair];
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

/**
 * @brief	Checks if the memory is full
 *
 * @return	Boolean
 */
let isMemoryFull	= ()=>{
	let memoryLimit		= memoryWorker.memoryLimit;
	let currentMemory	= process.memoryUsage();
	const used			= currentMemory.heapUsed;

	return memoryLimit < used && memoryLimit !== 0;
};

/**
 * @brief	Frees memory if needed. This will delete the oldest data added
 *
 * @return	void
 */
let freeMemory		= ()=>{
	let latestData	= Object.keys( memoryWorker.timeouts )[0];

	if ( isMemoryFull() && latestData != null )
	{
		let data		= latestData.split( '||' );

		let namespace	= data[0];
		let recordName	= data[1];

		memoryWorker.delete( { namespace, recordName }, freeMemory );
	}
};

setInterval(()=>{
	freeMemory();
}, 20 * 1000 );
