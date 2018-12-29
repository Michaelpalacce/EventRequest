'use strict';

const { runAllTests }			= require( './test_helper' );
const testSuites				= require( './test_suites' );
const { spawnedServer }			= require( './test_bootstrap' );

testSuites.eventSuite();
testSuites.routingSuite();
testSuites.loggingSuite();
testSuites.cachingSuite();
testSuites.bodyParserSuite();
testSuites.validationSuite();

runAllTests({
	dieOnFirstError	: true,
	debug			: true,
	silent			: false,
	filter			: '',
	callback		: ( err )=>{
		spawnedServer.kill();

		if ( err )
		{
			throw new Error( err );
		}
		else
		{
			process.exit( 0 );
		}
	}
});

module.exports	= {};
