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

// let responseCache	= Server().getPluginManager().getPlugin( 'er_response_cache' );
// let cacheServer		= Server().getPluginManager().getPlugin( 'er_cache_server' );
//
// cacheServer.startServer(( err )=>{
// 	console.log( 'started' );
// 	console.log( err );
// });
//
// Server().apply( cacheServer );
// Server().apply( responseCache );
//
// Server().add({
// 	handler	: ( event )=>{
// 		event.cacheCurrentRequest();
// 	}
// });
//
// Server().get( '/', ( event )=>{
// 	console.log( 'here' );
// 	event.send( '<h1>Hello</h1>' );
// });
//
// Server().start();