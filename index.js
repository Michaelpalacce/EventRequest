'use strict';

// Dependencies
const BodyParserHandler			= require( './server/components/body_parsers/body_parser_handler' );
const PluginInterface			= require( './server/plugins/plugin_interface' );
const Logging					= require( './server/components/logger/loggur' );
const DataServer				= require( './server/components/caching/data_server' );
const Testing					= require( './server/tester/tester' );
const Server					= require( './server/server' );
const FileStream				= require( './server/components/file_streams/file_stream' );
const { Loggur, LOG_LEVELS }	= Logging;

// Holds tools for third party tools
const Development	= {
	PluginInterface, DataServer, FileStream, BodyParserHandler, Testing
};

module.exports		= {
	Server,		Development,
	LOG_LEVELS,	Loggur,
	Logging
};