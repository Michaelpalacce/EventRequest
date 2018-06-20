'use strict';

const DataServer	= require( '../data_server' );
const path			= require( 'path' );
const fork			= require( 'child_process' ).fork;
const net			= require( 'net' );

const PIPE_NAME	= path.join( __dirname, 'memory_data_client.js' );
const PIPE_PATH	= "\\\\.\\pipe\\" + PIPE_NAME;

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
		this.pingInterval	= typeof options.pingInterval === 'number'
							? options.pingInterval
							: 60 * 1000; // Default to 1 minute

		this.doPing			= typeof options.doPing === 'boolean'
							? options.doPing
							: true;
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
		} );

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
				this.forkClient( callback )
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

		command	= {
			command	: command,
			args	: args
		};

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
		this.doCommand( 'createNamespace', { namespace: namespace }, callback );
	}

	/**
	 * @see	DataServer::existsNamespace()
	 */
	existsNamespace( namespace, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'existsNamespace', { namespace: namespace }, callback );
	}

	/**
	 * @see	DataServer::create()
	 */
	create( namespace, recordName, data = {}, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'create', { namespace: namespace, recordName: recordName, data: data, options: options }, callback );
	}

	/**
	 * @see	DataServer::exists()
	 */
	exists( namespace, recordName, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'exists', { namespace: namespace, recordName: recordName, options: options }, callback );
	}

	/**
	 * @see	DataServer::touch()
	 */
	touch( namespace, recordName, options = {}, callback = ()=>{} )
	{
		this.doCommand( 'touch', { namespace: namespace, recordName: recordName, options: options }, callback );
	}
}

module.exports	= MemoryDataServer;