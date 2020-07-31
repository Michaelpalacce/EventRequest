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

const ErrorHandler	= require( './server/components/error/error_handler' );

const errorHandler	= new ErrorHandler();
const mocker		= {
	isFinished	: ()=>{ return false },
	send		: function(){ console.log( arguments );},
	emit		: function(){ console.log( arguments );},
};

errorHandler.addCase( 'app.test', { error : 'MESSSSSSSSSSSSSSSSSSSSSSSS', status: 403 } )

errorHandler.handleError( mocker, 'An error has occurred!' );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, 'An error has occurred!', 400 );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, 'app.test' );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, 'app.DOES.NOT.EXIST' );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, new Error( 'app.DOES.NOT.EXIST' ) );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, new Error( 'app.test' ) );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, new Error( 'app.test' ), 501 );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, 'app.test' );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, 'app.test', 402 );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, 'app.TESTTTTTT', 402 );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, { code: 'app.test' } );
console.log(  );
console.log(  );
console.log(  );
errorHandler.handleError( mocker, { code: 'app.test', emit: true, status : 231, error: 'Cannot Do something', message: 'CANNOT DO IT' } );
console.log(  );
console.log(  );
console.log(  );
