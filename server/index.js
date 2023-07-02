'use strict';

// Dependencies
const Logging	= require( './components/logger/loggur' );
const Testing	= require( './tester/tester' );
const Server	= require( './server' );

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
