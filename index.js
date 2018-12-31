'use strict';

// Dependencies
const Router			= require( './server/components/routing/router' );
const ErrorHandler		= require( './server/components/error/error_handler' );
const SessionHandler	= require( './server/components/session/session_handler' );
const BodyParserHandler	= require( './server/components/body_parsers/body_parser_handler' );
const PluginInterface	= require( './server/plugins/plugin_interface' );
const PluginManager		= require( './server/plugins/preloaded_plugins' );
const Logging			= require( './server/components/logger/loggur' );
const DataServer		= require( './server/components/caching/data_server' );
const Testing			= require( './server/tester/tester' );
const Server			= require( './server/server' );

module.exports			= {
	Server,				Router,
	ErrorHandler,		DataServer,
	SessionHandler,		BodyParserHandler,
	Testing,			PluginInterface,
	PluginManager,		Logging
};
