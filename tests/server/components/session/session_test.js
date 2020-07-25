'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const Session					= require( './../../../../server/components/session/session' );
const EventRequest				= require( './../../../../server/event_request' );

test({
	message	: 'Session constructor on default throws',
	test	: ( done ) => {
		assert.throws(() => {
			new Session()
		});

		done();
	}
});

test({
	message	: 'Session constructor on correct arguments does not throw',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= null;
		assert.doesNotThrow(() => {
			session	= new Session( eventRequest )
		});

		assert.equal( true, session.event instanceof EventRequest );
		assert.equal( true, typeof session.server !== 'undefined' );
		assert.equal( true, typeof session.options === 'object' );
		assert.equal( 7776000, session.ttl );
		assert.equal( 'sid', session.sessionKey );
		assert.equal( true, session.isCookieSession );
		assert.equal( 32, session.sessionIdLength );
		assert.equal( null, session.sessionId );
		assert.equal( true, typeof session.session === 'object' );

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
	message	: 'Session constructor on custom arguments',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= null;

		let ttl					= 10;
		let sessionKey			= 'differentSid';
		let sessionIdLength		= 1000;

		let options	= {
			ttl, sessionKey, sessionIdLength, isCookieSession: false
		};

		assert.doesNotThrow(() => {
			session	= new Session( eventRequest, options )
		});

		assert.equal( true, session.event instanceof EventRequest );
		assert.equal( true, typeof session.server !== 'undefined' );
		assert.equal( true, typeof session.options === 'object' );
		assert.equal( true, session.isCookieSession === false );
		assert.equal( ttl, session.ttl );
		assert.equal( sessionKey, session.sessionKey );
		assert.equal( sessionIdLength, session.sessionIdLength );
		assert.equal( true, typeof session.session === 'object' );

		done();
	}
});

test({
	message	: 'Session constructor on custom arguments',
	test	: ( done ) => {
		let sessionId			= 'sessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= null;

		assert.doesNotThrow(() => {
			session	= new Session( eventRequest )
		});

		assert.equal( sessionId, session.getSessionId() );

		done();
	}
});

test({
	message	: 'Session constructor on custom arguments with headers',
	test	: ( done ) => {
		let sessionId			= 'sessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { testSid : sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= null;

		assert.doesNotThrow(() => {
			session	= new Session( eventRequest, { isCookieSession: false, sessionKey: 'testSid' } )
		});

		assert.equal( sessionId, session.getSessionId() );

		done();
	}
});

test({
	message	: 'Session _makeNewSessionId returns an id depending on the sessionKeyLength',
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
	message	: 'Session hasSession when there is no session',
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
	message	: 'Session hasSession, newSession and removeSession when there is a session',
	test	: async ( done ) => {
		let sessionId			= 'sessionId';
		let eventRequest		= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );
		let setCookie			= false;

		eventRequest._mock({
			method			: 'setCookie',
			shouldReturn	: () => {
				setCookie	= true;
			},
			called			: 2
		});

		let hasSession	= await session.hasSession();

		if ( ! hasSession )
		{
			const sessionId	= await session.newSession();

			if ( sessionId === false )
			{
				done( 'Could not create a new session' );
			}
			else
			{
				if ( setCookie === true )
				{
					hasSession	= await session.hasSession();
					if ( hasSession === true )
					{
						assert.deepStrictEqual( typeof session.session.id, 'string' );

						await session.removeSession();

						assert.equal( await session.hasSession(), false );

						assert.deepStrictEqual( session.session, {} );
						assert.deepStrictEqual( typeof session.session.id, 'undefined' );

						done();
					}
					else
					{
						done( 'There is no session where there should have been' );
					}
				}
				else
				{
					done( 'Set cookie should have been called when creating a new session but was not' );
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

		if ( ! hasSession )
		{
			const sessionId	= await session.newSession();

			if ( sessionId === false )
			{
				done( 'Could not create a new session' );
			}
			else
			{
				if ( setCookie === true )
				{
					done( 'Set cookie should NOT have been called when creating a new session but was' );
				}
				else
				{
					hasSession	= await session.hasSession();
					if ( hasSession === true )
					{
						assert.deepStrictEqual( typeof session.session.id, 'string' );

						await session.removeSession();

						assert.equal( await session.hasSession(), false );

						assert.deepStrictEqual( session.session, {} );
						assert.deepStrictEqual( typeof session.session.id, 'undefined' );

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
	message	: 'Session add, has adds a variable in the session',
	test	: ( done ) => {
		let eventRequest		= helpers.getEventRequest();
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );

		assert.deepStrictEqual( {}, session.session );
		session.add( 'key', 'value' );

		assert.deepStrictEqual( { key : 'value' }, session.session );
		assert.equal( true, session.has( 'key') );
		assert.equal( 'value', session.get( 'key' ) );
		session.delete( 'key' );
		assert.throws(() => {
			session.get( 'key' );
		});

		done();
	}
});

test({
	message	: 'Session fetchSession if session does not exist',
	test	: async ( done ) => {
		let sessionId			= 'sessionId2';
		let eventRequest		= helpers.getEventRequest(  undefined, undefined, { cookie : 'sid=' + sessionId }  );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );

		await session.fetchSession() === false ? done() : done( 'There should be no session to fetch' );
	}
});

test({
	message	: 'Session fetchSession if session exists',
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
	message	: 'Session getSessionId returns sessionId',
	test	: ( done ) => {
		let sessionId			= 'sessionId2';
		let eventRequest		= helpers.getEventRequest(  undefined, undefined, { cookie : 'sid=' + sessionId }  );
		eventRequest.dataServer	= helpers.getDataServer();
		let session				= new Session( eventRequest );

		assert.equal( sessionId, session.getSessionId() );

		done();
	}
});
