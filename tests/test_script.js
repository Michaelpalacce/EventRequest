'use strict';

const { runAllTests }	= require( './testing_suite' );
const eventTest			= require( './server/event_test' );

runAllTests({
	dieOnFirstError	: true
});

module.exports	= {};
