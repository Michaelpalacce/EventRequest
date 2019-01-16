'use strict';

const PluginManagerClass										= require( './plugin_manager' );
const TimeoutPlugin												= require( './available_plugins/timeout_plugin' );
const StaticResourcesPlugin										= require( './available_plugins/static_resources_plugin' );
const MemoryDataServerPlugin									= require( './available_plugins/memory_data_server_plugin' );
const TemplatingEnginePlugin									= require( './available_plugins/templating_engine_plugin' );
const FileStreamHandlerPlugin									= require( './available_plugins/file_stream_handler_plugin' );
const LoggerPlugin												= require( './available_plugins/logger_plugin' );
const BodyParserPlugin											= require( './available_plugins/body_parser_plugin' );
const ResponseCachePlugin										= require( './available_plugins/response_cache_plugin' );
const SessionPlugin												= require( './available_plugins/session_plugin' );
const { MultipartFormParser, JsonBodyParser, FormBodyParser }	= require( './../components/body_parsers/body_parser_handler' );

/**
 * @brief	Constants
 */
let PluginManager				= new PluginManagerClass();

let bodyParserJsonPlugin		= new BodyParserPlugin(
	'er_body_parser_json',
	{
		parsers	: [{ instance : JsonBodyParser }]
	}
);

let bodyParserFormPlugin		= new BodyParserPlugin(
	'er_body_parser_form',
	{
		parsers	: [{ instance : FormBodyParser }]
	}
);

let bodyParserMultipartPlugin	= new BodyParserPlugin(
	'er_body_parser_multipart',
	{
		parsers	: [{ instance : MultipartFormParser }]
	}
);

PluginManager.addPlugin( new TimeoutPlugin( 'er_timeout' ) );
PluginManager.addPlugin( new StaticResourcesPlugin( 'er_static_resources' ) );
PluginManager.addPlugin( new MemoryDataServerPlugin( 'er_cache_server' ) );
PluginManager.addPlugin( new TemplatingEnginePlugin( 'er_templating_engine' ) );
PluginManager.addPlugin( new FileStreamHandlerPlugin( 'er_file_stream' ) );
PluginManager.addPlugin( new LoggerPlugin( 'er_logger' ) );
PluginManager.addPlugin( new BodyParserPlugin( 'er_body_parser' ));
PluginManager.addPlugin( new SessionPlugin( 'er_session' ));
PluginManager.addPlugin( new ResponseCachePlugin( 'er_response_cache' ));
PluginManager.addPlugin( bodyParserJsonPlugin );
PluginManager.addPlugin( bodyParserFormPlugin );
PluginManager.addPlugin( bodyParserMultipartPlugin );

module.exports	= PluginManager;
