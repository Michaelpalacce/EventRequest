'use strict';

const { test, runAllTests, assert }	= require( './testing_suite' );
const eventTest			= require( './server/event_test' );
const routeTest			= require( './server/route_test' );

runAllTests({
	dieOnFirstError	: true
});

module.exports	= {};
