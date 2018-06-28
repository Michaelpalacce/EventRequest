'use strict';

const { test, runAllTests, assert }	= require( './testing_suite' );
const eventTest						= require( './server/event_test' );
const routeTest						= require( './server/route_test' );
const routerTest					= require( './server/router_test' );
const serverTest					= require( './server/server_test' );
const child_process					= require( 'child_process' );
const path							= require( 'path' );

// let spawnedServer	= child_process.exec( 'node tests/server/external_server_for_testing.js', function(error, stdout, stderr){
// 	console.log(stdout);
// });

runAllTests({
	dieOnFirstError	: true
});

// spawnedServer.kill();

module.exports	= {};
