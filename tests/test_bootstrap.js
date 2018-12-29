'use strict';

const child_process				= require( 'child_process' );

let spawnedServer				= child_process.spawn(
	'node',
	['tests/external_server_for_testing.js'],
	{},
	( error, stdout, stderr )=> {
		console.log( error );
		console.log( stdout );
		console.error( stderr );
	}
);

module.exports	= {
	spawnedServer
};
