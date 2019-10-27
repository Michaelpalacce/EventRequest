'use strict';

// Dependencies
const BodyParserHandler			= require( './server/components/body_parsers/body_parser_handler' );
const PluginInterface			= require( './server/plugins/plugin_interface' );
const Logging					= require( './server/components/logger/loggur' );
const DataServer				= require( './server/components/caching/data_server' );
const Bucket					= require( './server/components/rate_limiter/bucket' );
const Testing					= require( './server/tester/tester' );
const ServerClass				= require( './server/server' );
const { Loggur, LOG_LEVELS }	= Logging;

// Holds the instance of the server class
let serverInstance	= null;

// Callback to create a new Server
let Server			= ( options )=>{
	if ( serverInstance == null )
	{
		serverInstance	= new ServerClass( options );
	}

	return serverInstance;
};

// Holds tools for third party tools
let Development		= {
	PluginInterface, DataServer, Bucket, Testing
};

module.exports		= {
	Server,		Development,
	Logging,	BodyParserHandler,
	Loggur,		LOG_LEVELS
};
