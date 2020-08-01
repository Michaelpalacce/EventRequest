'use strict';

const { assert, test, helpers }	= require( '../../../test_helper' );
const ErrorHandler				= require( '../../../../server/components/error/error_handler' );

test({
	message			: 'ErrorHandler._formatError.formats.the.error.correctly',
	dataProvider	: [
		['An Error Has Occurred!', 'An Error Has Occurred!'],
		[123, 123],
		[['test'], ['test']],
		[{ key: 'value' }, { key: 'value' }],
		[new Error( 'ErrorMessage' ), 'ErrorMessage'],
	],
	test			: ( done, errorToFormat, expected ) => {
		const errorHandler	= new ErrorHandler();

		assert.deepStrictEqual( errorHandler._formatError( errorToFormat ), expected );
		assert.deepStrictEqual( errorHandler._formatError( errorToFormat ), expected );

		done();
	}
});

test({
	message			: 'ErrorHandler.handleError.handles.an.Error.successfully.by.emitting.the.stack.on_error.and.sending.the.message.to.event.send',
	test			: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const errorHandler	= new ErrorHandler();
		const error			= new Error( 'An Error Has Occurred' );
		let called			= false;
		let emitCalled		= 0;

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: ( errorMessage, code ) => {
				assert.deepStrictEqual( errorMessage, { error : { code: 'app.general', message: 'An Error Has Occurred' } } );
				assert.equal( 501, code );
				called	= true;
			}
		});

		eventRequest._mock({
			method			: 'emit',
			shouldReturn	: ( event, emittedError ) => {
				emitCalled	++;
				assert.equal( event, 'on_error' );
			},
			with			: [
				['on_error', { code: 'app.general', error: error, status: 501, message: error.message }],
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
	message			: 'ErrorHandler.handleError.with.different.errors',
	dataProvider	: [
		[],
	],
	test			: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const errorHandler	= new ErrorHandler();
		const error			= new Error( 'An Error Has Occurred' );
		let called			= false;
		let emitCalled		= 0;

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: ( errorMessage, code ) => {
				assert.deepStrictEqual( errorMessage, { error : { code: 'app.general', message: 'An Error Has Occurred' } } );
				assert.deepStrictEqual( 501, code );
				called	= true;
			}
		});

		eventRequest._mock({
			method			: 'emit',
			shouldReturn	: ( event ) => {
				emitCalled	++;
				assert.deepStrictEqual( event, 'on_error' );
			},
			with			: [
				['on_error', { code: 'app.general', error: error, status: 501, message: error.message }],
			],
			called			: 1
		});

		errorHandler.handleError( eventRequest, error, 501 );

		assert.deepStrictEqual( called, true );
		assert.deepStrictEqual( emitCalled, 1 );

		done();
	}
});
