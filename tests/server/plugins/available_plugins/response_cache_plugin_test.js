'use strict';

// Dependencies
const { assert, test, helpers, Mock, Mocker }	= require( '../../../test_helper' );
const ResponseCachePlugin						= require( '../../../../server/plugins/available_plugins/response_cache_plugin' );
const Router									= require( '../../../../server/components/routing/router' );

test({
	message		: 'ResponseCachePlugin adds a cacheCurrentRequest method',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest( 'GET', '/tests' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let router				= new Router();

		let pluginMiddlewares	= responseCachePlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( true, typeof eventRequest.cacheCurrentRequest !== 'undefined' );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin doesn\'t cache if already exists',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/attachesEvent' );
		let eventRequest2		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/attachesEvent' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let cachingServer		= helpers.getCachingServer();
		let router				= new Router();
		let cached				= false;

		responseCachePlugin.cachingServer	= cachingServer;
		let pluginMiddlewares				= responseCachePlugin.getPluginMiddleware();

		eventRequest2.on( 'cachedResponse', ()=>{
			cached	= true;
		} );

		assert.equal( 1, pluginMiddlewares.length );

		eventRequest.cachingServer	= cachingServer;
		eventRequest2.cachingServer	= cachingServer;
		router.add( pluginMiddlewares[0] );
		router.add({
			route	: '/test/responseCachePlugin/attachesEvent',
			handler	: ( event )=>{

				event.cacheCurrentRequest();
			}
		});
		router.add({
			handler	: ( event )=>{
				event.send( 'Test' );
			}
		});
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		eventRequest2.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest2 ) );
		eventRequest2.next();

		setTimeout(()=>{
			cached === false ? done( 'Response was not cached but it should have been' ) : done();
		}, 250 );
	}
});

test({
	message		: 'ResponseCachePlugin getCacheId doesn\'t use ip by default',
	test		: ( done )=>{
		let path				= '/path';
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let eventRequest		= helpers.getEventRequest( 'GET', path );
		let cacheId				= responseCachePlugin.getCacheId( eventRequest );

		assert.equal( path, cacheId );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin getCacheId uses ip if set in config',
	test		: ( done )=>{
		let path				= '/path';
		let ipAddress			= '127.0.0.1';
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		responseCachePlugin.setOptions({
			useIp	: true
		});
		let eventRequest		= helpers.getEventRequest( 'GET', path );
		let connection			= {
			remoteAddress	: ipAddress,
		};

		eventRequest.request._mock({
			method			: 'connection',
			shouldReturn	: connection
		});

		let cacheId	= responseCachePlugin.getCacheId( eventRequest );

		assert.equal( path + ipAddress, cacheId );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin getCacheId uses given options instead of config if any',
	test		: ( done )=>{
		let path				= '/path';
		let ipAddress			= '127.0.0.1';
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		responseCachePlugin.setOptions({
			useIp	: true
		});
		let eventRequest		= helpers.getEventRequest( 'GET', path );
		let connection			= {
			remoteAddress	: ipAddress,
		};

		eventRequest.request._mock({
			method			: 'connection',
			shouldReturn	: connection
		});

		eventRequest.currentResponseCacheConfig	= {
			useIp	: false
		};

		let cacheId	= responseCachePlugin.getCacheId( eventRequest );

		assert.equal( path, cacheId );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin getTimeToLive on default',
	test		: ( done )=>{
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let eventRequest		= helpers.getEventRequest( 'GET', '/test' );

		let ttl					= responseCachePlugin.getTimeToLive( eventRequest );

		assert.equal( 60 * 5000, ttl );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin getTimeToLive if set on config',
	test		: ( done )=>{
		let configTtl			= 10;
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let eventRequest		= helpers.getEventRequest( 'GET', '/test' );
		responseCachePlugin.setOptions({
			ttl	: configTtl
		});
		let ttl	= responseCachePlugin.getTimeToLive( eventRequest );

		assert.equal( configTtl, ttl );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin getTimeToLive set on config is overwritten if passed',
	test		: ( done )=>{
		let configTtl			= 10;
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let eventRequest		= helpers.getEventRequest( 'GET', '/test' );
		responseCachePlugin.setOptions({
			ttl	: configTtl
		});

		eventRequest.currentResponseCacheConfig	= {
			ttl	: 11
		};

		let ttl										= responseCachePlugin.getTimeToLive( eventRequest );

		assert.equal( 11, ttl );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin getPluginDependencies depends on cache server',
	test		: ( done )=>{
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );

		assert.deepStrictEqual( ['er_cache_server'], responseCachePlugin.getPluginDependencies() );

		done();
	}
});
