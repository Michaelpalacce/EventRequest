'use strict';

// Dependencies
const { assert, test, helpers, Mock }	= require( '../../../test_helper' );
const SessionPlugin						= require( './../../../../server/plugins/available_plugins/session_plugin' );
const CachingServerPlugin				= require( '../../../../server/plugins/available_plugins/memory_data_server_plugin' );
const { Session, SESSIONS_NAMESPACE }	= require( './../../../../server/components/session/session' );
const Router							= require( '../../../../server/components/routing/router' );

test({
	message	: 'SessionPlugin setUp to create namespace',
	test	: ( done )=>{
		let cachingServer	= helpers.getCachingServer();

		cachingServer.setUp().then(()=>{
			cachingServer.createNamespace( SESSIONS_NAMESPACE ).then( ( err )=>{
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'SessionPlugin getPluginDependencies returns er_cache_server',
	test	: ( done )=>{
		let plugin	= new SessionPlugin( 'id' );

		assert.deepStrictEqual( ['er_cache_server'], plugin.getPluginDependencies() );

		done();
	}
});

test({
	message	: 'SessionPlugin attaches functions to the eventRequest',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let sessionPlugin			= new SessionPlugin( 'id' );
		let router					= new Router();
		let called					= 0;

		let pluginMiddlewares		= sessionPlugin.getPluginMiddleware();

		assert.equal( 2, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( pluginMiddlewares[1] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'on',
			shouldReturn	: ()=>{
				called ++;
			},
			with			: [
				['cleanUp',undefined],
				['send',undefined],
			],
			called			: 2
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( true, eventRequest.session instanceof Session );
		assert.equal( true, typeof eventRequest.initSession !== 'undefined' );
		assert.equal( 2, called );

		done();
	}
});

test({
	message	: 'SessionPlugin saves session on send',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let sessionPlugin			= new SessionPlugin( 'id' );
		let MockSession				= Mock( Session );
		let session					= new MockSession( eventRequest );
		let router					= new Router();
		let called					= false;

		let pluginMiddlewares		= sessionPlugin.getPluginMiddleware();

		session._mock({
			method			: 'saveSession',
			shouldReturn	: ()=>{
				called	= true;
			},
			called			: 1
		});

		router.add( pluginMiddlewares[0] );
		router.add({
			handler	: ( event )=>{
				eventRequest.session	= session;
				event.send( 'Test' );
			}
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( true, called );

		done();
	}
});

test({
	message	: 'SessionPlugin initSession initializes a session if it doesn\'t exist',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let sessionPlugin			= new SessionPlugin( 'id' );
		let router					= new Router();

		let pluginMiddlewares		= sessionPlugin.getPluginMiddleware();

		router.add( pluginMiddlewares[0] );
		router.add( pluginMiddlewares[1] );
		router.add({
			handler	: ( event )=>{
				event.initSession( ( error )=>{
					error === false ? done() : done( 'Error while initializing the session' );
				});
			}
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();
	}
});

test({
	message	: 'SessionPlugin initSession fetches a session if it exists',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let sessionPlugin			= new SessionPlugin( 'id' );
		let router					= new Router();

		let pluginMiddlewares		= sessionPlugin.getPluginMiddleware();

		router.add( pluginMiddlewares[0] );
		router.add( pluginMiddlewares[1] );
		router.add({
			handler	: ( event )=>{
				event.session.sessionId	= 'testSessionId';
				event.session.add( 'test', 'value' );
				event.session.saveSession(( error )=>{
					if ( error !== false )
					{
						done( error );
						return;
					}

					event.initSession( ()=>{
						assert.equal( true, event.session.has( 'test' ) );
						assert.equal( 'value', event.session.get( 'test' ) );
						done();
					});
				});
			}
		});

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();
	}
});

test({
	message	: 'SessionPlugin initSession fetches a session if it exists',
	test	: ( done )=>{
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

		let namespace			= 'er_session';
		let callback			= ()=>{
			cachingServer.existsNamespace( namespace ).then( ( exists )=>{
				exists === true ? done() : done( `The namespace ${namespace} does not exist` );
			} ).catch( done );
		};

		let sessionPlugin	= new SessionPlugin( 'id', { callback } );

		sessionPlugin.setServerOnRuntime( server );
	}
});
