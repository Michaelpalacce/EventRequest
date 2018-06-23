'use strict';

// Dependencies
const { Tester, Mock, assert }			= require( './../server/tester/tester' );
const EventRequest						= require( './../server/event' );
let { IncomingMessage, ServerResponse }	= require( 'http' );

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
 * @details	This abstraction is done in order to separate the user tests with the module tests. This way the
 * 			user can use it's own test and runAllTests without triggering the modules tests and overall making the
 * 			user's work easier
 */
let tester		= new Tester();
module.exports	= {
	Tester,
	Mock,
	assert,
	helpers,
	test		: tester.addTest.bind( tester ),
	runAllTests	: tester.runAllTests.bind( tester )
};