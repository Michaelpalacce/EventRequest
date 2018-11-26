'use strict';

const { assert, Mock, test, helpers }	= require( './../testing_suite' );
const middlewareContainer				= require( './../../server/middleware_container' );
const Router							= require( './../../server/router' );
const MemoryDataServer					= require( './../../server/components/caching/memory/memory_data_server' );
const ErrorHandler						= require( './../../server/components/error_handler' );
const MultipartFormParser				= require( './../../server/components/body_parsers/multipart_data_parser' );
const { Loggur, Logger }				= require( './../../server/components/logger/loggur' );

class MockTemplatingEngine
{
	render(){}
}

class TestDataServer extends MemoryDataServer
{
	constructor( options )
	{
		super( options );
	}

	doCommand()
	{
		return new Promise(( resolve, reject )=>{
			resolve( true );
		})
	}

	sanitize( options ) {}
}

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
		let shouldBeCalled		= 9;
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
	message		: 'MiddlewareContainer templatingEngine on default fails',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		assert.throws( () => {
			router.add( middlewareContainer.templatingEngine( {} ) );
			router.add( helpers.getEmptyMiddleware() );

			eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
			assert.equal( eventRequest.templatingEngine, null );
			eventRequest.next();
		});

		done();
	}
});

test({
	message		: 'MiddlewareContainer templatingEngine on correct arguments',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.templatingEngine( { engine: new MockTemplatingEngine() } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.templatingEngine, null );
		eventRequest.next();
		assert.equal( eventRequest.templatingEngine instanceof MockTemplatingEngine, true );

		done();
	}
});

test({
	message		: 'MiddlewareContainer session on default throws exception if incorrect configuration',
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

test({
	message		: 'MiddlewareContainer session on default does not throw an exception with correct configuration',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		eventRequest._mock({
			method			: 'cachingServer',
			shouldReturn	: new TestDataServer( {} )
		});

		router.add( middlewareContainer.session() );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock( { method : 'on' } );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );

		eventRequest.next();

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

test({
	message		: 'MiddlewareContainer addStaticPath on default throws exception in case of error',
	test		: ( done )=>{
		let router	= new Router();

		assert.throws( ()=>{
			router.add( middlewareContainer.addStaticPath() );
		});

		done();
	}
});

test({
	message		: 'MiddlewareContainer addStaticPath on default does not throw an exception if configuration is correct',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();

		router.add( middlewareContainer.addStaticPath( { path : 'path' }) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		done();
	}
});

test({
	message		: 'MiddlewareContainer timeout times out',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let router				= new Router();
		let error				= false;

		router.add( middlewareContainer.timeout( { timeout : 0 } ) );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.on('error', ( err )=>{
			assert.equal( typeof err === 'string', true );
			error	= true;
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		// Since the timeout is in the event loop, add the done callback at the end of the event loop
		setTimeout(()=>{
			error ? done() : done( 'Request did not time out and it should have' );
		});
	}
});
