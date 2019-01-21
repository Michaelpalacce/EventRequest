'use strict';

// Dependencies
const { assert, test, helpers }			= require( '../../../test_helper' );
const { Session, SESSIONS_NAMESPACE }	= require( './../../../../server/components/session/session' );
const EventRequest						= require( './../../../../server/event' );
const { DataServer }					= require( './../../../../server/components/caching/data_server' );

test({
	message	: 'Session setUp to create namespace',
	test	: ( done )=>{
		let cachingServer	= helpers.getCachingServer();

		cachingServer.setUp().then(()=>{
			cachingServer.createNamespace( SESSIONS_NAMESPACE ).then( ()=>{
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Session constructor on default throws',
	test	: ( done )=>{
		assert.throws(()=>{
			new Session()
		});

		done();
	}
});

test({
	message	: 'Session constructor on correct arguments does not throw',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;
		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest )
		});

		assert.equal( true, session.event instanceof EventRequest );
		assert.equal( true, typeof session.model !== 'undefined' );
		assert.equal( true, typeof session.options === 'object' );
		assert.equal( 0, session.ttl );
		assert.equal( 'sid', session.sessionKey );
		assert.equal( 32, session.sessionIdLength );
		assert.equal( null, session.sessionId );
		assert.equal( true, typeof session.session === 'object' );

		done();
	}
});

test({
	message	: 'Session constructor on custom arguments',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;

		let ttl						= 10;
		let sessionKey				= 'differentSid';
		let sessionIdLength			= 1000;

		let options	= {
			ttl, sessionKey, sessionIdLength
		};

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest, options )
		});

		assert.equal( true, session.event instanceof EventRequest );
		assert.equal( true, typeof session.model !== 'undefined' );
		assert.equal( true, typeof session.options === 'object' );
		assert.equal( ttl, session.ttl );
		assert.equal( sessionKey, session.sessionKey );
		assert.equal( sessionIdLength, session.sessionIdLength );
		assert.equal( true, typeof session.session === 'object' );

		done();
	}
});

test({
	message	: 'Session constructor on custom arguments',
	test	: ( done )=>{
		let sessionId				= 'sessionId';
		let eventRequest			= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest )
		});

		assert.equal( sessionId, session.getSessionId() );

		done();
	}
});

test({
	message	: 'Session makeNewSessionId returns an id depending on the sessionKeyLength',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;
		let sessionIdLength			= 10;

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest, { sessionIdLength } );
		});

		assert.equal( sessionIdLength, session.makeNewSessionId().length );

		done();
	}
});

test({
	message	: 'Session hasSession when there is no session',
	test	: ( done )=>{
		let sessionId				= 'sessionId';
		let eventRequest			= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest );
		});

		session.hasSession(( hasSession )=>{
			hasSession ? done( 'There is a sesion but there shouldn\'t be one' ) : done();
		});
	}
});

test({
	message	: 'Session hasSession, newSession and removeSession when there is a session',
	test	: ( done )=>{
		let sessionId				= 'sessionId';
		let eventRequest			= helpers.getEventRequest( undefined, undefined, { cookie : 'sid=' + sessionId } );
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;
		let setCookie				= false;

		eventRequest._mock({
			method			: 'setCookie',
			shouldReturn	: ()=>{
				setCookie	= true;
			},
			called			: 1
		});

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest );
		});

		eventRequest.cachingServer.setUp().then(()=>{
			session.model.createNamespaceIfNotExists().then(()=>{
				console.log('TES');
				session.hasSession(( hasSession )=>{
					if ( ! hasSession )
					{
						session.newSession(( err )=>{
							if ( err )
							{
								done( err );
							}
							else
							{
								if ( setCookie === true )
								{
									session.hasSession(( hasSession )=>{
										if ( hasSession )
										{
											session.removeSession( done );
										}
										else
										{
											done( 'There is no session where there should have been' );
										}
									})
								}
								else
								{
									done( 'Set cookie should have been called when creating a new session but was not' );
								}
							}
						});
					}
					else
					{
						done( 'There is a session but there shouldn\'t be one' );
					}
				});
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'Session add, has adds a variable in the session',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest );
		});

		assert.deepStrictEqual( {}, session.session );
		session.add( 'key', 'value' );
		assert.deepStrictEqual( { key : 'value' }, session.session );
		assert.equal( true, session.has( 'key') );
		assert.equal( 'value', session.get( 'key' ) );
		session.delete( 'key' );
		assert.throws(()=>{
			session.get( 'key' );
		});

		done();
	}
});

test({
	message	: 'Session fetchSession if session does not exist',
	test	: ( done )=>{
		let sessionId				= 'sessionId2';
		let eventRequest			= helpers.getEventRequest(  undefined, undefined, { cookie : 'sid=' + sessionId }  );
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest );
		});
		
		session.fetchSession(( error )=>{
			error !== false ? done() : done( 'There should be no session to fetch' );
		});
	}
});

test({
	message	: 'Session fetchSession if session exists',
	test	: ( done )=>{
		let sessionId				= 'sessionId2';
		let eventRequest			= helpers.getEventRequest(  undefined, undefined, { cookie : 'sid=' + sessionId }  );
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest );
		});

		session.saveSession(()=>{
			session.fetchSession(( err )=>{
				err === false ? done() : done( 'There should be a session to fetch' );
			});
		}, sessionId );
	}
});

test({
	message	: 'Session getSessionId returns sessionId',
	test	: ( done )=>{
		let sessionId				= 'sessionId2';
		let eventRequest			= helpers.getEventRequest(  undefined, undefined, { cookie : 'sid=' + sessionId }  );
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;

		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest );
		});

		assert.equal( sessionId, session.getSessionId() );

		done();
	}
});
