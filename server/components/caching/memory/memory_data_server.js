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
	 * @param	Function callback
	 *
	 * @return	void
	 */
	forkClient( callback )
	{
		let spawnedClient	= fork( path.join( __dirname, './memory_data_client' ), [], {
			cwd	: undefined,
			env	: process.env,
		});

		spawnedClient.on( 'error', ( err )=>{
			callback( err );
		});

		spawnedClient.on( 'message', ( message )=>{
			if ( ! message.status )
			{
				this.doCommand( 'setUp', {}, callback );
			}
			else
			{
				callback( message.status );
			}
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
	setUp( options = {}, callback = ()=>{} )
	{
		this.ping( options, callback );
	}

	/**
	 * @brief	Sends a ping to the client and if it's down, restarts it
	 *
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	ping( options = {}, callback = ()=>{} )
	{
		this.doCommand( 'ping', {}, ( err, data ) => {
			if ( err || data !== 'pong' )
			{
				if ( cluster.isMaster )
				{
					this.forkClient( callback )
				}
				else
				{
					callback( false, 'Worker found caching server' );
				}
			}
			else
			{
				callback( err, data );
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
	doCommand( command, args, callback )
	{
		command	= typeof command === 'string' ? command : false;
		args	= typeof args === 'object' ? args : false;
		if ( typeof callback !== 'function' )
		{
			throw new Error( 'Callback must be provided' );
		}

		command	= { command, args };

		this.command( command, ( response ) =>{
			response.error	= typeof response.error !== 'undefined' ? response.error : true;
			response.data	= typeof response.data !== 'undefined' ? response.data : {};

			callback( response.error, response.data );
		});
	}

	/**
	 * @see	DataServer::createNamespace()
	 */
	createNamespace( namespace, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'createNamespace', { namespace, options  }, callback );
	}

	/**
	 * @see	DataServer::existsNamespace()
	 */
	existsNamespace( namespace, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'existsNamespace', { namespace, options  }, callback );
	}

	/**
	 * @see	DataServer::removeNamespace()
	 */
	removeNamespace( namespace, options = {}, callback = null )
	{
		this.doCommand( 'removeNamespace', { namespace, options  }, callback );
	}

	/**
	 * @see	DataServer::create()
	 */
	create( namespace, recordName, data = {}, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'create', { namespace, recordName, data, options }, callback );
	}

	/**
	 * @see	DataServer::exists()
	 */
	exists( namespace, recordName, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'exists', { namespace, recordName, options }, callback );
	}

	/**
	 * @see	DataServer::touch()
	 */
	touch( namespace, recordName, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'touch', { namespace, recordName, options }, callback );
	}

	/**
	 * @see	DataServer::update()
	 */
	update( namespace, recordName, data = {}, options = {}, callback = null )
	{
		this.doCommand( 'update', { namespace, recordName, data, options }, callback );
	}

	/**
	 * @see	DataServer::read()
	 */
	read( namespace, recordName, options = {}, callback = null )
	{
		this.doCommand( 'read', { namespace, recordName, options }, callback );
	}

	/**
	 * @see	DataServer::delete()
	 */
	delete( namespace, recordName, options = {}, callback = null )
	{
		this.doCommand( 'delete', { namespace, recordName, options }, callback );
	}

	/**
	 * @see	DataServer::getAll()
	 */
	getAll( namespace, options = {}, callback = null )
	{
		this.doCommand( 'getAll', { namespace, options }, callback );
	}

	/**
	 * @see	DataServer::exit()
	 */
	exit( options = {}, callback = null )
	{
		this.doCommand( 'exit', { options }, callback );
	}
}

module.exports	= MemoryDataServer;