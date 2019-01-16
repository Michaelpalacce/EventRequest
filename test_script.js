'use strict';

const { runAllTests }				= require( './tests/test_helper' );
const testSuites					= require( './tests/test_suites' );
const { server, cachingServer }		= require( './tests/test_bootstrap' );

let startTests	= ()=>{
	testSuites.eventSuite();
	testSuites.securitySuite();
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
			server.stop();
			process.exit( 0 );
		}
	});
};

// start the tests after we make sure the caching server is started
setTimeout(()=>{
	startTests();
}, 500 );