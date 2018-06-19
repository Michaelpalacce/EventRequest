'use strict';

const DataServer	= require( '../data_server' );
const os			= require( 'os' );
const fs			= require( 'fs' );
const path			= require( 'path' );
const fork			= require( 'child_process' ).fork;
const net			= require( 'net' );

const PIPE_NAME	= path.join( __dirname, 'filesystem_data_client.js' );
const PIPE_PATH	= "\\\\.\\pipe\\" + PIPE_NAME;

/**
 * @brief	Simple caching server that stores cache on the file system
 */
class FilesystemDataServer extends DataServer
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
		this.cachingFolder	= typeof options.cachingFolder === 'string'
							? options.cachingFolder
							: os.tmpdir();
	}

	/**
	 * @brief	Creates a new instance of the filesystem_data_client if needed
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	forkClient( callback )
	{
		let spawnedClient	= fork( path.join( __dirname, './filesystem_data_client' ), [], {
			cwd	: undefined,
			env	: process.env,
		} );

		spawnedClient.on( 'error', ( err )=>{
			callback( err );
		});

		spawnedClient.on( 'message', ( message )=>{
			callback( message.status );
		});
	}

	/**
	 * @brief	Establishes a socket connection to the filesystem data client
	 *
	 * @param	Object args
	 * @param	Function callback
	 *
	 * @return	void
	 */
	command( args, callback )
	{
		let responseData	= [];
		let socket	= net.createConnection( PIPE_PATH, ( err ) =>{
			socket.on( 'error', ( err ) => {
				callback( err )
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

				response.error	= typeof response.error === 'boolean' ? response.error : true;
				response.data	= typeof response.data !== 'undefined' ? response.data : {};

				callback( response.error, response.data );
			});

			args	= typeof args === 'object' ? args : {};
			socket.write( JSON.stringify( args ), 'utf8' );
		});
	}

	/**
	 * @see	DataServer::setUp()
	 */
	setUp( options = {}, callback = ()=>{} )
	{
		this.forkClient( callback );
	}

	/**
	 * @brief	Gets a command given command name and arguments
	 *
	 * @param	String command
	 * @param	Object args
	 *
	 * @return	Object
	 */
	getCommand( command, args, callback )
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
			this.command( command, callback );
		}
	}

	/**
	 * @see	DataServer::createNamespace()
	 */
	createNamespace( namespace, options = {}, callback = ()=>{} )
	{
		let command	= this.getCommand( 'createNamespace', { namespace: namespace }, callback );

		command();
	}

	/**
	 * @see	DataServer::existsNamespace()
	 */
	existsNamespace( namespace, options = {}, callback = null )
	{
	}

	/**
	 * @see	DataServer::create()
	 */
	create( namespace, recordName, ttl = 0, data = {}, options = {}, callback = null )
	{
		if ( typeof recordName !== 'string' )
		{
			callback( new Error( `Record should be a string. ${typeof recordName} given.` ) );
		}
		else
		{
			this.existsNamespace( namespace, {}, ( exists ) =>{
				if ( ! exists )
				{
					callback( new Error( `Could not create record in namespace that does not exist.` ) );
				}
				else
				{

				}
			});
		}
	}
}

module.exports	= FilesystemDataServer;