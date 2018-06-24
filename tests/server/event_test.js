'use strict';

// Dependencies
const { Mock, assert, test, runAllTests, helpers, assertions }	= require( './../testing_suite' );
const EventRequest												= require( './../../server/event' );
const TemplatingEngine											= require( './../../server/components/templating_engine' );
const { FileStreamHandler }										= require( './../../server/components/file_stream_handler' );
const ErrorHandler												= require( './../../server/components/error_handler' );
const MemoryDataServer											= require( './../../server/components/caching/memory/memory_data_server' );
const { Logger }												= require( './../../server/components/logger/components/logger' );

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
	message	: 'EventRequest templating engine can only be an instance of TemplatingEngine',
	test	: ( done ) =>{
		let eventRequest	= helpers.getEventRequest();

		assert.doesNotThrow( () =>{
			eventRequest.templatingEngine	= new TemplatingEngine()
		});

		assert.throws( () => {
			eventRequest.templatingEngine	= {};
		});

		done();
	}
});

test({
	message	: 'EventRequest fileStreamHandler can only be an instance of FileStreamHandler',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();

		assert.doesNotThrow( () =>{
			eventRequest.fileStreamHandler	= new FileStreamHandler()
		});

		assert.throws( () => {
			eventRequest.fileStreamHandler	= {};
		});

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
	message	: 'EventRequest cachingServer can only be an instance of DataServer',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();

		assert.doesNotThrow( () =>{
			eventRequest.cachingServer	= new MemoryDataServer()
		});

		assert.throws( () => {
			eventRequest.cachingServer	= {};
		});

		done();
	}
});

test({
	message	: 'EventRequest logger can only be an instance of Logger',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();

		assert.doesNotThrow( () =>{
			eventRequest.logger	= new Logger()
		});

		assert.throws( () => {
			eventRequest.logger	= {};
		});

		done();
	}
});

test({
	message	: 'EventRequest cleanUp emits event: cleanUp',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let cleanUp			= false;

		eventRequest.on( 'cleanUp', ()=>{
			cleanUp	= true;
		});

		eventRequest.cleanUp();

		cleanUp	? done() : done( 'EventRequest cleanUp event not emitted' );
	}
});


test({
	message	: 'EventRequest cleanUp emits event: finished',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let finished		= false;
		eventRequest.on( 'finished', ()=>{
			finished	= true;
		});

		eventRequest.cleanUp();

		finished	? done() : done( 'EventRequest finished event not emitted' );
	}
});

test({
	message	: 'EventRequest cleanUp cleans up data',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		eventRequest.logger	= new Logger();
		eventRequest.on( 'test', ()=>{} );

		assert.equal( eventRequest.listeners( 'test' ).length, 1 );

		eventRequest.cleanUp();

		assert.equal( eventRequest.internalTimeout, undefined );
		assert.equal( eventRequest.isStopped, true );
		assert.equal( eventRequest.extra, undefined );
		assert.equal( eventRequest.body, undefined );
		assert.equal( eventRequest.templatingEngine, undefined );
		assert.equal( eventRequest.fileStreamHandler, undefined );
		assert.equal( eventRequest.errorHandler, undefined );
		assert.equal( eventRequest.cachingServer, undefined );
		assert.equal( eventRequest.extra, undefined );
		assert.equal( eventRequest.cookies, undefined );
		assert.equal( eventRequest.params, undefined );
		assert.equal( eventRequest.logger instanceof Logger, true );
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
			shouldReturn	: ()=>{
				send	= true;
			}
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
			shouldReturn	: ()=>{
				send	= true;
				done();
			}
		});

		eventRequest.send( '', 200, true );

		if ( ! send )
		{
			done( 'Send did not get called' )
		}
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

		eventRequest.on( 'cleanUp', ()=>{
			cleanUp	= true;
		});

		eventRequest.send( '' );

		cleanUp	? done() : done( 'EventRequest cleanUp event not emitted on send' );
	}
});

test({
	message	: 'EventRequest stop method emits stop',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let stop			= false;

		eventRequest.on( 'stop', ()=>{
			stop	= true;
		});

		eventRequest.stop();

		stop	? done() : done( 'EventRequest stop event not emitted' );
	}
});

test({
	message	: 'EventRequest stop method sets isStopped to true',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();

		assert.equal( eventRequest.isStopped, false );
		eventRequest.stop();
		assert.equal( eventRequest.isStopped, true );

		done();
	}
});

test({
	message	: 'EventRequest setHeader emits a setHeader event',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let setHeader		= false;

		eventRequest.on( 'setHeader', ()=>{
			setHeader	= true;
		});

		eventRequest.setHeader( 'key', 'value' );

		setHeader	? done() : done( 'EventRequest setHeader event not emitted' );
	}
});

test({
	message	: 'EventRequest setHeader emits a setHeader event',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let setHeader		= false;

		eventRequest.on( 'setHeader', ()=>{
			setHeader	= true;
		});

		eventRequest.setHeader( 'key', 'value' );

		setHeader	? done() : done( 'EventRequest setHeader event not emitted' );
	}
});

test({
	message	: 'EventRequest setHeader sets the header in the response if response is not sent',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		if ( ! assertions.assertFalse( eventRequest.isFinished() ) )
		{
			throw new Error( 'Event is finished but it should not be' );
		}
		let setHeader	= false;

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: ()=>{
				setHeader	= true;
			}
		});

		eventRequest.setHeader( 'key', 'value' );
		setHeader	? done() : done( 'EventRequest setHeader did not call response.setHeader' );
	}
});

test({
	message	: 'EventRequest setHeader sets the header in the response if response is not sent',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		if ( ! assertions.assertFalse( eventRequest.isFinished() ) )
		{
			throw new Error( 'Event is finished but it should not be' );
		}
		let setHeader	= false;

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: ( key, value )=>{
				assert.equal( key, 'key' );
				assert.equal( value, 'value' );
				setHeader	= true;
			}
		});

		eventRequest.setHeader( 'key', 'value' );
		setHeader	? done() : done( 'EventRequest setHeader did not call response.setHeader' );
	}
});


test({
	message	: 'EventRequest setHeader does not set header when event is finished and throws error',
	test	: ( done ) => {
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
			shouldReturn	: ( key, value )=>{
				assert.equal( key, 'Location' );
				assert.equal( value, redirectUrl );
				setHeader	= true;
			}
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
	message	: 'EventReqeust.isFinished returns response.finished',
	test	: ( done ) =>{
		let eventRequest		= helpers.getEventRequest();
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
