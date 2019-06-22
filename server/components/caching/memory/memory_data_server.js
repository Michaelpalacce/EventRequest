'use strict';

//@DEPRECATED
const { DataServer, SERVER_STATES }	= require( '../data_server' );
const path							= require( 'path' );
const fork							= require( 'child_process' ).fork;
const net							= require( 'net' );

const PIPE_NAME						= path.join( __dirname, 'memory_data_client.js' );
const PIPE_PATH						= process.platform === 'win32' ? "\\\\.\\pipe\\" + PIPE_NAME : '/tmp/memory_data_client.sock';

/**
 * @brief	Simple caching server that stores cache in memory
 *
 * @deprecated
 */
class MemoryDataServer extends DataServer
{
	constructor( options = {} )
	{
		super( options );
	}

	/**
	 * @see	DataServer::sanitize()
	 */
	sanitize( options )
	{
	}

	/**
	 * @brief	Creates a new instance of the memory_data_client if needed
	 *
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	forkClient( options )
	{
		return new Promise( ( resolve, reject )=>{
			let spawnedClient	= fork( path.join( __dirname, './memory_data_client.js' ), [], {
				cwd	: undefined,
				env	: process.env,
			});

			spawnedClient.on( 'error', ( err )=>{
				this.changeServerState( SERVER_STATES.startupError );
				reject( err );
			});

			spawnedClient.on( 'message', ( message )=>{
				if ( ! message.error )
				{
					let onFulfilled	= ( data )=>{
						this.changeServerState( SERVER_STATES.running );
						resolve( data );
					};

					let onRejected	= ( err )=>{
						this.changeServerState( SERVER_STATES.startupError );
						reject( err );
					};

					this.doCommand( 'setUp', options ).then( onFulfilled, onRejected );
				}
				else
				{
					this.changeServerState( SERVER_STATES.startupError );

					reject( message.error );
				}
			});
		});
	}

	/**
	 * @brief	Establishes a socket connection to the memory_data_client
	 *
	 * @param	Object args
	 * @param	Function callback
	 *
	 * @return	void
	 */
	command( args, callback )
	{
		let responseData	= [];
		let socket			= net.createConnection( PIPE_PATH );

		socket.on( 'connect', () =>{
			args	= typeof args === 'object' ? args : {};
			socket.write( JSON.stringify( args ), 'utf8' );
		});

		socket.on( 'error', ( error )=>{
			callback({
				error	: error
			});
		});

		socket.on( 'data', ( data ) => {
			responseData.push( data );
		});

		socket.on( 'end', () => {
			let response	= Buffer.concat( responseData ).toString( 'utf8' );

			try
			{
				response	= JSON.parse( response );
			}
			catch ( error )
			{
				response	= {};
			}

			callback( response );
		});
	}

	/**
	 * @see	DataServer::setUp()
	 */
	setUp( options = {} )
	{
		this.changeServerState( SERVER_STATES.starting );

		return this.forkClient( options );
	}

	/**
	 * @brief	Gets a command given command name and arguments
	 *
	 * @param	String command
	 * @param	Object args
	 *
	 * @return	Promise
	 */
	doCommand( command, args )
	{
		command	= typeof command === 'string' ? command : false;
		args	= typeof args === 'object' ? args : false;

		command	= { command, args };

		return new Promise( ( resolve, reject )=>{
			this.command( command, ( response ) =>{
				response.error	= typeof response.error !== 'undefined' ? response.error : 'An error has occurred';
				response.data	= typeof response.data !== 'undefined' ? response.data : {};

				if ( response.error !== false )
				{
					reject( response.error );
				}
				else
				{
					resolve( response.data );
				}
			});
		});
	}

	/**
	 * @see	DataServer::createNamespace()
	 */
	createNamespace( namespace, options = {} )
	{
		return this.doCommand( 'createNamespace', { namespace, options } );
	}

	/**
	 * @see	DataServer::existsNamespace()
	 */
	existsNamespace( namespace, options = {} )
	{
		return this.doCommand( 'existsNamespace', { namespace, options } );
	}

	/**
	 * @see	DataServer::removeNamespace()
	 */
	removeNamespace( namespace, options = {} )
	{
		return this.doCommand( 'removeNamespace', { namespace, options } );
	}

	/**
	 * @see	DataServer::create()
	 */
	create( namespace, recordName, data = {}, options = {} )
	{
		return this.doCommand( 'create', { namespace, recordName, data, options } );
	}

	/**
	 * @see	DataServer::exists()
	 */
	exists( namespace, recordName, options = {} )
	{
		return this.doCommand( 'exists', { namespace, recordName, options } );
	}

	/**
	 * @see	DataServer::touch()
	 */
	touch( namespace, recordName, options = { ttl : 0 } )
	{
		return this.doCommand( 'touch', { namespace, recordName, options } );
	}

	/**
	 * @see	DataServer::read()
	 */
	read( namespace, recordName, options = {} )
	{
		return this.doCommand( 'read', { namespace, recordName, options } );
	}

	/**
	 * @see	DataServer::update()
	 */
	update( namespace, recordName, data = {}, options = {} )
	{
		return this.doCommand( 'update', { namespace, recordName, data, options } );
	}

	/**
	 * @see	DataServer::delete()
	 */
	delete( namespace, recordName, options = {} )
	{
		return this.doCommand( 'delete', { namespace, recordName, options } );
	}

	/**
	 * @see	DataServer::getAll()
	 */
	getAll( namespace, options = {} )
	{
		return this.doCommand( 'getAll', { namespace, options } );
	}

	/**
	 * @see	DataServer::exit()
	 */
	exit( options = {} )
	{
		this.changeServerState( SERVER_STATES.stopping );

		return new Promise( ( resolve, reject )=>{
			let onFulfilled	= ( data )=>{
				this.changeServerState( SERVER_STATES.stopped );

				resolve( data );
			};

			let onRejected	= ( err )=>{
				this.changeServerState( SERVER_STATES.stoppingError );

				reject( err );
			};

			this.doCommand( 'exit', { options } ).then( onFulfilled, onRejected )
		});
	}
}

module.exports	= MemoryDataServer;