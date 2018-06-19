'use strict';
const net	= require( 'net' );
const path	= require( 'path' );
const fs	= require( 'fs' );

const PIPE_NAME	= path.join( __dirname, 'filesystem_data_client.js' );
const PIPE_PATH	= "\\\\.\\pipe\\" + PIPE_NAME;

net.createServer( ( stream ) => {
	let requestData	= [];

	stream.on( 'data', ( chunk ) => {
		requestData.push( chunk );
	});

	stream.on( 'end', () => {
		requestData	= Buffer.concat( requestData );
		requestData	= requestData.toString( 'utf8' );
		requestData	= JSON.parse( requestData );

		fileSystemWorker.processCommand( requestData, ( data )=>{
			data	= typeof data === 'object' ? data : {};
			stream.write( JSON.stringify( data ) );
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


let fileSystemWorker	= {};
fileSystemWorker.processCommand		= ( data ) =>{
	console.log( data );
};
fileSystemWorker.existsNamespace	= () =>{
	if ( typeof namespace !== 'string' )
	{
		callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
	}
	else
	{
		let newNamespace	= path.join( this.cachingFolder, namespace );

		this.existsNamespace( newNamespace, {}, ( exists )=>{
			if ( ! exists )
			{
				fs.mkdir( newNamespace, null, callback );
			}
			else
			{
				callback( new Error( `The namespace ${namespace} already exists!` ) );
			}
		});
	}
};
