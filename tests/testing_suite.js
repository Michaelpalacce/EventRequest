'use strict';

// Dependencies
const { Tester, Mock, assert, logger }				= require( './../server/tester/tester' );
const EventRequest									= require( './../server/event' );
const assertions									= require( './../server/components/validation/validation_rules' );
const querystring									= require( 'querystring' );
let { IncomingMessage, ServerResponse, request }	= require( 'http' );

ServerResponse	= Mock( ServerResponse );
IncomingMessage	= Mock( IncomingMessage );

let helpers	= {};

/**
 * @brief	Returns a mocked instance of the eventRequest
 *
 * @param	requestMethod
 * @param	requestUrl
 *
 * @return	RequestEvent
 */
helpers.getEventRequest	= ( requestMethod = '', requestUrl = '/', headers = {} ) => {
	let request		= new IncomingMessage();
	request._mock( { method : 'method', shouldReturn : requestMethod } );
	request._mock( { method : 'url', shouldReturn : requestUrl, } );
	request._mock( { method : 'headers', shouldReturn : headers, } );

	let response	= new ServerResponse( request );

	return new EventRequest( request, response );
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
	assert,
	assertions,
	logger,
	helpers,
	test		: tester.addTest.bind( tester ),
	runAllTests	: tester.runAllTests.bind( tester )
};
