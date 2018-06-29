'use strict';

const { assert, Mock, test, helpers }	= require( './../testing_suite' );
const middlewareContainer				= require( './../../server/middleware_container' );
const Router							= require( './../../server/router' );
const ErrorHandler						= require( './../../server/components/error_handler' );
const TemplatingEngine					= require( './../../server/components/templating_engine' );
const BaseTemplatingEngine				= require( './../../server/components/templating_engines/base_templating_engine' );
const Loggur							= require( './../../server/components/logger/loggur' );
const { Logger }						= require( './../../server/components/logger/components/logger' );

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

		router.add( middlewareContainer.logger( {
			logLevel	: 0
		} ) );
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
		let shouldBeCalled		= 9;
		// Create a logger that has a logLevel of 0 so that we will not see any logs while testing
		let logger				= Loggur.createLogger({
			logLevel	: 0
		});

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
	message		: 'MiddlewareContainer setFileStream on default',
	incomplete	: true,
	test		: ( done )=>{
		done();
	}
});

test({
	message		: 'MiddlewareContainer setFileStream on correct arguments',
	incomplete	: true,
	test		: ( done )=>{
		done();
	}
});

test({
	message		: 'MiddlewareContainer setFileStream on incorrect arguments',
	incomplete	: true,
	test		: ( done )=>{
		done();
	}
});

test({
	message		: 'MiddlewareContainer templatingEngine on default',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.templatingEngine( {} ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.templatingEngine, null );
		eventRequest.next();
		assert.equal( eventRequest.templatingEngine instanceof TemplatingEngine, true );

		done();
	}
});

test({
	message		: 'MiddlewareContainer templatingEngine on correct arguments',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.templatingEngine( { engine: BaseTemplatingEngine } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.templatingEngine, null );
		eventRequest.next();
		assert.equal( eventRequest.templatingEngine instanceof TemplatingEngine, true );

		done();
	}
});

test({
	message		: 'MiddlewareContainer templatingEngine on incorrect arguments',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.templatingEngine() );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.templatingEngine, null );
		eventRequest.next();
		assert.equal( eventRequest.templatingEngine instanceof TemplatingEngine, true );

		done();
	}
});

test({
	message		: 'MiddlewareContainer session on default throws exception if DataServer is not set',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.session() );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );

		assert.throws(()=>{
			eventRequest.next();
		});

		done();
	}
});
