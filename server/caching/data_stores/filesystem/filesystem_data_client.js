'use strict';
const net	= require( 'net' );
const path	= require( 'path' );
const fs	= require( 'fs' );

const PIPE_NAME	= path.join( __dirname, 'filesystem_data_client.js' );
const PIPE_PATH	= "\\\\.\\pipe\\" + PIPE_NAME;

net.createServer( ( stream ) => {
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

		fileSystemWorker.processCommand( chunk, ( error, data ) => {
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

/**
 * @brief	Constants
 */
const SET_UP				= 'setUp';
const CREATE_NAMESPACE		= 'createNamespace';
const EXISTS_NAMESPACE		= 'existsNamespace';

let fileSystemWorker		= {};
fileSystemWorker.options	= {};

fileSystemWorker.processCommand		= ( data, callback ) =>{
	let command	= data.command;
	let args	= data.args;
	
	switch ( command )
	{
		case SET_UP:
			fileSystemWorker.setUp( args, callback );
			break;

		case EXISTS_NAMESPACE:
			fileSystemWorker.existsNamespace( args, callback );
			break;

		case CREATE_NAMESPACE:
			fileSystemWorker.createNamespace( args, callback );
			break;

		default:
			callback( 'Invalid command' );
			break;
	}
};

/**
 * @brief	Set up the fileSystemWorker
 *
 * @param	Object args
 * @param	Function callback
 *
 * @return	void
 */
fileSystemWorker.setUp				= ( args, callback ) => {
	fileSystemWorker.options.setUp			= true;
	fileSystemWorker.options.cachingFolder	= typeof args.cachingFolder === 'string' ? args.cachingFolder : false;

	if ( ! fileSystemWorker.options.cachingFolder )
	{
		callback( new Error( 'cachingFolder must be provided and must be a String.' ) );
	}
	else
	{
		let exists	= fs.existsSync( fileSystemWorker.options.cachingFolder );

		if ( ! exists )
		{
			fileSystemWorker.createCachingFolder( callback );
		}
		else
		{
			fs.rmdir( fileSystemWorker.options.cachingFolder, ( err ) => {
				if ( ! err )
				{
					fileSystemWorker.createCachingFolder( callback );
				}
				else
				{
					callback( `Found old Cache dir and could not remove it, reason: ${err}` );
				}
			});
		}
	}
};

/**
 * @brief	Creates the caching folder
 *
 * @param	Function callback
 *
 * @return	void
 */
fileSystemWorker.createCachingFolder	= ( callback ) => {
	fs.mkdir( fileSystemWorker.options.cachingFolder, null, ( err ) =>{
		if ( err )
		{
			callback( `Could not create the caching folder, reason: ${err}` );
		}
		else
		{
			callback( false );
		}
	});
};

/**
 * @see	DataServer::existsNamespace
 */
fileSystemWorker.existsNamespace	= ( args, callback ) => {
	let namespace	= args.namespace;

	if ( typeof namespace !== 'string' )
	{
		callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
		return;
	}

	callback( false, fs.existsSync( namespace ) );
};

/**
 * @see	DataServer::createNamespace
 */
fileSystemWorker.createNamespace	= ( args, callback ) =>{
	let namespace	= args.namespace;
	if ( typeof namespace !== 'string' )
	{
		callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
	}
	else
	{
		let newNamespace	= path.join( fileSystemWorker.options.cachingFolder, namespace );

		fileSystemWorker.existsNamespace( { namespace : newNamespace }, ( err, exists )=>{
			if ( ! exists )
			{
				fs.mkdir( newNamespace, null, ( err ) =>{
					if ( err )
					{
						callback( `Could not create the namespace, reason: ${err}` );
					}
					else
					{
						callback( false );
					}
				} );
			}
			else
			{
				callback( new Error( `The namespace ${namespace} already exists!` ) );
			}
		});
	}
};
