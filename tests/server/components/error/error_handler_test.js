'use strict';

const { assert, test, helpers }	= require( '../../../test_helper' );
const ErrorHandler				= require( '../../../../server/components/error/error_handler' );

test({
	message			: 'ErrorHandler.formatError formats the error correctly',
	dataProvider	: [
		['An Error Has Occurred!', { error: 'An Error Has Occurred!'}],
		[123, { error: 123}],
		[['test'], ['test']],
		[{ key: 'value' }, { key: 'value' }],
	],
	test			: ( done, errorToFormat, expected )=>{
		const errorHandler	= new ErrorHandler();

		assert.deepStrictEqual( errorHandler.formatError( errorToFormat ), expected );
		assert.deepStrictEqual( errorHandler.formatError( errorToFormat ), expected );

		done();
	}
});

test({
	message			: 'ErrorHandler.handleError handles a Error successfully by emitting the stack on_error and sending the message to event.send',
	test			: ( done )=>{
		const eventRequest	= helpers.getEventRequest();
		const errorHandler	= new ErrorHandler();
		const error			= new Error( 'An Error Has Occurred' );
		let called			= false;
		let emitCalled		= 0;

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: ( errorMessage, code )=>{
				assert.deepStrictEqual( errorMessage, { error : 'An Error Has Occurred' } );
				assert.equal( 501, code );
				called	= true;
			}
		});

		eventRequest._mock({
			method			: 'emit',
			shouldReturn	: ( event, emittedError )=>{
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
