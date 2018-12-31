'use strict';

const { runAllTests }	= require( './tests/test_helper' );
const testSuites		= require( './tests/test_suites' );
const { spawnedServer }	= require( './tests/test_bootstrap' );

testSuites.eventSuite();
testSuites.routingSuite();
testSuites.loggingSuite();
testSuites.cachingSuite();
testSuites.bodyParserSuite();
testSuites.validationSuite();
testSuites.pluginsSuite();

runAllTests({
	dieOnFirstError	: true,
	debug			: false,
	silent			: true,
	filter			: '',
	callback		: ( err )=>{
		spawnedServer.kill();
		process.exit( 0 );
	}
});

module.exports	= {};
