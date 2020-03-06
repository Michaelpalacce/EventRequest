'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const TimeoutPlugin				= require( '../../../../server/plugins/available_plugins/timeout_plugin' );
const Router					= require( '../../../../server/components/routing/router' );

test({
	message	: 'TimeoutPlugin times out when added',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let timeoutPlugin		= new TimeoutPlugin( 'id', { timeout: 0 } );
		let router				= new Router();
		let error				= false;

		let pluginMiddlewares	= timeoutPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.on( 'on_error', ( err )=>{
			assert.equal( typeof err === 'string', true );
			error	= true;
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( true, typeof eventRequest.clearTimeout !== 'undefined' );
		assert.equal( true, typeof eventRequest.internalTimeout !== 'undefined' );

		// Since the timeout is in the event loop, add the done callback at the end of the event loop
		setTimeout(()=>{
			error ? done() : done( 'Request did not time out and it should have' );
		});
	}
});

test({
	message	: 'TimeoutPlugin stream_start',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let timeoutPlugin		= new TimeoutPlugin( 'id', { timeout: 0 } );
		let router				= new Router();
		let called				= false;

		let pluginMiddlewares	= timeoutPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.on( 'error', ( err )=>{});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		eventRequest.on( 'clearTimeout', ()=>{
			called	= true;
		});

		eventRequest.emit( 'stream_start' );
		assert.equal( false, typeof eventRequest.internalTimeout !== 'undefined' );

		setTimeout(()=>{
			called ? done() : done( 'clearTimeout not called' );
		});
	}
});

test({
	message	: 'TimeoutPlugin stream_end',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let timeoutPlugin		= new TimeoutPlugin( 'id', { timeout: 0 } );
		let router				= new Router();

		let pluginMiddlewares	= timeoutPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.on( 'error', ( err )=>{});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		eventRequest.emit( 'stream_start' );
		assert.equal( true, typeof eventRequest.internalTimeout === 'undefined' );

		eventRequest.emit( 'stream_end' );
		assert.equal( true, typeof eventRequest.internalTimeout !== 'undefined' );

		done();
	}
});

test({
	message	: 'TimeoutPlugin clearTimeout',
	test	: ( done )=>{
		let eventRequest		= helpers.getEventRequest();
		let timeoutPlugin		= new TimeoutPlugin( 'id', { timeout: 0 } );
		let router				= new Router();

		let pluginMiddlewares	= timeoutPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.on( 'error', ( err )=>{});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		eventRequest.clearTimeout();
		assert.equal( true, typeof eventRequest.internalTimeout === 'undefined' );

		done();
	}
});
