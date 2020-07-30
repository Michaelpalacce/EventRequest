'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const ResponseCachePlugin		= require( '../../../../server/plugins/available_plugins/response_cache_plugin' );
const DataServerMap				= require( '../../../../server/components/caching/data_server_map' );
const Router					= require( '../../../../server/components/routing/router' );

test({
	message		: 'ResponseCachePlugin.with.map.doesn\'t.cache.if.already.cached',
	test		: ( done ) => {
		let eventRequest		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/attachesEvent' );
		let eventRequest2		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/attachesEvent' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let dataServer			= new DataServerMap( { persist: false } );
		let router				= new Router();

		responseCachePlugin.dataServer	= dataServer;
		let pluginMiddlewares			= responseCachePlugin.getPluginMiddleware();

		eventRequest2.on( 'cachedResponse', () => {
			done();
		} );

		assert.equal( 1, pluginMiddlewares.length );

		eventRequest.dataServer		= dataServer;
		eventRequest2.dataServer	= dataServer;
		router.add( pluginMiddlewares[0] );
		router.add({
			route	: '/test/responseCachePlugin/attachesEvent',
			handler	: ( event ) => {
				event.cacheCurrentRequest();
			}
		});
		router.add({
			handler	: ( event ) => {
				event.send( 'Test' );
			}
		});
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		setTimeout(() => {
			eventRequest2._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest2 ) );
			eventRequest2.next();
		}, 50 );
	}
});

test({
	message		: 'ResponseCachePlugin.with.map.doesn\'t.cache.if.response.is.not.defined.when.response.is.raw',
	test		: ( done ) => {
		let eventRequest		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/RAW' );
		let eventRequest2		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/RAW' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let dataServer			= new DataServerMap( { persist: false } );
		let router				= new Router();

		responseCachePlugin.dataServer	= dataServer;
		let pluginMiddlewares			= responseCachePlugin.getPluginMiddleware();

		eventRequest2.on( 'cachedResponse', () => {
			done( 'should not have been called' );
		} );

		assert.equal( 1, pluginMiddlewares.length );

		eventRequest.dataServer		= dataServer;
		eventRequest2.dataServer	= dataServer;

		router.add( pluginMiddlewares[0] );
		router.add({
			route	: '/test/responseCachePlugin/RAW',
			handler	: ( event ) => {
				event.cacheCurrentRequest();
			}
		});
		router.add({
			handler	: ( event ) => {
				event.send( null, null, true );
			}
		});
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		setTimeout(() => {
			eventRequest2._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest2 ) );
			eventRequest2.next();

			setTimeout(()=>{
				done();
			}, 50 );
		}, 50 );
	}
});

test({
	message		: 'ResponseCachePlugin.with.map.caches.if.response.is.number',
	test		: ( done ) => {
		let eventRequest		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/NUMBER' );
		let eventRequest2		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/NUMBER' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let dataServer			= new DataServerMap( { persist: false } );
		let router				= new Router();

		responseCachePlugin.dataServer	= dataServer;
		let pluginMiddlewares			= responseCachePlugin.getPluginMiddleware();

		eventRequest2.on( 'cachedResponse', () => {
			done();
		} );

		assert.equal( 1, pluginMiddlewares.length );

		eventRequest.dataServer		= dataServer;
		eventRequest2.dataServer	= dataServer;

		router.add( pluginMiddlewares[0] );
		router.add({
			route	: '/test/responseCachePlugin/NUMBER',
			handler	: ( event ) => {
				event.cacheCurrentRequest();
			}
		});
		router.add({
			handler	: ( event ) => {
				event.send( 1 );
			}
		});
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		setTimeout(() => {
			eventRequest2._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest2 ) );
			eventRequest2.next();
		}, 50 );
	}
});
