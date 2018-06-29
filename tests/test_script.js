'use strict';

const { test, runAllTests, assert }	= require( './testing_suite' );
const eventTest						= require( './server/event_test' );
const routeTest						= require( './server/route_test' );
const routerTest					= require( './server/router_test' );
const serverTest					= require( './server/server_test' );
const middlewareContainerTest		= require( './server/middleware_container_test' );
const child_process					= require( 'child_process' );

let spawnedServer					= child_process.spawn(
	'node',
	['tests/server/external_server_for_testing.js'],
	{},
	( error, stdout, stderr )=> {
		console.log( stdout );
		console.error( stderr );
	}
);

runAllTests({
	dieOnFirstError	: true,
	debug			: false,
	silent			: false,
	callback		: ( err )=>{
		spawnedServer.kill();

		if ( err )
		{
			throw new Error( err );
		}
	}
});

module.exports	= {};
