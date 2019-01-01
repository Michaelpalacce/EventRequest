'use strict';

const { assert, Mock, test, helpers }	= require( '../test_helper' );
const middlewareContainer				= require( './../../server/middleware_container' );
const Router							= require( '../../server/components/routing/router' );
const ErrorHandler						= require( '../../server/components/error/error_handler' );
const MultipartFormParser				= require( './../../server/components/body_parsers/multipart_data_parser' );
const { Loggur, Logger }				= require( './../../server/components/logger/loggur' );

test({
	message	: 'MiddlewareContainer error handler defaults',
	test	: ( done )=>{
		let eventRequest	= helpers.getEventRequest();
		let router			= new Router();
		router.add( middlewareContainer.errorHandler( {} ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.errorHandler, null );
		eventRequest.next();
		assert.equal( eventRequest.errorHandler instanceof ErrorHandler, true );

		done();
	}
});

test({
	message	: 'MiddlewareContainer error handler passed error handler',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();
		let MockErrorHandler	= Mock( ErrorHandler );
		let errorHandler		= new MockErrorHandler();

		// Mocked error handler should serve as a descendant of the error handler and this shouldWork
		router.add( middlewareContainer.errorHandler( { errorHandler } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.errorHandler, null );
		eventRequest.next();
		assert.equal( eventRequest.errorHandler instanceof MockErrorHandler, true );

		done();
	}
});

test({
	message	: 'MiddlewareContainer error handler passed invalid object creates a default error handler',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		// Mocked error handler should serve as a descendant of the error handler and this shouldWork
		router.add( middlewareContainer.errorHandler( { errorHandler : router } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.errorHandler, null );
		eventRequest.next();
		assert.equal( eventRequest.errorHandler instanceof ErrorHandler, true );

		done();
	}
});

test({
	message	: 'MiddlewareContainer error handler passed invalid object creates a default error handler',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		// Mocked error handler should serve as a descendant of the error handler and this shouldWork
		router.add( middlewareContainer.errorHandler( { errorHandler : router } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.errorHandler, null );
		eventRequest.next();
		assert.equal( eventRequest.errorHandler instanceof ErrorHandler, true );

		done();
	}
});

test({
	message	: 'MiddlewareContainer logger on default',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.logger( { logLevel : 0 } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'on',
			shouldReturn	: ( eventName, callback )=>{},
			called			: 0
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.logger, null );
		eventRequest.next();
		assert.equal( eventRequest.logger, null );

		done();
	}
});

test({
	message	: 'MiddlewareContainer logger on correct logger passed',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();
		let index				= 0;
		let shouldBeCalled		= 8;
		// Create a logger that has a logLevel of 0 so that we will not see any logs while testing
		let logger				= Loggur.createLogger( { logLevel : 0  } );

		router.add( middlewareContainer.logger( { logger } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'on',
			shouldReturn	: ( eventName, callback )=>{
				++ index;
			},
			called			: shouldBeCalled
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.logger, null );
		eventRequest.next();
		assert.equal( eventRequest.logger instanceof Logger, true );
		assert.equal(
			index,
			shouldBeCalled,
			`EventRequest.on was expected to be called ${shouldBeCalled} times, instead it was called ${index}`
		);

		done();
	}
});

test({
	message	: 'MiddlewareContainer logger on incorrect logger passed',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.logger( { logger : router } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'on',
			shouldReturn	: ( eventName, callback )=>{},
			called			: 0
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.logger, null );
		eventRequest.next();
		assert.equal( eventRequest.logger, null );

		done();
	}
});

test({
	message		: 'MiddlewareContainer bodyParser on default',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.bodyParser() );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );

		eventRequest.next();

		done();
	}
});

test({
	message		: 'MiddlewareContainer bodyParser on incorrect options',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.bodyParser( { error	: 'error', test: [] } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );

		eventRequest.next();

		done();
	}
});

test({
	message		: 'MiddlewareContainer bodyParser on correct options',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add(
			middlewareContainer.bodyParser(
				{
					parsers: [{ instance : MultipartFormParser, options : { tempDir : 'tests' } }]
				}
			)
		);

		router.add( helpers.getEmptyMiddleware() );
		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		done();
	}
});

test({
	message		: 'MiddlewareContainer parseCookies on default',
	test		: ( done )=>{
		let cookieKey			= 'cookieKey';
		let cookieValue			= 'cookieValue';
		let headers				= { cookie : `${cookieKey}=${cookieValue}` };
		let eventRequest		= helpers.getEventRequest( undefined, undefined, headers );
		let router				= new Router();

		router.add( middlewareContainer.parseCookies() );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( typeof eventRequest.cookies[cookieKey] !== 'undefined', true );
		assert.equal( eventRequest.cookies[cookieKey], cookieValue );

		done();
	}
});
