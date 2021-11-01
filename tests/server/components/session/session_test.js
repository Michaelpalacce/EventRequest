'use strict';

// Dependencies
const { assert, test, helpers, Mock }	= require( '../../../test_helper' );
const Session					= require( './../../../../server/components/session/session' );
const EventRequest				= require( './../../../../server/event_request' );
const DataServer				= require( './../../../../server/components/caching/data_server' );

test({
	message	: 'Session.constructor.on.default.throws',
	test	: ( done ) => {
		assert.throws(() => {
			new Session()
		});

		done();
	}
});

test({
	message	: 'Session.constructor.on.correct.arguments.does.not.throw',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );

		assert.deepStrictEqual( true, session.event instanceof EventRequest );
		assert.deepStrictEqual( true, typeof session.server !== 'undefined' );
		assert.deepStrictEqual( true, typeof session.options === 'object' );
		assert.deepStrictEqual( 7776000, session.ttl );
		assert.deepStrictEqual( 'sid', session.sessionKey );
		assert.deepStrictEqual( true, session.isCookieSession );
		assert.deepStrictEqual( 32, session.sessionIdLength );
		assert.deepStrictEqual( undefined, session.sessionId );
		assert.deepStrictEqual( undefined, session.session );
		assert.deepStrictEqual( false, session.isSecureCookie );

		done();
	}
});

test({
	message	: 'Session.constructor.throws.if.event.request.does.not.have.dataServer',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();

		assert.throws(() => {
			new Session( eventRequest )
		});

		done();
	}
});

test({
	message	: 'Session.constructor.on.custom.arguments',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let ttl					= 10;
		let sessionKey			= 'differentSid';
		let sessionIdLength		= 1000;
		let options	= {
			ttl, sessionKey, sessionIdLength, isCookieSession: false, isSecureCookie: true
		};
		let session				= new Session( eventRequest, options );

		assert.deepStrictEqual( true, session.event instanceof EventRequest );
		assert.deepStrictEqual( 'object', typeof session.server );
		assert.deepStrictEqual( true, typeof session.options === 'object' );
		assert.deepStrictEqual( false, session.isCookieSession );
		assert.deepStrictEqual( ttl, session.ttl );
		assert.deepStrictEqual( sessionKey, session.sessionKey );
		assert.deepStrictEqual( true, session.isSecureCookie );
		assert.deepStrictEqual( sessionIdLength, session.sessionIdLength );

		done();
	}
});

test({
	message	: 'Session.constructor.on.custom.arguments.with.cookie',
	test	: async ( done ) => {
		let sessionId			= 'sessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		await eventRequest.dataServer.set( `${Session.SESSION_PREFIX}${sessionId}`, {} );
		let session				= null;

		assert.doesNotThrow(() => {
			session	= new Session( eventRequest )
		});

		await session.init();

		assert.deepStrictEqual( sessionId, session.getSessionId() );

		done();
	}
});

test({
	message	: 'Session.constructor.on.custom.arguments.with.headers',
	test	: async ( done ) => {
		let sessionId			= 'sessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { testSid : sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		await eventRequest.dataServer.set( `${Session.SESSION_PREFIX}${sessionId}`, {} );
		let session				= null;

		assert.doesNotThrow(() => {
			session	= new Session( eventRequest, { isCookieSession: false, sessionKey: 'testSid' } )
		});

		await session.init();

		assert.deepStrictEqual( sessionId, session.getSessionId() );

		done();
	}
});

test({
	message	: 'Session._makeNewSessionId.returns.an.id.depending.on.the.sessionKeyLength',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= null;
		let sessionIdLength		= 10;

		assert.doesNotThrow(() => {
			session	= new Session( eventRequest, { sessionIdLength } );
		});

		assert.equal( sessionIdLength, session._makeNewSessionId().length );

		done();
	}
});

test({
	message	: 'Session.hasSession.when.there.is.no.session',
	test	: ( done ) => {
		let sessionId			= 'sessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= null;

		assert.doesNotThrow( async () => {
			session	= new Session( eventRequest );
			await session.hasSession() ? done( 'There is a sesion but there shouldn\'t be one' ) : done();
		});
	}
});

test({
	message	: 'Session.hasSession.newSession.and.removeSession.when.there.is.a.session',
	test	: async ( done ) => {
		let sessionId			= 'sessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );
		let setCookie			= false;

		eventRequest._mock({
			method			: 'setCookie',
			shouldReturn	: ( sessionKey, sessionId, options ) => {
				assert.deepStrictEqual( true, typeof options.SameSite === 'string' )
				assert.deepStrictEqual( true, options.SameSite.includes( 'Lax' ) )
				setCookie	= true;
			},
			called			: 2
		});

		let hasSession	= await session.hasSession();

		if ( ! hasSession )
		{
			await session.newSession();
			const sessionId	= session.getSessionId();

			if ( sessionId === false )
				done( 'Could not create a new session' );
			else {
				if ( setCookie === true ) {
					hasSession	= await session.hasSession();
					if ( hasSession === true ) {
						assert.deepStrictEqual( session.sessionId, sessionId );

						await session.removeSession();

						assert.deepStrictEqual( await session.hasSession(), false );

						assert.deepStrictEqual( session.session, {} );
						assert.deepStrictEqual( session.sessionId, null );

						done();
					}
					else
						done( 'There is no session where there should have been' );
				}
				else
					done( 'Set cookie should have been called when creating a new session but was not' );
			}
		}
		else
			done( 'There is a session but there shouldn\'t be one' );
	}
});

test({
	message	: 'Session.hasSession.newSession.and.removeSession.when.there.is.a.session.with.secure.cookie',
	test	: async ( done ) => {
		let sessionId			= 'sessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest, { isSecureCookie: true } );
		let setCookie			= false;

		eventRequest._mock({
			method			: 'setCookie',
			shouldReturn	: ( sessionKey, sessionId, options ) => {
				assert.deepStrictEqual( true, typeof options.SameSite === 'string' )
				assert.deepStrictEqual( true, options.SameSite.includes( 'None; Secure' ) )
				setCookie	= true;
			},
			called			: 2
		});

		let hasSession	= await session.hasSession();

		if ( ! hasSession ) {
			await session.newSession();
			const sessionId	= session.getSessionId();

			if ( sessionId === false )
				done( 'Could not create a new session' );
			else {
				if ( setCookie === true ) {
					hasSession	= await session.hasSession();
					if ( hasSession === true ) {
						assert.deepStrictEqual( session.sessionId, sessionId );

						await session.removeSession();

						assert.deepStrictEqual( await session.hasSession(), false );

						assert.deepStrictEqual( session.session, {} );
						assert.deepStrictEqual( session.sessionId, null );

						done();
					}
					else
						done( 'There is no session where there should have been' );
				}
				else
					done( 'Set cookie should have been called when creating a new session but was not' );
			}
		}
		else
			done( 'There is a session but there shouldn\'t be one' );
	}
});

test({
	message	: 'Session.hasSession.newSession.and.removeSession.when.there.is.a.header.session',
	test	: async ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest, { isCookieSession: false } );
		let setCookie			= false;

		eventRequest._mock({
			method			: 'setCookie',
			shouldReturn	: () => {
				setCookie	= true;
			},
			called			: 0
		});

		let hasSession	= await session.hasSession();

		if ( ! hasSession ) {
			await session.newSession();
			const sessionId	= session.getSessionId();

			if ( sessionId === false )
				done( 'Could not create a new session' );
			else {
				if ( setCookie === true )
					done( 'Set cookie should NOT have been called when creating a new session but was' );
				else {
					hasSession	= await session.hasSession();
					if ( hasSession === true )
					{
						assert.deepStrictEqual( session.sessionId, sessionId );

						await session.removeSession();

						assert.deepStrictEqual( await session.hasSession(), false );

						assert.deepStrictEqual( session.session, {} );
						assert.deepStrictEqual( session.sessionId, null );

						done();
					}
					else
					{
						done( 'There is no session where there should have been' );
					}
				}
			}
		}
		else
		{
			done( 'There is a session but there shouldn\'t be one' );
		}
	}
});

test({
	message	: 'Session.removeSession.when.not.a.cookie.session',
	test	: async ( done ) => {
		const eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();

		const session			= new Session( eventRequest, { isCookieSession: false } );
		let setCookie			= false;

		eventRequest._mock({
			method			: 'setCookie',
			shouldReturn	: () => {
				setCookie	= true;
			},
			called			: 0
		});

		await session.removeSession();

		setCookie === false ? done() : done( 'setCookie was called when removing session but should not have been!' );
	}
});

test({
	message	: 'Session.add.has.adds.a.variable.in.the.session',
	test	: async ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );
		await session.init();

		assert.deepStrictEqual( {}, session.session );
		session.add( 'key', 'value' );

		assert.deepStrictEqual( { key : 'value' }, session.session );
		assert.deepStrictEqual( true, session.has( 'key') );
		assert.deepStrictEqual( 'value', session.get( 'key' ) );
		session.delete( 'key' );
		assert.deepStrictEqual( session.get( 'key' ), null );

		done();
	}
});

test({
	message	: 'Session.fetchSession.if.session.does.not.exist',
	test	: async ( done ) => {
		let sessionId			= 'sessionId2';
		let eventRequest		= helpers.getEventRequest(  undefined, undefined, { cookie : 'sid=' + sessionId }  );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );

		await session.fetchSession() === null ? done() : done( 'There should be no session to fetch' );
	}
});

test({
	message	: 'Session.fetchSession.if.session.exists',
	test	: async ( done ) => {
		let sessionId			= 'sessionId2';
		let eventRequest		= helpers.getEventRequest(  undefined, undefined, { cookie : 'sid=' + sessionId }  );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );

		await session.saveSession();
		await session.fetchSession() !== false ? done() : done( 'There should be a session to fetch' );
	}
});

test({
	message	: 'Session.saveSession',
	test	: async ( done ) => {
		const eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();

		const session			= new Session( eventRequest );

		await session.saveSession().catch( done ) === false
			? done()
			: done( 'Save session did not return false but should have since there is no session id' );
	}
});

test({
	message	: 'Session.getSessionId.returns.sessionId',
	test	: async ( done ) => {
		const sessionId			= 'sessionId2';
		const eventRequest		= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		await eventRequest.dataServer.set( `${Session.SESSION_PREFIX}${sessionId}`, {} );
		const session			= new Session( eventRequest );
		await session.init();

		assert.deepStrictEqual( sessionId, session.getSessionId() );

		done();
	}
});

test({
	message	: 'Session.newSession.cannotSaveSession',
	test	: async ( done ) => {
		const eventRequest		= helpers.getEventRequest();
		const MockedDataServer	= Mock( DataServer );
		eventRequest.dataServer	= new MockedDataServer( { persist: false } );
		eventRequest.dataServer._mock({
			method: "set",
			shouldReturn: () => null
		});
		const session			= new Session( eventRequest );
		let thrown				= false;

		await session.newSession().catch(() => { thrown = true; });

		done( ! thrown );
	}
});

test({
	message	: 'Session.getAll',
	test	: async ( done ) => {
		const eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		const session			= new Session( eventRequest );
		await session.init();
		session.add( 'test', 1 );
		session.add( 'test2', 2 );

		assert.deepStrictEqual( { test: 1, test2: 2 }, session.getAll() );

		done();
	}
});

test({
	message	: 'Session.set.is.an.alias.of.add',
	test	: async ( done ) => {
		const eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		const session			= new Session( eventRequest );
		await session.init();
		session.set( 'test', 1 );
		session.set( 'test2', 2 );

		assert.deepStrictEqual( { test: 1, test2: 2 }, session.getAll() );

		done();
	}
});
