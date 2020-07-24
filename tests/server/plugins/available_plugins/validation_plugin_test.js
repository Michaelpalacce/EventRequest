'use strict';

// Dependencies
const { Mock, assert, test, helpers }	= require( '../../../test_helper' );
const ValidationPlugin					= require( '../../../../server/plugins/available_plugins/validation_plugin' );

test({
	message	: 'ValidationPlugin.constructor.on.defaults.does.not.throw',
	test	: ( done )=>{
		assert.doesNotThrow(() => {
			const plugin	= new ValidationPlugin();

			assert.equal( plugin.getPluginId(), undefined );
		});

		done();
	}
});

test({
	message	: 'ValidationPlugin.getMiddleware',
	test	: ( done )=>{
		const plugin	= new ValidationPlugin();

		assert.equal( Array.isArray( plugin.getPluginMiddleware() ), true );
		assert.equal( plugin.getPluginMiddleware().length, 0 );

		done();
	}
});

test({
	message	: 'ValidationPlugin.validate',
	test	: ( done )=>{
		const plugin				= new ValidationPlugin();
		const eventRequest			= helpers.getEventRequest( 'GET', '/?testKey=123&testKeyTwo=123', { headerTest: '123', headerTestTwo: 123 } );
		const validationCallback	= plugin.validate( { query: { testKey: 'numeric||range:1-255' }, headers: { headerTest: 'numeric||range:1-255' } }, () => { done( 'Validation Failed' ); } );

		eventRequest._mock({
			method			: 'next',
			shouldReturn	: () => {

				assert.deepStrictEqual( eventRequest.query.testKey, 123 );
				assert.deepStrictEqual( eventRequest.query.testKeyTwo, '123' );
				assert.deepStrictEqual( eventRequest.headers.headerTest, 123 );
				assert.deepStrictEqual( eventRequest.headers.headerTestTwo, 123 );

				done();
			}
		});

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: () => {
				done( 'Should not be called' );
			}
		});

		validationCallback( eventRequest );
	}
});

test({
	message	: 'ValidationPlugin.validate.calls.provided.error.function.on.error',
	test	: ( done )=>{
		const plugin				= new ValidationPlugin();
		const eventRequest			= helpers.getEventRequest( 'GET', '/?testKey=wrong&testKeyTwo=123', { headerTest: '123', headerTestTwo: 123 } );
		const validationCallback	= plugin.validate(
			{ query: { testKey: 'numeric||range:1-255' }, headers: { headerTest: 'numeric||range:1-255' } },
			( event, validationProperty, validationResult )=>{
				assert.deepStrictEqual( eventRequest, event );
				assert.deepStrictEqual( validationProperty, 'query' );
				assert.deepStrictEqual( validationResult.getValidationResult(), { testKey: ['numeric'] } );
				done();
			}
		);

		eventRequest._mock({
			method			: 'next',
			shouldReturn	: () => {
				done( 'Should not be called' );
			}
		});

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: () => {
				done( 'Should not be called' );
			}
		});

		validationCallback( eventRequest );
	}
});

test({
	message	: 'ValidationPlugin.validate.calls.event.send.if.no.error.function.provided',
	test	: ( done )=>{
		const plugin				= new ValidationPlugin();
		const eventRequest			= helpers.getEventRequest( 'GET', '/?testKey=wrong&testKeyTwo=123', { headerTest: '123', headerTestTwo: 123 } );
		const validationCallback	= plugin.validate(
			{ query: { testKey: 'numeric||range:1-255' }, headers: { headerTest: 'numeric||range:1-255' } }
		);

		eventRequest._mock({
			method			: 'next',
			shouldReturn	: () => {
				done( 'Should not be called' );
			}
		});

		eventRequest._mock({
			method			: 'send',
			called			: 1,
			with			: [
				[{ query: { testKey: ['numeric'] } }]
			],
			shouldReturn	: () => {
				done();
			}
		});

		validationCallback( eventRequest );
	}
});

test({
	message	: 'ValidationPlugin.validate.calls.event.send.if.no.error.function.provided.and.only.provides.the.first.error',
	test	: ( done )=>{
		const plugin				= new ValidationPlugin();
		const eventRequest			= helpers.getEventRequest( 'GET', '/?testKey=wrong&testKeyTwo=123', { headerTest: 'wrong', headerTestTwo: 123 } );
		const validationCallback	= plugin.validate(
			{ query: { testKey: 'numeric||range:1-255' }, headers: { headerTest: 'numeric||range:1-255' } }
		);

		eventRequest._mock({
			method			: 'next',
			shouldReturn	: () => {
				done( 'Should not be called' );
			}
		});

		eventRequest._mock({
			method			: 'send',
			called			: 1,
			with			: [
				[{ query: { testKey: ['numeric'] } }]
			],
			shouldReturn	: () => {
				done();
			}
		});

		validationCallback( eventRequest );
	}
});


test({
	message	: 'ValidationPlugin.validate.with.default.failureCallback',
	test	: ( done )=>{
		const plugin				= new ValidationPlugin(
			'er_validation',
			{
				failureCallback: ( event )=>{
					event.send( 'error' );
				}
			}
		);
		const eventRequest			= helpers.getEventRequest( 'GET', '/?testKey=wrong&testKeyTwo=123', { headerTest: 'wrong', headerTestTwo: 123 } );
		const validationCallback	= plugin.validate(
			{ query: { testKey: 'numeric||range:1-255' }, headers: { headerTest: 'numeric||range:1-255' } }
		);

		eventRequest._mock({
			method			: 'next',
			shouldReturn	: () => {
				done( 'Should not be called' );
			}
		});

		eventRequest._mock({
			method			: 'send',
			called			: 1,
			with			: [
				['error']
			],
			shouldReturn	: () => {
				done();
			}
		});

		validationCallback( eventRequest );
	}
});
