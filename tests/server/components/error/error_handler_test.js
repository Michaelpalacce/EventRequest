'use strict';

const { assert, test, helpers }	= require( '../../../test_helper' );
const ErrorHandler				= require( '../../../../server/components/error/error_handler' );

test({
	message			: 'ErrorHandler._formatError formats the error correctly',
	dataProvider	: [
		['An Error Has Occurred!', { error: 'An Error Has Occurred!'}],
		[123, { error: 123}],
		[['test'], {error: ['test']}],
		[{ key: 'value' }, { error: { key: 'value' } }],
	],
	test			: ( done, errorToFormat, expected ) => {
		const errorHandler	= new ErrorHandler();

		assert.deepStrictEqual( errorHandler._formatError( errorToFormat ), expected );
		assert.deepStrictEqual( errorHandler._formatError( errorToFormat ), expected );

		done();
	}
});

test({
	message			: 'ErrorHandler.handleError handles an Error successfully by emitting the stack on_error and sending the message to event.send',
	test			: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const errorHandler	= new ErrorHandler();
		const error			= new Error( 'An Error Has Occurred' );
		let called			= false;
		let emitCalled		= 0;

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: ( errorMessage, code ) => {
				assert.deepStrictEqual( errorMessage, { error : 'An Error Has Occurred' } );
				assert.equal( 501, code );
				called	= true;
			}
		});

		eventRequest._mock({
			method			: 'emit',
			shouldReturn	: ( event, emittedError ) => {
				emitCalled	++;
				assert.equal( event, 'on_error' );
				assert.equal( emittedError, error.stack );
			},
			with			: [
				['on_error', undefined],
			],
			called			: 1
		});

		errorHandler.handleError( eventRequest, error, 501 );

		assert.equal( called, true );
		assert.equal( emitCalled, 1 );

		done();
	}
});

test({
	message			: 'ErrorHandler.sendError sends an error',
	test			: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const errorHandler	= new ErrorHandler();
		const error			= new Error( 'An Error Has Occurred' );
		let called			= false;

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: ( errorMessage, code ) => {
				assert.deepStrictEqual( errorMessage instanceof Error, true );
				assert.equal( 501, code );
				called	= true;
			}
		});

		errorHandler._sendError( eventRequest, error, 501 );

		assert.equal( called, true );

		done();
	}
});

test({
	message			: 'ErrorHandler.sendError does not send an error if response is finished',
	test			: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const errorHandler	= new ErrorHandler();
		const error			= new Error( 'An Error Has Occurred' );

		eventRequest._mock({
			method	: 'send',
			called	: 0
		});

		eventRequest.response.finished	= true;

		errorHandler._sendError( eventRequest, error, 501 );

		done();
	}
});
