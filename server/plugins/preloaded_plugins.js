'use strict';

const PluginManager				= require( './plugin_manager' );
const TimeoutPlugin				= require( './available_plugins/timeout_plugin' );
const EnvPlugin					= require( './available_plugins/env_plugin' );
const RateLimitsPlugin			= require( './available_plugins/rate_limits_plugin' );
const StaticResourcesPlugin		= require( './available_plugins/static_resources_plugin' );
const DataServerPlugin			= require( './available_plugins/data_server_plugin' );
const TemplatingEnginePlugin	= require( './available_plugins/templating_engine_plugin' );
const FileStreamHandlerPlugin	= require( './available_plugins/file_stream_handler_plugin' );
const LoggerPlugin				= require( './available_plugins/logger_plugin' );
const BodyParserPlugin			= require( './available_plugins/body_parser_plugin' );
const ResponseCachePlugin		= require( './available_plugins/response_cache_plugin' );
const SessionPlugin				= require( './available_plugins/session_plugin' );
const SecurityPlugin			= require( './available_plugins/security_plugin' );
const CorsPlugin				= require( './available_plugins/cors_plugin' );
const JsonBodyParser			= require( './../components/body_parsers/json_body_parser' );
const MultipartDataParser		= require( './../components/body_parsers/multipart_data_parser' );
const FormBodyParser			= require( './../components/body_parsers/form_body_parser' );
const RawBodyParser				= require( './../components/body_parsers/raw_body_parser' );

/**
 * @brief	Constants
 */
const pluginManager		= new PluginManager();

pluginManager.addPlugin( new TimeoutPlugin( 'er_timeout' ) );
pluginManager.addPlugin( new EnvPlugin( 'er_env' ) );
pluginManager.addPlugin( new RateLimitsPlugin( 'er_rate_limits' ) );
pluginManager.addPlugin( new StaticResourcesPlugin( 'er_static_resources' ) );
pluginManager.addPlugin( new DataServerPlugin( 'er_data_server' ) );
pluginManager.addPlugin( new TemplatingEnginePlugin( 'er_templating_engine' ) );
pluginManager.addPlugin( new FileStreamHandlerPlugin( 'er_file_stream' ) );
pluginManager.addPlugin( new LoggerPlugin( 'er_logger' ) );
pluginManager.addPlugin( new SessionPlugin( 'er_session' ) );
pluginManager.addPlugin( new SecurityPlugin( 'er_security' ) );
pluginManager.addPlugin( new CorsPlugin( 'er_cors' ) );
pluginManager.addPlugin( new ResponseCachePlugin( 'er_response_cache' )) ;
pluginManager.addPlugin( new BodyParserPlugin( JsonBodyParser, 'er_body_parser_json' ) );
pluginManager.addPlugin( new BodyParserPlugin( FormBodyParser, 'er_body_parser_form' ) );
pluginManager.addPlugin( new BodyParserPlugin( MultipartDataParser, 'er_body_parser_multipart' ) );
pluginManager.addPlugin( new BodyParserPlugin( RawBodyParser, 'er_body_parser_raw' ) );

module.exports	= pluginManager;
