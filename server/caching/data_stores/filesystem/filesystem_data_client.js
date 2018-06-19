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

		fileSystemWorker.processCommand( chunk, ( response )=>{
			response		= typeof response === 'object' ? response : {};
			response.error	= typeof response.error === 'boolean' ? response.error : true;
			response.data	= typeof response.data !== 'undefined' ? response.data : true;

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
const SET_UP			= 'setUp';
const CREATE_NAMESPACE	= 'createNamespace';
const EXISTS_NAMESPACE	= 'existsNamespace';

let fileSystemWorker	= {};
fileSystemWorker.processCommand		= ( data, callback ) =>{
	console.log( data );
	let command	= data.command;
	let args	= data.args;
	switch ( command )
	{
		case EXISTS_NAMESPACE:
			fileSystemWorker.existsNamespace( args, callback );
			break;
		case CREATE_NAMESPACE:
			fileSystemWorker.createNamespace( args, callback );
			break;
		default:
			callback({
				error	: true,
				data	: 'Invalid command'
			});
	}
};
fileSystemWorker.existsNamespace	= ( args, callback ) => {
	let namespace	= args.namespace;

	if ( typeof namespace !== 'string' )
	{
		callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
		return;
	}

	callback( fs.existsSync( namespace ) );
};

fileSystemWorker.createNamespace	= ( args, callback ) =>{
	let namespace	= args.namespace;

	callback({
		error	: false,
		data	: namespace + ' created!'
	});
	// if ( typeof namespace !== 'string' )
	// {
	// 	callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
	// }
	// else
	// {
	// 	let newNamespace	= path.join( this.cachingFolder, namespace );
	//
	// 	this.existsNamespace( newNamespace, {}, ( exists )=>{
	// 		if ( ! exists )
	// 		{
	// 			fs.mkdir( newNamespace, null, callback );
	// 		}
	// 		else
	// 		{
	// 			callback( new Error( `The namespace ${namespace} already exists!` ) );
	// 		}
	// 	});
	// }
};
