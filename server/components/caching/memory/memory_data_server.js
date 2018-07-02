'use strict';

const DataServer	= require( '../data_server' );
const cluster		= require( 'cluster' );
const path			= require( 'path' );
const fork			= require( 'child_process' ).fork;
const net			= require( 'net' );

const PIPE_NAME		= path.join( __dirname, 'memory_data_client.js' );
const PIPE_PATH		= "\\\\.\\pipe\\" + PIPE_NAME;

/**
 * @brief	Simple caching server that stores cache in memory
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
	 * @return	Promise
	 */
	forkClient()
	{
		return new Promise( ( resolve, reject )=>{
			let spawnedClient	= fork( path.join( __dirname, './memory_data_client.js' ), [], {
				cwd	: undefined,
				env	: process.env,
			});

			spawnedClient.on( 'error', ( err )=>{
				reject( err );
			});

			spawnedClient.on( 'message', ( message )=>{
				if ( ! message.error )
				{
					let onFulfilled	= ( data )=>{
						resolve( data );
					};
					let onRejected	= ( err )=>{
						reject( err );
					};

					this.doCommand( 'setUp', {} ).then( onFulfilled, onRejected );
				}
				else
				{
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
				error	: true,
				data	: error
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
		return this.ping( options );
	}

	/**
	 * @brief	Sends a ping to the client and if it's down, restarts it
	 *
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	Promise
	 */
	ping( options = {} )
	{
		return new Promise( ( resolve, reject )=>{

			let onFulfilled	= ( data )=>{
				resolve( data );
			};
			let onRejected	= ( err )=>{
				if ( cluster.isMaster )
				{
					let onFulfilled	= ( data )=>{
						resolve( data );
					};
					let onRejected	= ( err )=>{
						reject( err );
					};

					this.forkClient().then( onFulfilled, onRejected );
				}
				else
				{
					resolve( 'Worker found caching server' );
				}
			};

			this.doCommand( 'ping', options ).then( onFulfilled, onRejected );
		});
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
				response.error	= typeof response.error !== 'undefined' ? response.error : true;
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
	touch( namespace, recordName, options = {} )
	{
		return this.doCommand( 'touch', { namespace, recordName, options } );
	}

	/**
	 * @see	DataServer::update()
	 */
	update( namespace, recordName, data = {}, options = {} )
	{
		return this.doCommand( 'update', { namespace, recordName, data, options } );
	}

	/**
	 * @see	DataServer::read()
	 */
	read( namespace, recordName, options = {} )
	{
		return this.doCommand( 'read', { namespace, recordName, options } );
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
		return this.doCommand( 'exit', { options } );
	}
}

module.exports	= MemoryDataServer;