'use strict';

const { runAllTests }	= require( './tests/test_helper' );
const testSuites		= require( './tests/test_suites' );
require( './tests/test_bootstrap' );

const startTests	= () => {
	testSuites.bodyParserSuite();
	testSuites.cacheControlSuite();
	testSuites.eventSuite();
	testSuites.bigMapSuite();
	testSuites.securitySuite();
	testSuites.templatingEngine();
	testSuites.helpersSuite();
	testSuites.errorSuite();
	testSuites.fileStreamSuite();
	testSuites.routingSuite();
	testSuites.loggingSuite();
	testSuites.validationSuite();
	testSuites.pluginsSuite();
	testSuites.serverSuite();
	testSuites.cachingSuite();
	testSuites.rateLimiterSuite();

	runAllTests();
};

startTests();
