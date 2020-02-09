'use strict';

// Dependencies
const { Server, Loggur }	= require( 'event_request' );
const path					= require( 'path' );

const PROJECT_ROOT		= path.parse( require.main.filename ).dir;

/**
 * @brief	Instantiate the server
 */
const app	= Server();

app.apply( 'er_env' );
app.apply( 'er_static_resources', { paths : [process.env.STATIC_PATH, 'favicon.ico'] } );
app.apply( 'er_timeout', { timeout : process.env.REQUEST_TIMEOUT } );
app.apply( 'er_templating_engine', { templateDir : path.join( PROJECT_ROOT, process.env.TEMPLATING_DIR ) } );

// Get the user routes
require( './routes' );

// Start the server
Server.start( process.env.PORT, ()=>{
	Loggur.log( 'Server started' );
});
