'use strict';

const PluginManagerClass		= require( './plugin_manager' );
const TimeoutPlugin				= require( './timeout_plugin' );
const StaticResourcesPlugin		= require( './static_resources_plugin' );
const MemoryDataServerPlugin	= require( './memory_data_server_plugin' );
const SessionPlugin				= require( './session_plugin' );
const TemplatingEnginePlugin	= require( './templating_engine_plugin' );
const FileStreamHandlerPlugin	= require( './file_stream_handler_plugin' );

let PluginManager				= new PluginManagerClass();

PluginManager.addPlugin( new TimeoutPlugin( 'event_request_timeout' ) );
PluginManager.addPlugin( new StaticResourcesPlugin( 'event_request_static_resources' ) );
PluginManager.addPlugin( new MemoryDataServerPlugin( 'cache_server' ) );
PluginManager.addPlugin( new SessionPlugin( 'event_request_session' ) );
PluginManager.addPlugin( new TemplatingEnginePlugin( 'event_request_templating_engine' ) );
PluginManager.addPlugin( new FileStreamHandlerPlugin( 'event_request_file_stream' ) );

module.exports	= PluginManager;
