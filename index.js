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
let Server	= ( options )=>{
	if ( serverInstance == null )
	{
		serverInstance	= new ServerClass( options );
	}

	return serverInstance;
};

// Holds tools for third party tools
let Development	= {
	PluginInterface, DataServer
};

module.exports	= {
	Server,		Router,
	Testing,	BodyParserHandler,
	Logging,	Loggur,
	LOG_LEVELS,	Development
};

// const InMemoryDataServer	= require( './server/components/caching/in_memory/in_memory_data_server' );
//
// let server	= new InMemoryDataServer();
//
// server.setUp().then(()=>{
// 	server.createNamespace( 'test' ).then(()=>{
// 		server.existsNamespace( 'test' ).then(( exists )=>{
// 			server.create( 'test', 'key', { value: 1 }, { ttl: 1 } ).then( ()=>{
// 				setTimeout(()=>{
// 					console.log( process.dataServer );
// 				}, 100 );
// 			});
// 		});
// 	});
// });