'use strict';

// Dependencies
const { Mock, assert, test, runAllTests, helpers }	= require( './../testing_suite' );
const EventRequest									= require( './../../server/event' );
const TemplatingEngine								= require( './../../server/components/templating_engine' );
const { FileStreamHandler }							= require( './../../server/components/file_stream_handler' );
const ErrorHandler									= require( './../../server/components/error_handler' );
const MemoryDataServer								= require( './../../server/components/caching/memory/memory_data_server' );
const { Logger }									= require( './../../server/components/logger/components/logger' );

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
		let timeout			= setTimeout( () =>{
			done( 'Did not emit an event' );
		}, 500 );

		eventRequest.on( 'cleanUp', ()=>{
			clearTimeout( timeout );
			done();
		});

		eventRequest.cleanUp();
	}
});


test({
	message	: 'EventRequest cleanUp emits event: finished',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest();
		let timeout			= setTimeout( () =>{
			done( 'Did not emit an event' );
		}, 500 );

		eventRequest.on( 'finished', ()=>{
			clearTimeout( timeout );
			done();
		});

		eventRequest.cleanUp();
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

module.exports	= {};