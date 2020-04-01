'use strict';

let testSuites	= {};

testSuites.eventSuite		= ()=>{
	require( './server/event_test' );
};

testSuites.serverSuite		= ()=>{
	require( './server/server_test' );
};

testSuites.securitySuite		= ()=>{
	require( './server/components/session/session_test' );
	require( './server/components/security/content_security_policy_test' );
	require( './server/components/security/content_type_options_test' );
	require( './server/components/security/expect_ct_test' );
	require( './server/components/security/http_strict_transport_security' );
};

testSuites.routingSuite		= ()=>{
	require( './server/components/routing/route_test' );
	require( './server/components/routing/router_test' );
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
};

testSuites.templatingEngine		= ()=>{
	require( './server/components/templating_engine/default_templating_engine_test' );
};

testSuites.rateLimiterSuite		= ()=>{
	require( './server/components/rate_limiter/bucket_test' );
};

testSuites.errorSuite		= ()=>{
	require( './server/components/error/error_handler_test' );
};

testSuites.helpersSuite		= ()=>{
	require( './server/components/helpers/unique_id_test' );
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

testSuites.pluginsSuite		= ()=>{
	require( './server/plugins/available_plugins/memory_data_server_plugin_test' );
	require( './server/plugins/available_plugins/timeout_plugin_test' );
	require( './server/plugins/available_plugins/env_plugin_test' );
	require( './server/plugins/plugin_manager_test' );
	require( './server/plugins/available_plugins/static_resources_plugin_test' );
	require( './server/plugins/available_plugins/session_plugin_test' );
	require( './server/plugins/preloaded_plugins_test' );
	require( './server/plugins/available_plugins/templating_engine_plugin_test' );
	require( './server/plugins/available_plugins/logger_plugin_test' );
	require( './server/plugins/available_plugins/response_cache_plugin_test' );
};

module.exports	= testSuites;
