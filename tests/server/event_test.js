'use strict';

// Dependencies
const { Mock, assert, test, helpers }	= require( '../test_helper' );
const EventRequest						= require( './../../server/event' );
const ErrorHandler						= require( '../../server/components/error/error_handler' );

const MockedErrorHandler				= Mock( ErrorHandler );

test({
	message	: 'EventRequest should throw an error with invalid constructor parameters',
	test	: function ( done )
	{
		assert.throws( ()=>{
			new EventRequest();
		});

		done();
	}
});

test({
	message	: 'EventRequest should not throw an error in case of valid constructor parameters',
	test	: ( done ) =>{
		helpers.getEventRequest();
		done();
	}
});

test({
	message	: 'EventRequest should parse url',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest( '', '/test?testParam=testValue' );

		assert.equal( eventRequest.path, '/test', 'EventRequest could not parse path' );
		assert.deepEqual( eventRequest.queryString, { testParam : 'testValue' }, 'EventRequest could not parse query' );

		done();
	}
});

test({
	message	: 'EventRequest parses methods',
	test	: ( done ) =>{
		let methods	= ['GET', 'DELETE', 'PUT', 'POST'];
		methods.forEach( ( method )=>{
			let eventRequest	= helpers.getEventRequest( method );

			assert.equal( eventRequest.method, method, `Could not validate that ${eventRequest.method} and ${method} are equal!` );
		});

		done();
	}
});

test({
	message	: 'EventRequest parses headers',
	test	: ( done ) =>{
		let headers			= { headerKey : 'headerValue' };
		let eventRequest	= helpers.getEventRequest( undefined, undefined, headers );

		assert.deepEqual( eventRequest.headers, headers );

		done();
	}
});

test({
	message	: 'EventRequest errorHandler can only be an instance of ErrorHandler',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();

		assert.doesNotThrow( () =>{
			eventRequest.errorHandler	= new ErrorHandler()
		});

		assert.throws( () => {
			eventRequest.errorHandler	= {};
		});

		done();
	}
});

test({
	message	: 'EventRequest cleanUp emits event: cleanUp',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let cleanUp			= false;

		eventRequest.on( 'cleanUp', ()=>{ cleanUp = true; });

		eventRequest.cleanUp();

		cleanUp	? done() : done( 'EventRequest cleanUp event not emitted' );
	}
});

test({
	message	: 'EventRequest cleanUp emits event: finished',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let finished		= false;
		eventRequest.on( 'finished', ()=>{ finished = true; });

		eventRequest.cleanUp();

		finished	? done() : done( 'EventRequest finished event not emitted' );
	}
});

test({
	message	: 'EventRequest cleanUp cleans up data',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		eventRequest.on( 'test', ()=>{} );

		assert.equal( eventRequest.listeners( 'test' ).length, 1 );

		eventRequest.cleanUp();

		assert.equal( eventRequest.internalTimeout, undefined );
		assert.equal( eventRequest.extra, undefined );
		assert.equal( eventRequest.body, undefined );
		assert.equal( eventRequest.fileStreamHandler, undefined );
		assert.equal( eventRequest.errorHandler, undefined );
		assert.equal( eventRequest.extra, undefined );
		assert.equal( eventRequest.cookies, undefined );
		assert.equal( eventRequest.params, undefined );
		assert.equal( eventRequest.listeners( 'test' ).length, 0 );

		done();
	}
});

test({
	message	: 'EventRequest send calls response.end when not raw',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();
		let send			= false;
		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: ()=>{ send = true; },
			called			: 1
		});

		eventRequest.send( '' );

		send	? done() : done( 'Send did not get called' );
	}
});

test({
	message	: 'EventRequest send calls response.end when raw',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();
		let send			= false;
		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: ()=>{ send = true; },
			called			: 1
		});

		eventRequest.send( '', 200, true );

		send	? done() : done( 'Send did not get called' );
	}
});

test({
	message	: 'EventRequest send emits send event',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();
		let send			= false;
		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: ()=>{}
		});

		eventRequest.on( 'send', () =>{
			send	= true;
		});

		eventRequest.send( '' );

		send	? done() : done( 'EventRequest send event not emitted' );
	}
});

test({
	message	: 'EventRequest sets status code',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();
		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: ()=>{}
		});

		let statusCode	= 200;
		eventRequest.send( '', statusCode );

		assert.equal( eventRequest.response.statusCode, statusCode );
		done();
	}
});

test({
	message	: 'EventRequest send method calls cleanUp',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let cleanUp			= false;

		eventRequest.on( 'cleanUp', ()=>{ cleanUp = true; });

		eventRequest.send( '' );

		cleanUp	? done() : done( 'EventRequest cleanUp event not emitted on send' );
	}
});

test({
	message		: 'EventRequest.send sends a stream',
	test		: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let cleanUp			= false;

		eventRequest.on( 'cleanUp', ()=>{ cleanUp = true; });

		eventRequest.send( '' );

		cleanUp	? done() : done( 'EventRequest cleanUp event not emitted on send' );
	}
});

test({
	message	: 'EventRequest setHeader emits a setHeader event',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let setHeader		= false;

		eventRequest.on( 'setHeader', ()=>{ setHeader = true; });

		eventRequest.setHeader( 'key', 'value' );

		setHeader	? done() : done( 'EventRequest setHeader event not emitted' );
	}
});

test({
	message	: 'EventRequest setStatusCode changes the status code',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		eventRequest.setStatusCode( 500 );

		assert.equal( 500, eventRequest.response.statusCode );
		eventRequest.setStatusCode( 'wrong' );
		assert.equal( 200, eventRequest.response.statusCode );

		done();
	}
});

test({
	message	: 'EventRequest setHeader sets the header in the response if response is not sent',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		assert.equal( eventRequest.isFinished(), false );
		let setHeader	= false;

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: ()=>{ setHeader = true; },
			called			: 1,
			with			: [['key', 'value']]
		});

		eventRequest.setHeader( 'key', 'value' );
		setHeader	? done() : done( 'EventRequest setHeader did not call response.setHeader' );
	}
});

test({
	message	: 'EventRequest setHeader does not set header when event is finished and throws error',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let errorHandler	= new MockedErrorHandler();
		let errorCalled		= false;

		assert.equal( eventRequest.isFinished(), false );

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: ()=>{
				throw new Error( 'EventRequest setHeader should not have called response.setHeader' );
			}
		});

		eventRequest.response._mock({
			method			: 'finished',
			shouldReturn	: true
		});

		eventRequest.errorHandler	= errorHandler;

		errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: () => { errorCalled = true; },
			with			: [[eventRequest, undefined]],
			called			: 1
		});

		eventRequest.setHeader( 'key', 'value' );
		errorCalled	? done() : done( 'Error was not called' );
	}
});

test({
	message	: 'EventRequest.redirect emits a redirect event',
	test	: ( done ) =>{
		let eventRequest		= helpers.getEventRequest();
		let redirectUrl			= '/test';
		let redirectStatusCode	= 302;
		let redirect			= false;

		eventRequest.on( 'redirect', ( redirectOptions )=>{
			assert.equal( redirectOptions.redirectUrl, redirectUrl );
			assert.equal( redirectOptions.statusCode, redirectStatusCode );
			redirect	= true;
		});

		eventRequest.redirect( redirectUrl, 302 );

		redirect ? done() : done( 'Redirect event not emitted' );
	}
});

test({
	message	: 'EventRequest.redirect sets header',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();
		let setHeader		= false;
		let redirectUrl		= '/test';

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: ()=>{ setHeader = true; },
			with			: [['Location', redirectUrl]],
			called			: 1
		});

		eventRequest.redirect( redirectUrl, 302 );

		setHeader ? done() : done( 'Redirect does not set header' );
	}
});

test({
	message	: 'EventRequest.redirect does not redirect if response is finished',
	test	: ( done ) =>{
		let eventRequest		= helpers.getEventRequest();
		let MockedErrorHandler	= Mock( ErrorHandler );
		let errorHandler		= new MockedErrorHandler();
		let errorCalled			= false;

		assert.equal( eventRequest.isFinished(), false );

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: ()=>{
				throw new Error( 'EventRequest setHeader should not have called response.setHeader' );
			}
		});

		eventRequest.response._mock({
			method			: 'finished',
			shouldReturn	: true
		});

		eventRequest.errorHandler	= errorHandler;

		errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: () => {
				errorCalled	= true;
			}
		});

		eventRequest.redirect( '/test' );
		errorCalled	? done() : done( 'Error was not called' );
	}
});

test({
	message	: 'EventRequest.isFinished returns response.finished',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();
		eventRequest.response._mock({
			method			: 'finished',
			shouldReturn	: true
		});

		assert.equal( eventRequest.isFinished(), true );

		eventRequest.response._mock({
			method			: 'finished',
			shouldReturn	: false
		});

		assert.equal( eventRequest.isFinished(), false );

		done();
	}
});

test({
	message	: 'EventRequest.setBlock should set block',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();
		let block			= ['test'];
		eventRequest.setBlock( block );

		assert.deepEqual( eventRequest.block, block );

		done();
	}
});

test({
	message	: 'EventRequest.next calls next middleware',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();
		let firstCalled		= false;
		let secondCalled	= false;

		let callbackOne		= ( event ) =>{
			firstCalled	= true;
			event.next();
		};
		let callbackTwo		= () =>{
			secondCalled	= true;
		};

		let block			= [callbackOne, callbackTwo];
		eventRequest.setBlock( block );

		eventRequest.next();

		firstCalled && secondCalled ? done() : done( 'EventRequest.next chain did not execute correctly' );
	}
});

test({
	message	: 'EventRequest.next sends error on error',
	test	: ( done ) =>{
		let eventRequest			= helpers.getEventRequest();
		let error					= false;
		let errorToSend				= 'Error was thrown.';
		let errorCode				= 503;

		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: ()=>{ error = true; },
			with			: [[eventRequest, errorToSend]],
			called			: 1
		});

		let callback	= ()=>{};

		let block		= [callback];
		eventRequest.setBlock( block );

		eventRequest.next( errorToSend, errorCode );

		error ? done() : done( 'EventRequest.next did not dispatch an error' );
	}
});

test({
	message	: 'EventRequest.next calls errorHandler on no more middleware',
	test	: ( done ) =>{
		let eventRequest			= helpers.getEventRequest();
		let error					= false;

		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: ()=>{ error = true; },
			with			: [[eventRequest, undefined]],
			called			: 1
		});

		let block	= [];
		eventRequest.setBlock( block );

		eventRequest.next();

		error ? done() : done( 'EventRequest.next did not call errorHandler on no more middleware' );
	}
});

test({
	message	: 'EventRequest.sendError emits an error event',
	test	: ( done ) =>{
		let eventRequest			= helpers.getEventRequest();
		let errorToThrow			= 'Error to throw';
		let error					= false;

		let MockedErrorHandler		= Mock( ErrorHandler );
		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			called			: 1,
			with			: [[eventRequest, errorToThrow]],
			shouldReturn	: ()=>{ error = true; }
		});

		eventRequest.sendError( errorToThrow );

		error ? done() : done( 'Send error did not emit an error' );
	}
});

test({
	message: 'EventRequest should have a validation handler',
	test: ( done )=>{
		const eventRequest	= helpers.getEventRequest();
		const ValidationHandlerClass	= require( '../../server/components/validation/validation_handler' );

		assert.equal( typeof eventRequest.validationHandler, 'object' );
		assert.equal( eventRequest.validationHandler instanceof ValidationHandlerClass, true );

		done();
	}
});

test({
	message: 'EventRequest setCookie should add a header with the cookie',
	dataProvider: [
		['key', 'value', null, null, true],
		['key', 123, null, null, true],
		[123, 'value', null, null, true],
		['key', 'value', 10, null, true],
		['key', 'value', 10, 'test.com', true],
		[123, 123, 10, 'test.com', true],
		['key', null, null, null, false],
		[null, 'value', null, null, false],
		[null, null, null, null, false],
		['key', undefined, null, null, false],
		[undefined, 'value', null, null, false],
		[undefined, undefined, null, null, false],
	],
	test: ( done, name, value, maxAge, domain, shouldReturnTrue )=>{
		const eventRequest		= helpers.getEventRequest();
		let setCookieArguments	= [name, value];
		let wasCalled			= false;
		let cookieSet			= '';

		if ( maxAge !== null )
			setCookieArguments.push( maxAge );

		if ( domain !== null )
			setCookieArguments.push( domain );

		eventRequest._mock({
			method			: 'setHeader',
			shouldReturn	: ( headerName, cookie )=>{
				wasCalled	= true;
				cookieSet	= cookie[0];
			}
		});

		assert.equal( eventRequest.setCookie.apply( eventRequest, setCookieArguments ), shouldReturnTrue );
		assert.equal( wasCalled, shouldReturnTrue );

		if ( maxAge !== null )
			assert.equal( cookieSet.includes( `Max-Age=${maxAge}`), true );

		if ( domain !== null )
			assert.equal( cookieSet.includes( `Domain=${domain}`), true );

		done();
	}
});

test({
	message	: 'EventRequest.getHeaderValue should return header',
	test	: ( done )=>{
		const headerName	= 'test';
		const headerValue	= 'TestHeader';

		const eventRequest	= helpers.getEventRequest( '', '/', { [headerName]: headerValue });

		assert.equal( eventRequest.getHeaderValue( headerName ), headerValue );

		done();
	}
});

test({
	message	: 'EventRequest.getHeaderValue should return default if header is not set',
	test	: ( done )=>{
		const headerName	= 'test';
		const headerValue	= 'TestHeader';

		const eventRequest	= helpers.getEventRequest();

		assert.equal( eventRequest.getHeaderValue( headerName ), null );
		assert.equal( eventRequest.getHeaderValue( headerName, headerValue ), headerValue );

		done();
	}
});

test({
	message	: 'EventRequest.hasHeader returns false if header does not exist',
	test	: ( done )=>{
		const headerName	= 'test';

		const eventRequest	= helpers.getEventRequest();

		assert.equal( eventRequest.hasHeader( headerName ), false );

		done();
	}
});

test({
	message	: 'EventRequest.hasHeader returns true if header exists',
	test	: ( done )=>{
		const headerName	= 'test';
		const headerValue	= 'TestHeader';

		const eventRequest	= helpers.getEventRequest( '', '/', { [headerName]: headerValue });

		assert.equal( eventRequest.hasHeader( headerName ), true );

		done();
	}
});

test({
	message	: 'EventRequest.getHeaders returns all headers',
	test	: ( done )=>{
		const headers	= {
			headerOne: 'valueOne',
			headerTwo: 'valueTwo',
			headerThree: 'valueThree'
		};

		const eventRequest	= helpers.getEventRequest( '', '/', headers );

		assert.equal( eventRequest.getHeaders(), headers );

		done();
	}
});


test({
	message	: 'EventRequest.next sends 404 if route does not exist',
	test	: ( done )=>{

		const eventRequest	= helpers.getEventRequest( '/', 'GET' );
		let called			= false;

		eventRequest._mock({
			method: 'send',
			shouldReturn: ( one, two )=> {
				assert.deepStrictEqual( { error: 'Cannot / GET' }, one );
				assert.equal( 404, two );
				called	= true;
			}
		});

		eventRequest.next();

		assert.equal( called, true );

		done();
	}
});
