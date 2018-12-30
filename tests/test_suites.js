'use strict';

let testSuites	= {};

testSuites.eventSuite		= ()=>{
	require( './server/event_test' );
	require( './server/server_test' );
	require( './server/middleware_container_test' );
};

testSuites.routingSuite		= ()=>{
	require( './server/route_test' );
	require( './server/router_test' );
};

testSuites.loggingSuite		= ()=>{
	require( './server/components/logger/loggur_test' );
	require( './server/components/logger/components/log_test' );
	require( './server/components/logger/components/logger_test' );
	require( './server/components/logger/components/transport_types/transport_test' );
	require( './server/components/logger/components/transport_types/console_test' );
	require( './server/components/logger/components/transport_types/file_test' );
};

testSuites.cachingSuite		= ()=>{
	require( './server/components/caching/data_server_test' );
	require( './server/components/caching/memory/memory_data_server_test' );
};

testSuites.bodyParserSuite	= ()=>{
	require( './server/components/body_parsers/body_parser_handler_test' );
	require( './server/components/body_parsers/body_parser_test' );
	require( './server/components/body_parsers/form_body_parser_test' );
	require( './server/components/body_parsers/json_body_parser_test' );
	require( './server/components/body_parsers/multipart_data_parser_test' );
};

testSuites.validationSuite	= ()=>{
	require( './server/components/validation/validation_rules_test' );
	require( './server/components/validation/validation_attribute_test' );
	require( './server/components/validation/validation_result_test' );
};

module.exports	= testSuites;
