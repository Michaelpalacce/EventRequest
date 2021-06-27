'use strict';

const { runAllTests }	= require( './tests/test_helper' );
const testSuites		= require( './tests/test_suites' );
require( './tests/test_bootstrap' );

testSuites.cacheControlSuite();
testSuites.rateLimiterSuite();
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
testSuites.bodyParserSuite();
testSuites.cachingSuite();

runAllTests();
