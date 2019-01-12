'use strict';

// Dependencies
const { assert, test, helpers, Mock, Mocker }	= require( '../../../test_helper' );
const ResponseCachePlugin						= require( '../../../../server/plugins/available_plugins/response_cache_plugin' );
const CachingServerPlugin						= require( '../../../../server/plugins/available_plugins/memory_data_server_plugin' );
const Router									= require( '../../../../server/components/routing/router' );

test({
	message		: 'ResponseCachePlugin adds a cacheCurrentRequest method',
	test		: ( done )=>{
		let eventRequest		= helpers.getEventRequest( 'GET', '/tests/fixture/test.css' );
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

		responseCachePlugin.setUpNamespace( cachingServer );

		setTimeout(()=>{
			cachingServer.existsNamespace( namespace ).then( ( exists )=>{
				exists === true ? done() : done( `The namespace ${namespace} does not exist` );
			} ).catch( done )
		}, 250 );
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

		responseCachePlugin.setServerOnRuntime( server );

		setTimeout(()=>{
			called === true ? done() : done( 'CachingServer existsNamespace was not called but it should have' );
		}, 100 );
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
