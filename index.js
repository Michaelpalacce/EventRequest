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
 * @return	Server
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


// const fs				= require( 'fs' );
// const path				= require( 'path' );
// const app				= App();
// const TemplatingEngine	= require( './server/components/templating_engine/experimental_templating_engine' );
// const templatingEngine	= new TemplatingEngine();
//
// app.get( '/', ( event ) =>{
// 	const template	= path.resolve( './', 'test.html' );
// 	const variables	= { test: 'TEST!!', hello: 'HELLO WORLD!!'};
//
// 	event.send( templatingEngine.render( fs.readFileSync( template, { encoding: 'utf-8' } ), variables ) );
// });
//
// app.listen( 80, () =>{
// 	console.log( 'Started' );
// });




