'use strict';

// Dependencies
const Logging	= require( './server/components/logger/loggur' );
const Testing	= require( './server/tester/tester' );
const Server	= require( './server/server' );

// Holds the instance of the server class
let server		= null;

/**
 * @brief	Creates a new server, or return existing instance
 *
 * @returns	Server
 */
const App		= () => {
	return server || ( server = new Server() );
};

/**
 * @brief	Removes the server instance ( this does not stop the httpServer if it was started )
 *
 * @return	void
 */
App.cleanUp		= () => {
	server	= null;
};

App.Server		= Server;
App.Testing		= Testing;
App.Loggur		= Logging.Loggur;
App.Logging		= Logging;
App.App			= App;

module.exports	= App;

//
//
// const path			= require( 'path' );
// const PROJECT_ROOT	= path.parse( require.main.filename ).dir;
// const app			= App();
//
// app.apply( app.er_body_parser_form );
//
// app.apply( app.er_body_parser_json );
// app.apply( app.er_body_parser_multipart, { tempDir: path.join( PROJECT_ROOT, '/Uploads' ) } );
// app.apply( app.er_body_parser_raw );
//
// app.get( '/', ( event ) => {
// 	event.send( 'ok' );
// });
//
// app.post( '/', ( event ) => {
// 	event.next( { code: 'app.test.test', status: 502, error: new Error( 'HEYAA' ) } );
// });
//
// app.listen( 80 );