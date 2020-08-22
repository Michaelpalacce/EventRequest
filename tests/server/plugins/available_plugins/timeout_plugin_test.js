'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const TimeoutPlugin				= require( '../../../../server/plugins/available_plugins/timeout_plugin' );
const Router					= require( '../../../../server/components/routing/router' );

test({
	message	: 'TimeoutPlugin.times.out.when.added',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		let timeoutPlugin		= new TimeoutPlugin( 'id', { timeout: 1 } );
		let router				= new Router();
		let error				= false;

		let pluginMiddlewares	= timeoutPlugin.getPluginMiddleware();

		eventRequest.response._mock({
			method			: 'setTimeout',
			with			: [
				[1]
			],
			shouldReturn	: () => {
				error	= true;
			}
		});

		assert.deepStrictEqual( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.deepStrictEqual( true, typeof eventRequest.clearTimeout !== 'undefined' );
		assert.deepStrictEqual( true, typeof eventRequest.setTimeout !== 'undefined' );

		// Since the timeout is in the event loop, add the done callback at the end of the event loop
		setTimeout(() => {
			error ? done() : done( 'Request did not time out and it should have' );
		}, 50 );
	}
});

test({
	message	: 'TimeoutPlugin.clearTimeout',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		let timeoutPlugin		= new TimeoutPlugin( 'id', { timeout: 0 } );
		let router				= new Router();
		let called				= 0;

		let pluginMiddlewares	= timeoutPlugin.getPluginMiddleware();

		eventRequest.response._mock({
			method			: 'setTimeout',
			shouldReturn	: () => {
				called++;
			}
		});

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.on( 'error', ( err ) => {});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		eventRequest.clearTimeout();

		setTimeout(() => {
			assert.deepStrictEqual( called, 2 );
			done();
		}, 50 );
	}
});
