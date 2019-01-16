'use strict';

// Dependencies
const Router					= require( './server/components/routing/router' );
const SessionHandler			= require( './server/components/session/session_handler' );
const BodyParserHandler			= require( './server/components/body_parsers/body_parser_handler' );
const PluginInterface			= require( './server/plugins/plugin_interface' );
const PluginManager				= require( './server/plugins/preloaded_plugins' );
const Logging					= require( './server/components/logger/loggur' );
const DataServer				= require( './server/components/caching/data_server' );
const Testing					= require( './server/tester/tester' );
const ServerClass				= require( './server/server' );
const { Loggur, LOG_LEVELS }	= Logging;

// Holds the instance of the server class
let serverInstance	= null;

// Callback to create a new Server
let Server	= ( options )=>{
	if ( serverInstance == null )
	{
		serverInstance	= new ServerClass( options );
	}

	return serverInstance;
};

module.exports	= {
	Server,			Router,
	DataServer,		PluginManager,
	SessionHandler,	BodyParserHandler,
	Testing,		PluginInterface,
	Logging,		Loggur,
	LOG_LEVELS
};
