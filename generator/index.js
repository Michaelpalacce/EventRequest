'use strict';

// Dependencies
const { Server, Loggur }	= require( 'event_request' );

/**
 * @brief	Instantiate the server
 */
const server	= Server();

server.apply( 'er_env' );
server.apply( 'er_static_resources', { paths : [process.env.STATIC_PATH, 'favicon.ico'] } );
server.apply( 'er_timeout', { timeout : process.env.REQUEST_TIMEOUT } );
// server.apply( 'er_templating_engine', { templateDir : path.join( PROJECT_ROOT, process.env.TEMPLATING_DIR ), engine : templatingEngine } );

// Get the user routes
require( './routes' );

// Start the server
Server.start( process.env.PORT, ()=>{
	Loggur.log( 'Server started' );
});
