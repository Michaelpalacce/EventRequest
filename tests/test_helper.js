'use strict';

// Dependencies
const { Tester, Mock, Mocker }						= require( './../server/tester/tester' );
const EventRequest									= require( './../server/event_request' );
const assert										= require( 'assert' );
const fs											= require( 'fs' );
const { Loggur }									= require( './../server/components/logger/loggur' );
const MockLoggur									= Mock( Loggur.constructor );
const { server, dataServer }						= require( './test_bootstrap' );
let { IncomingMessage, ServerResponse, request }	= require( 'http' );

ServerResponse	= Mock( ServerResponse );
IncomingMessage	= Mock( IncomingMessage );

let helpers	= {};

/**
 * @brief	Returns the server set up by the test bootstrap
 *
 * @return	Server
 */
helpers.getServer	= () => {
	return server;
};

/**
 * @brief	Returns the caching server set up by the test bootstrap
 *
 * @return	DataServer
 */
helpers.getDataServer	= () => {
	return dataServer;
};

/**
 * @brief	Deletes test file
 *
 * @return	Boolean
 */
helpers.clearUpTestFile	= () => {
	try{
		fs.unlinkSync( helpers.getTestFilePath() )
	}
	catch ( error ) {}
};

/**
 * @return	String
 */
helpers.getTestFile	= () => {
	return './testfile';
};

/**
 * @return	String
 */
helpers.getTestFilePath	= () => {
	return helpers.getTestFile();
};

/**
 * @brief	Gets a mocked loggur class
 *
 * @return	Loggur
 */
helpers.getMockedLoggur		= () => {
	return new MockLoggur();
};

/**
 * @brief	Empty middleware that does nothing
 *
 * @return	Object
 */
helpers.getEmptyMiddleware	= () => {
	return {
		route	: '',
		handler	: ( event ) => {}
	};
};

/**
 * @brief	Returns a mocked instance of the eventRequest
 *
 * @param	{String} [requestMethod='']
 * @param	{String} [requestUrl='/']
 * @param	{Object} [headers={}]
 *
 * @return	EventRequest
 */
helpers.getEventRequest	= ( requestMethod = '', requestUrl = '/', headers = {} ) => {
	let request			= new IncomingMessage();

	request.socket	= {
		remoteAddress	: '127.0.0.1'
	};
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
 * @brief	Sends a request to the server and returns a Promise
 *
 * @param	{String} path
 * @param	{String} [method='GET']
 * @param	{Number} [statusCode=200]
 * @param	{*} [data='']
 * @param	{Object} [headers={}]
 * @param	{Number} [port=3333]
 * @param	{String} [expectedBody=null]
 *
 * @return	Promise
 */
helpers.sendServerRequest	= ( path, method = 'GET', statusCode = 200, data = '', headers = {}, port = 3333, expectedBody = null ) => {
	return new Promise(( resolve,reject ) => {
		const predefinedHeaders	= {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength( data )
		};

		headers	= { ...predefinedHeaders, ...headers };

		const options	= {
			hostname	: 'localhost',
			port,
			path,
			method,
			headers
		};

		const req	= request( options, ( res ) => {
			const bodyParts	= [];
			res.on( 'data',( chunk ) => {
				bodyParts.push( chunk );
			});

			res.on( 'end',() => {
				res.body	= Buffer.concat( bodyParts );

				if ( res.statusCode !== statusCode )
				{
					return reject( `Expected StatusCode: ${statusCode} but got ${res.statusCode} with body: ${res.body}`)
				}

				if ( expectedBody !== null )
				{
					assert.equal( res.body.toString(), expectedBody );
				}

				return resolve( res );
			});
		});

		req.on('error', ( e ) => {
			reject( e );
		});

		req.write( data );
		req.end();
	});
};

/**
 * @details	This abstraction is done in order to separate the user tests with the module tests. This way the
 * 			user can use it's own test and runAllTests without triggering the modules tests and overall making the
 * 			user's work easier
 */
let tester		= new Tester();

module.exports	= {
	tester,
	Mock,
	Mocker,
	assert,
	helpers,
	test		: tester.addTest.bind( tester ),
	runAllTests	: tester.runAllTests.bind( tester )
};
