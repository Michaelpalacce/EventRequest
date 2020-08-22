'use strict';

// Dependencies
const { assert, test, helpers, Mock }	= require( '../../../test_helper' );
const SessionPlugin						= require( './../../../../server/plugins/available_plugins/session_plugin' );
const DataServerPlugin					= require( '../../../../server/plugins/available_plugins/data_server_plugin' );
const Session							= require( './../../../../server/components/session/session' );
const Router							= require( '../../../../server/components/routing/router' );

test({
	message	: 'SessionPlugin.getPluginDependencies.returns.er_data_server',
	test	: ( done ) => {
		let plugin	= new SessionPlugin( 'id' );

		assert.deepStrictEqual( ['er_data_server'], plugin.getPluginDependencies() );

		done();
	}
});

test({
	message	: 'SessionPlugin.attaches.functions.to.the.eventRequest',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let sessionPlugin		= new SessionPlugin( 'id' );
		let router				= new Router();
		let called				= 0;

		let pluginMiddlewares	= sessionPlugin.getPluginMiddleware();

		assert.equal( 2, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( pluginMiddlewares[1] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'on',
			shouldReturn	: () => {
				called ++;
			},
			with			: [
				['cleanUp', undefined],
			],
			called			: 1
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( true, eventRequest.session instanceof Session );
		assert.equal( true, typeof eventRequest.initSession !== 'undefined' );
		assert.equal( 1, called );

		done();
	}
});

test({
	message	: 'SessionPlugin.does.not.save.session.on.send.if.not.inited',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
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
			handler	: ( event ) => {
				eventRequest.session	= session;
				event.send( 'Test' );
			}
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( false, called );

		done();
	}
});

test({
	message	: 'SessionPlugin.saves.session.on.send',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
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
		router.add( pluginMiddlewares[1] );
		router.add({
			handler	: async ( event ) => {
				event.session	= session;
				assert.equal( await event.initSession(), called );

				done();
			}
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();
	}
});

test({
	message	: 'SessionPlugin.setServerOnRuntime.and.initSession.initializes.a.session.if.it.doesn\'t.exist',
	test	: ( done ) => {
		let MockServer				= Mock( helpers.getServer().constructor );
		let MockDataServerPlugin	= Mock( DataServerPlugin );
		let MockDataServer			= Mock( helpers.getDataServer().constructor );
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
				router.add( pluginMiddlewares[1] );
				router.add({
					handler	: async ( event ) => {
						await event.initSession() === false ? done() : done( 'Error while initializing the session' );
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
	message	: 'SessionPlugin.initSession.fetches.a.session.if.it.exists',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let sessionPlugin		= new SessionPlugin( 'id' );
		let router				= new Router();

		let pluginMiddlewares		= sessionPlugin.getPluginMiddleware();

		router.add( pluginMiddlewares[0] );
		router.add( pluginMiddlewares[1] );
		router.add({
			handler	: async ( event ) => {
				event.session.sessionId	= 'testSessionId';
				event.session.add( 'test', 'value' );
				if ( ! event.session.saveSession() )
				{
					done( 'Could not save session' );
					return;
				}
				else
				{
					await event.initSession();
					assert.equal( true, event.session.has( 'test' ) );
					assert.equal( 'value', event.session.get( 'test' ) );
					done();
					return;
				}
			}
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();
	}
});
