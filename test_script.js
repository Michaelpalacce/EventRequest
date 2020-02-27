'use strict';

const { runAllTests }	= require( './tests/test_helper' );
const testSuites		= require( './tests/test_suites' );
require( './tests/test_bootstrap' );

let startTests	= ()=>{
	testSuites.pluginsSuite();
	testSuites.securitySuite();
	testSuites.templatingEngine();
	testSuites.rateLimiterSuite();
	testSuites.helpersSuite();
	testSuites.errorSuite();
	testSuites.eventSuite();
	testSuites.routingSuite();
	testSuites.cachingSuite();
	testSuites.loggingSuite();
	testSuites.bodyParserSuite();
	testSuites.validationSuite();

	runAllTests({
		dieOnFirstError	: true,
		debug			: true,
		silent			: false,
		filter			: ''
	});
};

startTests();