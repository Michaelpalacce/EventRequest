'use strict';

// Dependencies
const Router					= require( './server/components/routing/router' );
const BodyParserHandler			= require( './server/components/body_parsers/body_parser_handler' );
const PluginInterface			= require( './server/plugins/plugin_interface' );
const Logging					= require( './server/components/logger/loggur' );
const DataServer				= require( './server/components/caching/data_server' );
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
	PluginInterface, DataServer
};

module.exports		= {
	Server,		Router,
	Testing,	BodyParserHandler,
	Logging,	Loggur,
	LOG_LEVELS,	Development
};
//
// let server	= Server();
//
// server.apply( 'er_rate_limits' );
//
// server.get( '/', ( event )=>{
// 	console.log('HERE');
// 	event.send( '<h1>Test</h1>' )
// } );
//
// server.get( '/test', ( event )=>{
// 	console.log('HERE2');
// 	event.send( '<h1>Test</h1>' )
// } );
//
// server.start();