'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const ResponseCachePlugin		= require( '../../../../server/plugins/available_plugins/response_cache_plugin' );
const Router					= require( '../../../../server/components/routing/router' );

test({
	message		: 'ResponseCachePlugin.adds.a.cacheCurrentRequest.method',
	test		: ( done ) => {
		let eventRequest		= helpers.getEventRequest( 'GET', '/tests' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let router				= new Router();

		let pluginMiddlewares	= responseCachePlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( true, typeof eventRequest.cacheCurrentRequest !== 'undefined' );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin.doesn\'t.cache.if.already.cached',
	test		: ( done ) => {
		let eventRequest		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/attachesEvent' );
		let eventRequest2		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/attachesEvent' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let dataServer			= helpers.getDataServer();
		let router				= new Router();
		let cached				= false;

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
	message		: 'ResponseCachePlugin.doesn\'t.cache.if.status.is.not.2xx',
	test		: ( done ) => {
		let eventRequest		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/not2xx' );
		let eventRequest2		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/not2xx' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let dataServer			= helpers.getDataServer();
		let router				= new Router();
		let cached				= false;

		responseCachePlugin.dataServer	= dataServer;
		let pluginMiddlewares			= responseCachePlugin.getPluginMiddleware();

		eventRequest2.on( 'cachedResponse', () => {
			done( 'Cached but should not have been' );
		});

		assert.equal( 1, pluginMiddlewares.length );

		eventRequest.dataServer		= dataServer;
		eventRequest2.dataServer	= dataServer;
		router.add( pluginMiddlewares[0] );
		router.add({
			route	: '/test/responseCachePlugin/not2xx',
			handler	: ( event ) => {
				event.cacheCurrentRequest();
			}
		});
		router.add({
			handler	: ( event ) => {
				event.send( 'Test', 300 );
			}
		});
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		setTimeout(() => {
			eventRequest2._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest2 ) );
			eventRequest2.next();
			setTimeout(() => {
				done();
			}, 50 );
		}, 50 );
	}
});

test({
	message		: 'ResponseCachePlugin.caches.if.response.is.number',
	test		: ( done ) => {
		let eventRequest		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/NUMBER' );
		let eventRequest2		= helpers.getEventRequest( 'GET', '/test/responseCachePlugin/NUMBER' );
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let dataServer			= helpers.getDataServer();
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

test({
	message		: 'ResponseCachePlugin.getCacheId.doesn\'t.use.ip.by.default',
	test		: ( done ) => {
		let path				= '/path';
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let eventRequest		= helpers.getEventRequest( 'GET', path );
		let cacheId				= responseCachePlugin.getCacheId( eventRequest );

		assert.equal( path, cacheId );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin.getCacheId.uses.ip.if.set.in.config',
	test		: ( done ) => {
		let path				= '/path';
		let ipAddress			= '127.0.0.1';
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		responseCachePlugin.setOptions({
			useIp	: true
		});
		let eventRequest		= helpers.getEventRequest( 'GET', path );
		let socket			= {
			remoteAddress	: ipAddress,
		};

		eventRequest.request._mock({
			method			: 'socket',
			shouldReturn	: socket
		});

		let cacheId	= responseCachePlugin.getCacheId( eventRequest );

		assert.equal( path + ipAddress, cacheId );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin.getCacheId.uses.given.options.instead.of.config.if.any',
	test		: ( done ) => {
		let path				= '/path';
		let ipAddress			= '127.0.0.1';
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		responseCachePlugin.setOptions({
			useIp	: true
		});
		let eventRequest		= helpers.getEventRequest( 'GET', path );
		let socket			= {
			remoteAddress	: ipAddress,
		};

		eventRequest.request._mock({
			method			: 'socket',
			shouldReturn	: socket
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
	message		: 'ResponseCachePlugin.getTimeToLive.on.default',
	test		: ( done ) => {
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let eventRequest		= helpers.getEventRequest( 'GET', '/test' );

		let ttl					= responseCachePlugin.getTimeToLive( eventRequest );

		assert.equal( 60 * 5000, ttl );

		done();
	}
});

test({
	message		: 'ResponseCachePlugin.getTimeToLive.if.set.on.config',
	test		: ( done ) => {
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
	message		: 'ResponseCachePlugin.getTimeToLive.set.on.config.is.overwritten.if.passed',
	test		: ( done ) => {
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
	message		: 'ResponseCachePlugin.getPluginDependencies.depends.on.cache.server',
	test		: ( done ) => {
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );

		assert.deepStrictEqual( ['er_data_server'], responseCachePlugin.getPluginDependencies() );

		done();
	}
});
