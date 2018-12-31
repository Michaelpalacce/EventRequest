'use strict';

const PluginManagerClass		= require( './plugin_manager' );
const TimeoutPlugin				= require( './timeout_plugin' );
const StaticResourcesPlugin		= require( './static_resources_plugin' );
const MemoryDataServerPlugin	= require( './memory_data_server_plugin' );

let PluginManager				= new PluginManagerClass();

PluginManager.addPlugin( new TimeoutPlugin( 'event_request_timeout' ) );
PluginManager.addPlugin( new StaticResourcesPlugin( 'event_request_static_resources' ) );
PluginManager.addPlugin( new MemoryDataServerPlugin( 'event_request_memory_cache' ) );

module.exports	= PluginManager;
