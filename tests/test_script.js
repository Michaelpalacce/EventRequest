'use strict';

const { test, runAllTests, assert }	= require( './testing_suite' );
const eventTest						= require( './server/event_test' );
const routeTest						= require( './server/route_test' );
const routerTest					= require( './server/router_test' );
const serverTest					= require( './server/server_test' );

runAllTests({
	dieOnFirstError	: true,
	// silent			: true,
	// debug			: true
});

module.exports	= {};
