'use strict';

const PluginManagerClass										= require( './plugin_manager' );
const TimeoutPlugin												= require( './available_plugins/timeout_plugin' );
const StaticResourcesPlugin										= require( './available_plugins/static_resources_plugin' );
const MemoryDataServerPlugin									= require( './available_plugins/memory_data_server_plugin' );
const SessionPlugin												= require( './available_plugins/session_plugin' );
const TemplatingEnginePlugin									= require( './available_plugins/templating_engine_plugin' );
const FileStreamHandlerPlugin									= require( './available_plugins/file_stream_handler_plugin' );
const LoggerPlugin												= require( './available_plugins/logger_plugin' );
const BodyParserPlugin											= require( './available_plugins/body_parser_plugin' );
const { MultipartFormParser, JsonBodyParser, FormBodyParser }	= require( './../components/body_parsers/body_parser_handler' );

/**
 * @brief	Constants
 */
let PluginManager				= new PluginManagerClass();

let bodyParserJsonPlugin		= new BodyParserPlugin(
	'event_request_body_parser_json',
	{
		parsers	: [{ instance : JsonBodyParser }]
	}
);

let bodyParserFormPlugin		= new BodyParserPlugin(
	'event_request_body_parser_form',
	{
		parsers	: [{ instance : FormBodyParser }]
	}
);

let bodyParserMultipartPlugin	= new BodyParserPlugin(
	'event_request_body_parser_multipart',
	{
		parsers	: [{ instance : MultipartFormParser }]
	}
);

PluginManager.addPlugin( new TimeoutPlugin( 'event_request_timeout' ) );
PluginManager.addPlugin( new StaticResourcesPlugin( 'event_request_static_resources' ) );
PluginManager.addPlugin( new MemoryDataServerPlugin( 'cache_server' ) );
PluginManager.addPlugin( new SessionPlugin( 'event_request_session' ) );
PluginManager.addPlugin( new TemplatingEnginePlugin( 'event_request_templating_engine' ) );
PluginManager.addPlugin( new FileStreamHandlerPlugin( 'event_request_file_stream' ) );
PluginManager.addPlugin( new LoggerPlugin( 'event_request_logger' ) );
PluginManager.addPlugin( new BodyParserPlugin( 'event_request_body_parser' ));
PluginManager.addPlugin( bodyParserJsonPlugin );
PluginManager.addPlugin( bodyParserFormPlugin );
PluginManager.addPlugin( bodyParserMultipartPlugin );

module.exports	= PluginManager;
