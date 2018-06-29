'use strict';

const { assert, Mock, test, helpers }	= require( './../testing_suite' );
const middlewareContainer				= require( './../../server/middleware_container' );
const Router							= require( './../../server/router' );
const ErrorHandler						= require( './../../server/components/error_handler' );
const Loggur							= require( './../../server/components/logger/loggur' );

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

		// Mocked error handler should serve as a descendant of the error handler and this shouldWork
		router.add( middlewareContainer.logger( {} ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'on',
			shouldReturn	: ( eventName, callback )=>{
				throw new Error( 'Should not have been called since logger was invalid' );
			}
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.logger, null );
		eventRequest.next();
		assert.equal( eventRequest.logger, null );

		done();
	}
});
