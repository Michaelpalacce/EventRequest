'use strict';

// Dependencies
const { assert, test, helpers, Mock, Mocker }	= require( '../../../test_helper' );
const ResponseCachePlugin						= require( '../../../../server/plugins/available_plugins/response_cache_plugin' );
const CachingServerPlugin						= require( '../../../../server/plugins/available_plugins/memory_data_server_plugin' );
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
	message		: 'ResponseCachePlugin setNamespace creates namespace',
	test		: ( done )=>{
		let cachingServer		= helpers.getCachingServer();
		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let namespace			= 'rcp';

		cachingServer.setUp().then(()=>{
			responseCachePlugin.setUpNamespace( cachingServer );

			setTimeout(()=>{
				cachingServer.existsNamespace( namespace ).then( ( exists )=>{
					exists === true ? done() : done( `The namespace ${namespace} does not exist` );
				} ).catch( done )
			}, 250 );
		});
	}
});

test({
	message		: 'ResponseCachePlugin setServerOnRuntime sets up namespace',
	test		: ( done )=>{
		let MockServer					= Mock( helpers.getServer().constructor );
		let MockCachingServerPlugin		= Mock( CachingServerPlugin );
		let cachingServer				= helpers.getCachingServer();
		let cachingServerPlugin			= new MockCachingServerPlugin();
		let server						= new MockServer();

		cachingServerPlugin._mock({
			method			: 'getServer',
			shouldReturn	: cachingServer
		});

		server._mock({
			method			: 'getPlugin',
			with			: [['er_cache_server']],
			shouldReturn	: cachingServerPlugin
		});

		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		let namespace			= 'rcp';

		responseCachePlugin.setServerOnRuntime( server );

		setTimeout(()=>{
			cachingServer.existsNamespace( namespace ).then( ( exists )=>{
				exists === true ? done() : done( `The namespace ${namespace} does not exist` );
			} ).catch( done )
		}, 250 );
	}
});

test({
	message		: 'ResponseCachePlugin setServerOnRuntime tries to set up namespace if server is in running state',
	test		: ( done )=>{
		let MockServer					= Mock( helpers.getServer().constructor );
		let MockCachingServerPlugin		= Mock( CachingServerPlugin );
		let MockCachingServer			= Mock( helpers.getCachingServer().constructor );
		let cachingServer				= new MockCachingServer();
		let cachingServerPlugin			= new MockCachingServerPlugin();
		let server						= new MockServer();
		let called						= false;
		let namespace					= 'rcp';

		cachingServer._mock({
			method			: 'getServerState',
			shouldReturn	: 2
		});

		cachingServer._mock({
			method			: 'existsNamespace',
			with			: [[namespace]],
			shouldReturn	: ()=>{
				return new Promise(( resolve, reject )=>{
					called	= true;
					resolve( true )
				});
			},
			called			: 1
		});

		cachingServer._mock({
			method			: 'createNamespace',
			shouldReturn	: ()=>{
				done( 'Should not have entered createNamespace since namespace exists' )
			},
			called			: 0
		});

		cachingServerPlugin._mock({
			method			: 'getServer',
			shouldReturn	: cachingServer
		});

		server._mock({
			method			: 'getPlugin',
			with			: [['er_cache_server']],
			shouldReturn	: cachingServerPlugin
		});

		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		responseCachePlugin.setOptions({
			callback	: ( err )=>{
				called === true && err === false ? done() : done( 'CachingServer existsNamespace was not called but it should have' );
			}
		});
		responseCachePlugin.setServerOnRuntime( server );
	}
});

test({
	message		: 'ResponseCachePlugin setServerOnRuntime tries to create namespace',
	test		: ( done )=>{
		let MockServer					= Mock( helpers.getServer().constructor );
		let MockCachingServerPlugin		= Mock( CachingServerPlugin );
		let MockCachingServer			= Mock( helpers.getCachingServer().constructor );
		let cachingServer				= new MockCachingServer();
		let cachingServerPlugin			= new MockCachingServerPlugin();
		let server						= new MockServer();
		let called						= false;
		let namespace					= 'rcp';

		cachingServer._mock({
			method			: 'getServerState',
			shouldReturn	: 2
		});

		cachingServer._mock({
			method			: 'existsNamespace',
			with			: [[namespace]],
			shouldReturn	: ()=>{
				return new Promise(( resolve, reject )=>{
					resolve( false )
				});
			},
			called			: 1
		});

		cachingServer._mock({
			method			: 'createNamespace',
			shouldReturn	: ()=>{
				called	= true;
				return new Promise(( resolve, reject )=>{
					resolve( true )
				});
			},
			called			: 1
		});

		cachingServerPlugin._mock({
			method			: 'getServer',
			shouldReturn	: cachingServer
		});

		server._mock({
			method			: 'getPlugin',
			with			: [['er_cache_server']],
			shouldReturn	: cachingServerPlugin
		});

		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		responseCachePlugin.setOptions({
			callback	: ( err )=>{
				called === true && err === false ? done() : done( 'CachingServer createNamespace was not called but it should have' );
			}
		});
		responseCachePlugin.setServerOnRuntime( server );
	}
});

test({
	message		: 'ResponseCachePlugin setServerOnRuntime returns true or error if rejected',
	test		: ( done )=>{
		let MockServer					= Mock( helpers.getServer().constructor );
		let MockCachingServerPlugin		= Mock( CachingServerPlugin );
		let MockCachingServer			= Mock( helpers.getCachingServer().constructor );
		let cachingServer				= new MockCachingServer();
		let cachingServerPlugin			= new MockCachingServerPlugin();
		let server						= new MockServer();
		let called						= false;
		let namespace					= 'rcp';

		cachingServer._mock({
			method			: 'getServerState',
			shouldReturn	: 2
		});

		cachingServer._mock({
			method			: 'existsNamespace',
			with			: [[namespace]],
			shouldReturn	: ()=>{
				return new Promise(( resolve, reject )=>{
					called	= true;
					reject( 'Error' )
				});
			},
			called			: 1
		});

		cachingServerPlugin._mock({
			method			: 'getServer',
			shouldReturn	: cachingServer
		});

		server._mock({
			method			: 'getPlugin',
			with			: [['er_cache_server']],
			shouldReturn	: cachingServerPlugin
		});

		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		responseCachePlugin.setOptions({
			callback	: ( err )=>{
				assert.equal( err, 'Error');
				assert.equal( called, true);
				err !== false ? done() : done( 'There was no error, but there should have been.' );
			}
		});
		responseCachePlugin.setServerOnRuntime( server );
	}
});

test({
	message		: 'ResponseCachePlugin setServerOnRuntime returns true or error if rejected on createNamespace',
	test		: ( done )=>{
		let MockServer					= Mock( helpers.getServer().constructor );
		let MockCachingServerPlugin		= Mock( CachingServerPlugin );
		let MockCachingServer			= Mock( helpers.getCachingServer().constructor );
		let cachingServer				= new MockCachingServer();
		let cachingServerPlugin			= new MockCachingServerPlugin();
		let server						= new MockServer();
		let called						= false;
		let namespace					= 'rcp';

		cachingServer._mock({
			method			: 'getServerState',
			shouldReturn	: 2
		});

		cachingServer._mock({
			method			: 'existsNamespace',
			with			: [[namespace]],
			shouldReturn	: ()=>{
				return new Promise(( resolve, reject )=>{
					called	= true;
					resolve( false )
				});
			},
			called			: 1
		});

		cachingServer._mock({
			method			: 'createNamespace',
			with			: [[namespace]],
			shouldReturn	: ()=>{
				return new Promise(( resolve, reject )=>{
					reject( 'Error' );
				});
			},
			called			: 1
		});

		cachingServerPlugin._mock({
			method			: 'getServer',
			shouldReturn	: cachingServer
		});

		server._mock({
			method			: 'getPlugin',
			with			: [['er_cache_server']],
			shouldReturn	: cachingServerPlugin
		});

		let responseCachePlugin	= new ResponseCachePlugin( 'id' );
		responseCachePlugin.setOptions({
			callback	: ( err )=>{
				assert.equal( err, 'Error');
				err !== false ? done() : done( 'There was no error, but there should have been.' );
			}
		});
		responseCachePlugin.setServerOnRuntime( server );

		setTimeout(()=>{
			called === true ? done() : done( 'CachingServer existsNamespace was not called but it should have' );
		}, 100 );
	}
});

test({
	message		: 'ResponseCachePlugin setServerOnRuntime throws if server is not started',
	test		: ( done )=>{
		let MockServer					= Mock( helpers.getServer().constructor );
		let MockCachingServerPlugin		= Mock( CachingServerPlugin );
		let cachingServerPlugin			= new MockCachingServerPlugin();
		let server						= new MockServer();

		cachingServerPlugin._mock({
			method			: 'getServer',
			shouldReturn	: null
		});

		server._mock({
			method			: 'getPlugin',
			with			: [['er_cache_server']],
			shouldReturn	: cachingServerPlugin
		});

		let responseCachePlugin	= new ResponseCachePlugin( 'id' );

		assert.throws(()=>{
			responseCachePlugin.setServerOnRuntime( server );
		});

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
		let called				= false;

		let pluginMiddlewares	= responseCachePlugin.getPluginMiddleware();

		eventRequest2._mock({
			method	: 'send',
			shouldReturn	: ()=>{
				called	= true;
			}
		});

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
			called === true ? done( 'Send was called but it shouldn\'t have been' ) : done();
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
