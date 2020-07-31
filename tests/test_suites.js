'use strict';

let testSuites				= {};

testSuites.eventSuite		= () => {
	require( './server/event_request_test' );
};

testSuites.serverSuite		= () => {
	require( './server/server_test' );
	require( './server/server_er_rate_limits_test' );
	require( './server/server_er_body_parsers_test' );
	require( './server/server_er_security_test' );
	require( './server/server_er_logger_test' );
	require( './server/server_er_response_cache_test' );
	require( './server/server_er_timeout_test' );
	require( './server/server_er_env_test' );
	require( './server/server_er_templating_engine_test' );
	require( './server/server_er_session_test' );
	require( './server/server_er_validation_test' );
};

testSuites.securitySuite		= () => {
	require( './server/components/session/session_test' );
	require( './server/components/session/session_with_data_server_map_test' );
	require( './server/components/security/content_security_policy_test' );
	require( './server/components/security/content_type_options_test' );
	require( './server/components/security/expect_ct_test' );
	require( './server/components/security/http_strict_transport_security_test' );
};

testSuites.routingSuite		= () => {
	require( './server/components/routing/route_test' );
	require( './server/components/routing/router_test' );
};

testSuites.loggingSuite		= () => {
	require( './server/components/logger/loggur_test' );
	require( './server/components/logger/components/log_test' );
	require( './server/components/logger/components/logger_test' );
	require( './server/components/logger/components/transport_types/transport_test' );
	require( './server/components/logger/components/transport_types/console_test' );
	require( './server/components/logger/components/transport_types/file_test' );
	require( './server/components/logger/components/transport_types/formatters/colorize_test' );
};

testSuites.cachingSuite		= () => {
	require( './server/components/caching/data_server_test' );
	require( './server/components/caching/data_server_map_test' );
	require( './server/components/caching/data_server_map_big_map_test' );
};

testSuites.templatingEngine		= () => {
	require( './server/components/templating_engine/default_templating_engine_test' );
};

testSuites.rateLimiterSuite		= () => {
	require( './server/components/rate_limiter/bucket_test' );
	require( './server/components/rate_limiter/bucket_with_data_server_map_test' );
};

testSuites.fileStreamSuite		= () => {
	require( './server/components/file_streams/abstract_file_stream_test' );
	require( './server/components/file_streams/file_stream_handler_test' );
	require( './server/components/file_streams/audio_file_stream_test' );
	require( './server/components/file_streams/text_file_stream_test' );
	require( './server/components/file_streams/video_file_stream_test' );
	require( './server/components/file_streams/image_file_stream_test' );
};

testSuites.errorSuite		= () => {
	require( './server/components/error/error_handler_test' );
};

testSuites.helpersSuite		= () => {
	require( './server/components/helpers/unique_id_test' );
};

testSuites.bigMapSuite		= () => {
	require( './server/components/big_map/big_map_test' );
};

testSuites.bodyParserSuite	= () => {
	require( './server/components/body_parsers/body_parser_handler_test' );
	require( './server/components/body_parsers/form_body_parser_test' );
	require( './server/components/body_parsers/json_body_parser_test' );
	require( './server/components/body_parsers/raw_body_parser_test' );
	require( './server/components/body_parsers/multipart_data_parser_test' );
};

testSuites.validationSuite	= () => {
	require( './server/components/validation/validation_rules_test' );
	require( './server/components/validation/validation_attribute_test' );
	require( './server/components/validation/validation_result_test' );
	require( './server/components/validation/validation_handler_test' );
};

testSuites.pluginsSuite		= () => {
	require( './server/plugins/available_plugins/data_server_plugin_test' );
	require( './server/plugins/available_plugins/data_server_plugin_with_map_test' );
	require( './server/plugins/available_plugins/timeout_plugin_test' );
	require( './server/plugins/available_plugins/env_plugin_test' );
	require( './server/plugins/plugin_manager_test' );
	require( './server/plugins/available_plugins/static_resources_plugin_test' );
	require( './server/plugins/available_plugins/session_plugin_test' );
	require( './server/plugins/available_plugins/session_plugin_with_map_test' );
	require( './server/plugins/available_plugins/templating_engine_plugin_test' );
	require( './server/plugins/available_plugins/logger_plugin_test' );
	require( './server/plugins/available_plugins/response_cache_plugin_test' );
	require( './server/plugins/available_plugins/response_cache_plugin_with_map_test' );
	require( './server/plugins/available_plugins/cors_plugin_test' );
	require( './server/plugins/available_plugins/validation_plugin_test' );
};

module.exports	= testSuites;
