'use strict';

const { runAllTests }	= require( './tests/test_helper' );
const testSuites		= require( './tests/test_suites' );
const { server }		= require( './tests/test_bootstrap' );

// testSuites.eventSuite();
// testSuites.routingSuite();
// testSuites.loggingSuite();
// testSuites.cachingSuite();
// testSuites.bodyParserSuite();
// testSuites.validationSuite();
testSuites.pluginsSuite();

runAllTests({
	dieOnFirstError	: true,
	debug			: false,
	silent			: true,
	filter			: '',
	callback		: ( err )=>{
		server.stop();
		process.exit( 0 );
	}
});

module.exports	= {};
