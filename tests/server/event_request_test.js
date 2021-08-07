'use strict';

// Dependencies
const { Mock, assert, test, helpers }	= require( '../test_helper' );
const EventRequest						= require( './../../server/event_request' );
const fs								= require( 'fs' );
const ErrorHandler						= require( '../../server/components/error/error_handler' );

const MockedErrorHandler				= Mock( ErrorHandler );

test({
	message	: 'EventRequest.should.throw.an.error.with.invalid.constructor.parameters',
	test	: function ( done )
	{
		assert.throws( () => {
			new EventRequest();
		});

		done();
	}
});

test({
	message	: 'EventRequest.should.not.throw.an.error.in.case.of.valid.constructor.parameters',
	test	: ( done ) => {
		helpers.getEventRequest();
		done();
	}
});

test({
	message	: 'EventRequest.should.parse.url',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest( '', '/test?testParam=testValue' );

		assert.strictEqual( eventRequest.path, '/test', 'EventRequest could not parse path' );
		assert.deepEqual( eventRequest.query, { testParam : 'testValue' }, 'EventRequest could not parse query' );

		done();
	}
});

test({
	message	: 'EventRequest.parses.methods',
	test	: ( done ) => {
		let methods	= ['GET', 'DELETE', 'PUT', 'POST'];
		methods.forEach( ( method ) => {
			const eventRequest	= helpers.getEventRequest( method );

			assert.strictEqual( eventRequest.method, method, `Could not validate that ${eventRequest.method} and ${method} are equal!` );
		});

		done();
	}
});

test({
	message	: 'EventRequest.parses.headers',
	test	: ( done ) => {
		let headers			= { headerKey : 'headerValue' };
		const eventRequest	= helpers.getEventRequest( undefined, undefined, headers );

		assert.deepEqual( eventRequest.headers, headers );

		done();
	}
});

test({
	message	: 'EventRequest.errorHandler.does.not.need.to.be.an.instance.of.ErrorHandler',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		assert.doesNotThrow( () => {
			eventRequest.errorHandler	= new ErrorHandler();
			eventRequest.errorHandler	= {};
		});

		done();
	}
});

test({
	message	: 'EventRequest.getErrorHandler.when.nothing.is.attached',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		assert.deepStrictEqual( eventRequest.getErrorHandler() instanceof ErrorHandler, true )

		done();
	}
});

test({
	message	: 'EventRequest.getErrorHandler.when.wrong.object.is.attached',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		eventRequest.errorHandler	= 'WRONG!';

		assert.deepStrictEqual( eventRequest.getErrorHandler() instanceof ErrorHandler, true )

		done();
	}
});

test({
	message	: 'EventRequest.getErrorHandler.when.correct.object.is.attached',
	test	: ( done ) => {
		const errorHandler			= new ErrorHandler();
		errorHandler.addNamespace( 'test', {} );

		const eventRequest			= helpers.getEventRequest();
		eventRequest.errorHandler	= errorHandler;

		assert.deepStrictEqual( eventRequest.getErrorHandler() instanceof ErrorHandler, true )
		assert.deepStrictEqual( eventRequest.getErrorHandler(), errorHandler )

		done();
	}
});

test({
	message	: 'EventRequest.getErrorHandler.twice.returns.same.error.handler',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		assert.deepStrictEqual( eventRequest.getErrorHandler(), eventRequest.getErrorHandler() )

		done();
	}
});

test({
	message	: 'EventRequest.sendError.will.create.a.default.Error.Handler.if.it.is.not.correct',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		let errorToThrow			= 'Error to throw';
		let called					= false;

		eventRequest.errorHandler	= {};
		eventRequest._mock({
			method			: 'send',
			called			: 1,
			shouldReturn	: () => { called = true; }
		});

		eventRequest.sendError( errorToThrow );

		called ? done() : done( 'Send was not called' );
	}
});

test({
	message	: 'EventRequest._cleanUp.emits.event:.cleanUp',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let cleanUp			= false;

		eventRequest.on( 'cleanUp', () => { cleanUp = true; });

		eventRequest._cleanUp();

		cleanUp	? done() : done( 'EventRequest cleanUp event not emitted' );
	}
});

test({
	message	: 'EventRequest._cleanUp.emits.event:.finished',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let finished		= false;
		eventRequest.on( 'finished', () => { finished = true; });

		eventRequest._cleanUp();

		finished	? done() : done( 'EventRequest finished event not emitted' );
	}
});

test({
	message	: 'EventRequest._cleanUp.cleans.up.data',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		eventRequest.on( 'test', () => {} );

		assert.strictEqual( eventRequest.listeners( 'test' ).length, 1 );

		eventRequest._cleanUp();

		assert.strictEqual( eventRequest.internalTimeout, undefined );
		assert.strictEqual( eventRequest.query, undefined );
		assert.strictEqual( eventRequest.headers, undefined );
		assert.strictEqual( eventRequest.method, undefined );
		assert.strictEqual( eventRequest.path, undefined );
		assert.strictEqual( eventRequest.block, undefined );
		assert.strictEqual( eventRequest.validation, undefined );
		assert.strictEqual( eventRequest.request, undefined );
		assert.strictEqual( eventRequest.clientIp, undefined );
		assert.strictEqual( eventRequest.extra, undefined );
		assert.strictEqual( eventRequest.body, undefined );
		assert.strictEqual( eventRequest.fileStreamHandler, undefined );
		assert.strictEqual( eventRequest.errorHandler, undefined );
		assert.strictEqual( eventRequest.extra, undefined );
		assert.strictEqual( eventRequest.cookies, undefined );
		assert.strictEqual( eventRequest.params, undefined );
		assert.strictEqual( eventRequest.disableXPoweredBy, undefined );
		assert.strictEqual( eventRequest.finished, true );
		assert.strictEqual( eventRequest.listeners( 'test' ).length, 0 );

		done();
	}
});

test({
	message			: 'EventRequest.formatResponse',
	dataProvider	: [
		['test', 'test'],
		[{ key: 'value' }, '{"key":"value"}'],
		[[1,2,3,4,5], '[1,2,3,4,5]'],
		[Buffer.from( 'TEST' ), Buffer.from( 'TEST' )],
		[undefined, '']
	],
	test			: ( done, data, expected ) => {
		const eventRequest	= helpers.getEventRequest();
		assert.deepStrictEqual( eventRequest.formatResponse( data ), expected );
		done();
	}
});

test({
	message	: 'EventRequest.send.returns.Promise',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const data			= 'DataToSend';

		assert.deepStrictEqual( eventRequest.send( data ) instanceof Promise, true );
		done();
	}
});

test({
	message	: 'EventRequest.send.returns.empty.string.if.method.is.head.even.if.data.is.passed',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest( 'HEAD' );
		let send			= false;
		const data			= 'DataToSend';

		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: ( payload, encoding ) => {
				assert.deepStrictEqual( payload, Buffer.from( '' ) );
				assert.deepStrictEqual( encoding, 'utf8' );
				send	= true;
			},
			called			: 1
		});

		eventRequest.send( data );

		assert.deepStrictEqual( send, true );
		done();
	}
});

test({
	message	: 'EventRequest.send.calls.formatResponse',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let formatResponse	= false;
		const data			= 'DataToSend';

		eventRequest._mock({
			method			: 'formatResponse',
			shouldReturn	: ( payload ) => {
				assert.deepStrictEqual( payload, data );
				formatResponse	= true;

				return payload;
			},
			called			: 1
		});

		eventRequest.send( data );

		assert.deepStrictEqual( formatResponse, true );
		done();
	}
});

test({
	message	: 'EventRequest.send.calls.response.end',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let send			= false;
		const data			= 'DataToSend';

		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: ( payload, encoding ) => {
				assert.deepStrictEqual( payload, data );
				assert.deepStrictEqual( encoding, 'utf8' );
				send	= true;
			},
			called			: 1
		});

		eventRequest.send( data );

		assert.deepStrictEqual( send, true );
		done();
	}
});

test({
	message	: 'EventRequest.send.when.response.is.not.given',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let send			= false;
		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: () => { send = true; },
			called			: 1
		});

		eventRequest.send();

		send	? done() : done( 'Send did not get called' );
	}
});

test({
	message	: 'EventRequest.send.when.response.is.buffer',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const payload		= Buffer.from( 'test' );

		let send			= false;
		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: ( payload ) => {
				assert.deepStrictEqual( payload, Buffer.from( 'test' ) );
				send	= true;
			},
			called			: 1
		});

		eventRequest.send( payload );

		assert.deepStrictEqual( send, true );
		done();
	}
});

test({
	message	: 'EventRequest.send.with.malformed.payload',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let send			= false;
		eventRequest.response._mock({
			method			: 'end',
			with			: [['Malformed payload']],
			shouldReturn	: () => { send = true; },
			called			: 1
		});

		const circular	= {};
		circular.a		= { b: circular };

		assert.throws(() => {
			eventRequest.send( circular );
		});

		done();
	}
});

test({
	message	: 'EventRequest.getRequestHeaderIfItDoesNotExist',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		eventRequest._mock({
			method			: 'hasRequestHeader',
			shouldReturn	: true
		});

		assert.deepStrictEqual( eventRequest.getRequestHeader( 'non-existing', 'default' ), 'default' );

		done();
	}
});

test({
	message	: 'EventRequest.send.calls.response.end.when.raw',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let send			= false;
		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: () => { send = true; },
			called			: 1
		});

		eventRequest.send( '', 200, true );

		send	? done() : done( 'Send did not get called' );
	}
});


test({
	message	: 'EventRequest.sets.status.code',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		eventRequest.response._mock({
			method			: 'end',
			shouldReturn	: () => {}
		});

		let statusCode	= 200;
		eventRequest.send( '', statusCode );

		assert.strictEqual( eventRequest.response.statusCode, statusCode );
		done();
	}
});

test({
	message	: 'EventRequest.send.method.does.not.call.cleanUp',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let cleanUp			= false;

		eventRequest.on( 'cleanUp', () => { cleanUp = true; });

		eventRequest.send( '' );

		cleanUp	? done( 'EventRequest cleanUp event was emitted on send But should not have been' ) : done();
	}
});

test({
	message	: 'EventRequest.send.method.emits.send',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let sendCalled		= false;

		eventRequest.on( 'send', ( { payload, code } ) => {
			assert.deepStrictEqual( payload, '' );
			assert.deepStrictEqual( code, 200 );
			sendCalled	= true;
		});

		eventRequest.send( '' );

		assert.deepStrictEqual( sendCalled, true );
		done();
	}
});

test({
	message	: 'EventRequest.setResponseHeader.returns.EventRequest',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		assert.deepStrictEqual( eventRequest.setResponseHeader( 'key', 'value' ), eventRequest );

		done();
	}
});

test({
	message	: 'EventRequest.removeResponseHeader.returns.EventRequest',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		assert.deepStrictEqual( eventRequest.removeResponseHeader( 'key' ), eventRequest );

		done();
	}
});

test({
	message	: 'EventRequest.setStatusCode.changes.the.status.code',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		eventRequest.setStatusCode( 200 );

		assert.strictEqual( 200, eventRequest.response.statusCode );
		eventRequest.setStatusCode( 'wrong' );
		assert.strictEqual( 500, eventRequest.response.statusCode );

		done();
	}
});

test({
	message	: 'EventRequest.setStatusCode.returns.eventRequest',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		assert.deepStrictEqual( eventRequest.setStatusCode( 200 ), eventRequest );

		done();
	}
});

test({
	message	: 'EventRequest.setResponseHeader.sets.the.header.in.the.response.if.response.is.not.sent',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		assert.strictEqual( eventRequest.isFinished(), false );
		let setHeader	= false;

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: () => { setHeader = true; },
			called			: 1,
			with			: [['key', 'value']]
		});

		eventRequest.setResponseHeader( 'key', 'value' );
		setHeader	? done() : done( 'EventRequest setHeader did not call response.setHeader' );
	}
});

test({
	message	: 'EventRequest.removeResponseHeader.removes.the.header.in.the.response.if.response.is.not.sent',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		assert.strictEqual( eventRequest.isFinished(), false );
		let removeHeader	= false;

		eventRequest.response._mock({
			method			: 'removeHeader',
			shouldReturn	: () => { removeHeader = true; },
			called			: 1,
			with			: [['key']]
		});

		eventRequest.removeResponseHeader( 'key' );
		removeHeader	? done() : done( 'EventRequest removeResponseHeader did not call response.removeHeader' );
	}
});

test({
	message	: 'EventRequest setResponseHeader does not set header when event is finished and throws error',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		assert.strictEqual( eventRequest.isFinished(), false );

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: () => {
				throw new Error( 'EventRequest setHeader should not have called response.setHeader' );
			}
		});

		eventRequest.response._mock({
			method			: 'finished',
			shouldReturn	: true
		});

		eventRequest.setResponseHeader( 'key', 'value' );
		done();
	}
});

test({
	message	: 'EventRequest removeResponseHeader does not remove header when event is finished and throws error',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		assert.strictEqual( eventRequest.isFinished(), false );

		eventRequest.response._mock({
			method			: 'removeHeader',
			shouldReturn	: () => {
				throw new Error( 'EventRequest removeResponseHeader should not have called response.removeHeader' );
			}
		});

		eventRequest.response._mock({
			method			: 'finished',
			shouldReturn	: true
		});

		eventRequest.removeResponseHeader( 'key' );
		done();
	}
});

test({
	message	: 'EventRequest.redirect emits a redirect event',
	test	: ( done ) => {
		const eventRequest		= helpers.getEventRequest();
		let redirectUrl			= '/test';
		let redirectStatusCode	= 302;
		let redirect			= false;

		eventRequest.on( 'redirect', ( redirectOptions ) => {
			assert.strictEqual( redirectOptions.redirectUrl, redirectUrl );
			assert.strictEqual( redirectOptions.statusCode, redirectStatusCode );
			redirect	= true;
		});

		eventRequest.redirect( redirectUrl, 302 );

		redirect ? done() : done( 'Redirect event not emitted' );
	}
});

test({
	message	: 'EventRequest.redirect.sets.header',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let setResponseHeader		= false;
		let redirectUrl		= '/test';

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: () => { setResponseHeader = true; },
			with			: [
				['Location', redirectUrl],
				['X-Powered-By', 'event_request']
			],
			called			: 2
		});

		eventRequest.redirect( redirectUrl, 302 );

		setResponseHeader ? done() : done( 'Redirect does not set header' );
	}
});

test({
	message	: 'EventRequest.redirect.does.not.redirect.if.response.is.finished',
	test	: ( done ) => {
		const eventRequest		= helpers.getEventRequest();
		let MockedErrorHandler	= Mock( ErrorHandler );
		let errorHandler		= new MockedErrorHandler();
		let errorCalled			= false;

		assert.strictEqual( eventRequest.isFinished(), false );

		eventRequest.response._mock({
			method			: 'setHeader',
			shouldReturn	: () => {
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

// Internally this works since finished is associated with the writableEnded property
test({
	message	: 'EventRequest.isFinished.returns.response.finished',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		eventRequest.response._mock({
			method			: 'finished',
			shouldReturn	: true
		});

		assert.strictEqual( eventRequest.isFinished(), true );

		eventRequest.response._mock({
			method			: 'finished',
			shouldReturn	: false
		});

		assert.strictEqual( eventRequest.isFinished(), false );

		done();
	}
});

test({
	message	: 'EventRequest.isFinished.returns.response.finished.withWritableEnded',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		assert.strictEqual( eventRequest.isFinished(), false );
		eventRequest.response.end( '' );
		assert.strictEqual( eventRequest.isFinished(), true );

		done();
	}
});

test({
	message	: 'EventRequest.isFinished.returns.response.finished.whenCleanup.sets.finished.to.true',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		assert.strictEqual( eventRequest.isFinished(), false );
		eventRequest._cleanUp();
		assert.strictEqual( eventRequest.isFinished(), true );

		done();
	}
});

test({
	message	: 'EventRequest._setBlock.should.set.block',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const block			= ['test'];
		eventRequest._setBlock( block );

		assert.deepEqual( eventRequest.block, block );

		done();
	}
});

test({
	message	: 'EventRequest.next.calls.next.middleware',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		let firstCalled		= false;
		let secondCalled	= false;

		const callbackOne	= ( event ) => {
			firstCalled	= true;
			event.next();
		};
		const callbackTwo	= () => {
			secondCalled	= true;
		};

		const block			= [callbackOne, callbackTwo];
		eventRequest._setBlock( block );

		eventRequest.next();

		firstCalled && secondCalled ? done() : done( 'EventRequest.next chain did not execute correctly' );
	}
});

test({
	message	: 'EventRequest.next.when.next.is.called.when.request.is.finished.and.is.async',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: () => { done(); },
			with			: [[eventRequest, undefined]],
			called			: 1
		});

		eventRequest._setBlock( [async () => {
			throw new Error();
		}] );

		eventRequest.next();
	}
});

test({
	message	: 'EventRequest.next.when.next.is.called.when.request.is.finished.and.is.async',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();

		eventRequest._setBlock( [async ( event ) => {
			event.send( '' );

			throw new Error();
		}] );

		eventRequest.next();

		setTimeout(()=>{
			// A bit of a weird test.. but basically nothing should happen in this test
			done();
		}, 50 );
	}
});

test({
	message	: 'EventRequest.next.handles.thrown.errors',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		let error					= false;
		let firstCalled				= false;
		const errorToThrow			= new Error( 'An Error' );

		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: () => { error = true; },
			with			: [[eventRequest, errorToThrow]],
			called			: 1
		});

		const callbackOne	= () => {
			firstCalled	= true;
			throw errorToThrow;
		};

		const block			= [callbackOne];
		eventRequest._setBlock( block );

		eventRequest.next();

		firstCalled && error ? done() : done( 'EventRequest.next error did not get handled' );
	}
});

test({
	message	: 'EventRequest.next.handles.thrown.errors.when.finished',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		let error					= false;
		const errorToThrow			= new Error( 'An Error' );

		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: () => { error = true; },
			called			: 0
		});

		const callbackOne	= ( event ) => {
			event.end( 'ok!' );
			throw errorToThrow;
		};

		const block			= [callbackOne];
		eventRequest._setBlock( block );

		eventRequest.next();

		error ? done( 'EventRequest.next error got handled but should not have' ) : done();
	}
});

test({
	message	: 'EventRequest.next.handles.thrown.errors.if.async',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		let error					= false;
		let firstCalled				= false;
		const errorToThrow			= new Error( 'An Error' );

		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: () => { error = true; },
			with			: [[eventRequest, errorToThrow]],
			called			: 1
		});

		const callbackOne	= async () => {
			firstCalled	= true;
			throw errorToThrow;
		};

		const block			= [callbackOne];
		eventRequest._setBlock( block );

		eventRequest.next();

		setTimeout(() => {
			firstCalled && error ? done() : done( 'EventRequest.next error did not get handled' );
		}, 100 );
	}
});

test({
	message	: 'EventRequest.next.sends.error.on.error',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		let error					= false;
		let errorToSend				= 'Error was thrown.';
		let errorCode				= 503;

		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: () => { error = true; },
			with			: [[eventRequest, errorToSend]],
			called			: 1
		});

		let callback	= () => {};

		const block		= [callback];
		eventRequest._setBlock( block );

		eventRequest.next( errorToSend, errorCode );

		error ? done() : done( 'EventRequest.next did not dispatch an error' );
	}
});

test({
	message	: 'EventRequest.next.calls.errorHandler.on.no.more.middleware',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		let error					= false;

		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			shouldReturn	: () => { error = true; },
			with			: [[eventRequest, undefined]],
			called			: 1
		});

		const block	= [];
		eventRequest._setBlock( block );

		eventRequest.next();

		error ? done() : done( 'EventRequest.next did not call errorHandler on no more middleware' );
	}
});

test({
	message	: 'EventRequest.sendError.emits.an.error.event',
	test	: ( done ) => {
		const eventRequest			= helpers.getEventRequest();
		let errorToThrow			= 'Error to throw';
		let error					= false;

		let MockedErrorHandler		= Mock( ErrorHandler );
		eventRequest.errorHandler	= new MockedErrorHandler();
		eventRequest.errorHandler._mock({
			method			: 'handleError',
			called			: 1,
			with			: [[eventRequest, errorToThrow]],
			shouldReturn	: () => { error = true; }
		});

		eventRequest.sendError( errorToThrow );

		error ? done() : done( 'Send error did not emit an error' );
	}
});

test({
	message: 'EventRequest.should.have.a.validation.handler',
	test: ( done ) => {
		const eventRequest		= helpers.getEventRequest();
		const ValidationHandler	= require( '../../server/components/validation/validation_handler' );

		assert.strictEqual( typeof eventRequest.validation, 'object' );
		assert.deepStrictEqual( eventRequest.validation, ValidationHandler );

		done();
	}
});

test({
	message: 'EventRequest.setCookie.should.add.a.header.with.the.cookie',
	dataProvider: [
		['key', 'value', { Path: '/', Domain: 'localhost', HttpOnly: true, 'Max-Age': 100, Expires: 500 }, true],
		['key', 123, { Path: '/', Domain: 'localhost', HttpOnly: true, 'Max-Age': 100, Expires: 500 }, true],
		[123, 'value', { Path: '/', Domain: 'localhost', HttpOnly: true, 'Max-Age': 100, Expires: 500 }, true],
		['key', 'value', { Path: '/', Domain: 'localhost', HttpOnly: true, 'Max-Age': 100, Expires: 500 }, true],
		['key', 'value', { Path: '/', Domain: 'localhost', HttpOnly: true, 'Max-Age': 100, Expires: 500 }, true],
		[123, 123, { Path: '/', Domain: 'localhost', HttpOnly: true, 'Max-Age': 100, Expires: 500 }, true],
		['key', null, {}, false],
		[null, 'value', {}, false],
		[null, null, {}, false],
		['key', undefined, {}, false],
		[undefined, 'value', {}, false],
		[undefined, undefined, {}, false],
	],
	test: ( done, name, value, options, shouldReturnTrue ) => {
		const eventRequest		= helpers.getEventRequest();
		let setCookieArguments	= [name, value, options];
		let wasCalled			= false;
		let cookieSet			= '';

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: ( headerName, cookie ) => {
				wasCalled	= true;
				cookieSet	= cookie[0];
			}
		});

		assert.strictEqual( eventRequest.setCookie.apply( eventRequest, setCookieArguments ), shouldReturnTrue );
		assert.strictEqual( wasCalled, shouldReturnTrue );

		for( const option in options )
		{
			assert.strictEqual( cookieSet.includes( option ), true );
		}

		done();
	}
});

test({
	message: 'EventRequest.setCookie.with.hasOwnProperty',
	test: ( done ) => {
		const eventRequest		= helpers.getEventRequest();

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: ( headerName, cookie ) => {
				assert.deepStrictEqual( headerName, 'set-cookie' );
				assert.deepStrictEqual( cookie, ['key=value;'] );
				done();
			}
		});

		eventRequest.setCookie( 'key', 'value', { __proto__: 'hey' } );
	}
});

test({
	message	: 'EventRequest.getRequestHeader.should.return.header',
	test	: ( done ) => {
		const headerName	= 'test';
		const headerValue	= 'TestHeader';

		const eventRequest	= helpers.getEventRequest( '', '/', { [headerName]: headerValue });

		assert.strictEqual( eventRequest.getRequestHeader( headerName ), headerValue );

		done();
	}
});

test({
	message	: 'EventRequest.getRequestHeader.is.case.insensitive',
	test	: ( done ) => {
		const headerName	= 'test';
		const headerValue	= 'TestHeader';

		const eventRequest	= helpers.getEventRequest( '', '/', { [headerName]: headerValue });

		assert.strictEqual( eventRequest.getRequestHeader( headerName.toUpperCase() ), headerValue );
		assert.strictEqual( eventRequest.getRequestHeader( headerName.toLowerCase() ), headerValue );

		done();
	}
});

test({
	message	: 'EventRequest.getRequestHeader.should.return.default.if.header.is.not.set',
	test	: ( done ) => {
		const headerName	= 'test';
		const headerValue	= 'TestHeader';

		const eventRequest	= helpers.getEventRequest();

		assert.strictEqual( eventRequest.getRequestHeader( headerName ), null );
		assert.strictEqual( eventRequest.getRequestHeader( headerName, headerValue ), headerValue );

		done();
	}
});

test({
	message	: 'EventRequest.hasRequestHeader.returns.false.if.header.does.not.exist',
	test	: ( done ) => {
		const headerName	= 'test';

		const eventRequest	= helpers.getEventRequest();

		assert.strictEqual( eventRequest.hasRequestHeader( headerName ), false );

		done();
	}
});

test({
	message	: 'EventRequest.hasRequestHeader.returns.true.if.header.exists',
	test	: ( done ) => {
		const headerName	= 'test';
		const headerValue	= 'TestHeader';

		const eventRequest	= helpers.getEventRequest( '', '/', { [headerName]: headerValue });

		assert.strictEqual( eventRequest.hasRequestHeader( headerName ), true );

		done();
	}
});

test({
	message	: 'EventRequest.getRequestHeaders.returns.all.request.headers',
	test	: ( done ) => {
		const headers	= {
			headerOne: 'valueOne',
			headerTwo: 'valueTwo',
			headerThree: 'valueThree'
		};

		const eventRequest	= helpers.getEventRequest( '', '/', headers );

		assert.strictEqual( eventRequest.getRequestHeaders(), headers );

		done();
	}
});

test({
	message	: 'EventRequest.next.sends.404.if.route.does.not.exist',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest( 'GET', '/' );
		let called			= false;

		eventRequest._mock({
			method: 'send',
			shouldReturn: function( one, two ){
				assert.deepStrictEqual( one, { error: { code: 'app.general', message: 'Cannot GET /' } } );
				assert.strictEqual( 404, two );
				called	= true;
			}
		});

		eventRequest.next();

		assert.strictEqual( called, true );

		done();
	}
});
