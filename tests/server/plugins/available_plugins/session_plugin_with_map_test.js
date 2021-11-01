'use strict';

// Dependencies
const { assert, test, helpers, Mock }	= require( '../../../test_helper' );
const SessionPlugin						= require( './../../../../server/plugins/available_plugins/session_plugin' );
const DataServerPlugin					= require( '../../../../server/plugins/available_plugins/data_server_plugin' );
const DataServerMap						= require( '../../../../server/components/caching/data_server_map' );
const Session							= require( './../../../../server/components/session/session' );
const Router							= require( '../../../../server/components/routing/router' );

test({
	message	: 'SessionPlugin.with.map.saves.session.on.send',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= new DataServerMap( { persist: false } );
		let sessionPlugin		= new SessionPlugin( 'id' );
		let MockSession			= Mock( Session );
		let session				= new MockSession( eventRequest );
		let router				= new Router();
		let called				= false;

		let pluginMiddlewares	= sessionPlugin.getPluginMiddleware();

		session._mock({
			method			: 'saveSession',
			shouldReturn	: () => {
				called	= true;
			},
			called			: 1
		});

		router.add( pluginMiddlewares[0] );
		router.add({
			handler	: async ( event ) => {
				// Inject for tests
				event.session	= session;
				event._cleanUp();

				assert.deepStrictEqual( true, called );
				done();
			}
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();
	}
});

test({
	message	: 'SessionPlugin.with.map.and.initializes.a.session.if.it.doesn\'t.exist',
	test	: ( done ) => {
		let MockServer				= Mock( helpers.getServer().constructor );
		let MockDataServerPlugin	= Mock( DataServerPlugin );
		let MockDataServer			= Mock( new DataServerMap( { persist: false } ).constructor );
		let dataServer				= new MockDataServer();
		let dataServerPlugin		= new MockDataServerPlugin();
		let server					= new MockServer();

		dataServerPlugin._mock({
			method			: 'getServer',
			shouldReturn	: dataServer
		});

		server._mock({
			method			: 'getPlugin',
			with			: [['er_data_server']],
			shouldReturn	: dataServerPlugin
		});

		let sessionPlugin			= new SessionPlugin( 'id' );

		sessionPlugin.setOptions({
			callback	: ( err ) => {
				let router				= new Router();
				let eventRequest		= helpers.getEventRequest();
				eventRequest.dataServer	= dataServer;
				let pluginMiddlewares	= sessionPlugin.getPluginMiddleware();

				router.add( pluginMiddlewares[0] );
				router.add({
					handler	: async ( event ) => {
						await event.session.hasSession() === false ? done() : done( 'Error while initializing the session' );
					}
				});

				eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
				eventRequest.next();
			}
		});

		assert.doesNotThrow(() => {
			sessionPlugin.setServerOnRuntime( server );
		});
		done();
	}
});

test({
	message	: 'SessionPlugin.with.map.initializes.fetches.a.session.if.it.exists',
	test	: async ( done ) => {
		const sessionId			= 'testSessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.dataServer	= new DataServerMap( { persist: false } );
		await eventRequest.dataServer.set( `${Session.SESSION_PREFIX}${sessionId}`, { test: "value" } );
		let sessionPlugin		= new SessionPlugin( 'id' );
		let router				= new Router();

		let pluginMiddlewares		= sessionPlugin.getPluginMiddleware();

		router.add( pluginMiddlewares[0] );
		router.add({
			handler	: async ( event ) => {
				assert.deepStrictEqual( true, event.session.has( 'test' ) );
				assert.deepStrictEqual( 'value', event.session.get( 'test' ) );
				done();
			}
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();
	}
});
