'use strict';

// Dependencies
const { Tester, Mock, logger, Mocker }				= require( './../server/tester/tester' );
const EventRequest									= require( './../server/event' );
const querystring									= require( 'querystring' );
const assert										= require( 'assert' );
const fs											= require( 'fs' );
const path											= require( 'path' );
const { Loggur }									= require( './../server/components/logger/loggur' );
const MockLoggur									= Mock( Loggur.constructor );
const { server, cachingServer }						= require( './test_bootstrap' );
let { IncomingMessage, ServerResponse, request }	= require( 'http' );

ServerResponse	= Mock( ServerResponse );
IncomingMessage	= Mock( IncomingMessage );

let helpers	= {};

/**
 * @brief	Returns the server set up by the test bootstrap
 *
 * @return	Server
 */
helpers.getServer	= ()=>{
	return server;
};

/**
 * @brief	Returns the caching server set up by the test bootstrap
 *
 * @return	Server
 */
helpers.getCachingServer	= ()=>{
	return cachingServer;
};

/**
 * @brief	Sets up the test namespace for the given caching server
 *
 * @param	DataServer server
 * @param	Function callback
 *
 * @return	void
 */
helpers.setUpTestNamespace	= ( server, callback )=>{
	helpers.removeTestNamespace( server, ( err )=>{
		if ( ! err )
		{
			server.createNamespace( 'test', {} ).then( ()=>{
				callback( false )
			}).catch( callback );
		}
		else
		{
			callback( err );
		}
	});
};
/**
 * @brief	Removes the test namespace for the given caching server
 *
 * @param	DataServer server
 * @param	Function callback
 *
 * @return	void
 */
helpers.removeTestNamespace	= ( server, callback )=>{
	server.setUp().then(()=>{
		server.existsNamespace( 'test' ).then(( exists )=>{
			if ( exists === true )
			{
				server.removeNamespace( 'test' ).then( ()=>{
					callback( false )
				}).catch( callback );
			}
			else
			{
				callback( false );
			}
		}).catch( callback );
	}).catch( callback )
};

/**
 * @brief	Deletes test file
 *
 * @return	Boolean
 */
helpers.clearUpTestFile	= ()=> {
	try{
		fs.unlinkSync( helpers.getTestFilePath() )
	}
	catch ( error ) {}
};

/**
 * @return	String
 */
helpers.getTestFile	= ()=> {
	return './testfile';
};

/**
 * @return	String
 */
helpers.getTestFilePath	= ()=> {
	return path.join( path.dirname( require.main.filename ), helpers.getTestFile() );
};

/**
 * @brief	Gets a mocked loggur class
 *
 * @return	Loggur
 */
helpers.getMockedLoggur		= ()=>{
	return new MockLoggur();
};

/**
 * @brief	Empty middleware that does nothing
 *
 * @return	Object
 */
helpers.getEmptyMiddleware	= ()=>{
	return {
		route	: '',
		handler	: ( event )=>{}
	};
};

/**
 * @brief	Returns a mocked instance of the eventRequest
 *
 * @param	requestMethod
 * @param	requestUrl
 *
 * @return	EventRequest
 */
helpers.getEventRequest	= ( requestMethod = '', requestUrl = '/', headers = {} ) => {
	let request			= new IncomingMessage();
	let connectionMock	= {
		remoteAddress	: '127.0.0.1'
	};

	request.connection	= connectionMock;
	request._mock( { method : 'method', shouldReturn : requestMethod } );
	request._mock( { method : 'url', shouldReturn : requestUrl, } );
	request._mock( { method : 'headers', shouldReturn : headers, } );

	let response			= new ServerResponse( request );
	let MockedEventRequest	= Mock( EventRequest );

	let eventRequest		= new MockedEventRequest( request, response );
	eventRequest.setMaxListeners( 0 );

	return eventRequest;
};

/**
 * @brief	Sends a request to the server and returns a callback with the response
 *
 * @param	mixed data
 * @param	String path
 * @param	String method
 * @param	Function callback
 *
 * @return	void
 */
helpers.sendServerRequest	= ( data, path, method, callback )=>{
	const postData = querystring.stringify( data );

	const options = {
		hostname	: 'localhost',
		port		: 3333,
		path		: path,
		method		: method,
		headers		: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength( postData )
		}
	};

	let req	= request( options, ( res ) =>{
		callback( false, res );
	});

	req.on('error', (e) => {
		callback( e );
	});

	req.write( postData );
	req.end();
};

/**
 * @details	This abstraction is done in order to separate the user tests with the module tests. This way the
 * 			user can use it's own test and runAllTests without triggering the modules tests and overall making the
 * 			user's work easier
 */
let tester		= new Tester();
module.exports	= {
	Tester,
	Mock,
	Mocker,
	assert,
	logger,
	helpers,
	test		: tester.addTest.bind( tester ),
	runAllTests	: tester.runAllTests.bind( tester )
};
