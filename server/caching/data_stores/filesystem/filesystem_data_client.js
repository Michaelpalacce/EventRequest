'use strict';
const net	= require( 'net' );
const path	= require( 'path' );

const PIPE_NAME	= path.join( __dirname, 'filesystem_data_client.js' );
const PIPE_PATH	= "\\\\.\\pipe\\" + PIPE_NAME;

let server = net.createServer(function(stream) {
	console.log( 'here' );
	stream.on('data', function( chunk ) {
		console.log( chunk.toString() );
		stream.write( 'Hello there!' );
	});

	stream.on('end', function() {
		server.close();
	});
});

server.listen( PIPE_PATH, ( err )=>{
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
} );
