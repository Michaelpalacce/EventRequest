'use strict';

const PluginManagerClass		= require( './plugin_manager' );
const TimeoutPlugin				= require( './timeout_plugin' );
const StaticResourcesPlugin		= require( './static_resources_plugin' );

let PluginManager				= new PluginManagerClass();

PluginManager.addPlugin( new TimeoutPlugin( 'event_request_timeout' ) );
PluginManager.addPlugin( new StaticResourcesPlugin( 'event_request_static_resources' ) );

module.exports	= PluginManager;
