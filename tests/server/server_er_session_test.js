const { assert, test, helpers }	= require( '../test_helper' );
const { App, Server }			= require( './../../index' );
const app						= App();
const Session					= require( './../../server/components/session/session' );
const DataServerMap				= require( './../../server/components/caching/data_server_map' );

test({
	message	: 'Server.test.er_session.works.as.expected',
	test	: ( done ) => {
		const name	= 'testErSession';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server );
		app.apply( app.er_session );

		app.get( `/${name}`, async ( event ) => {
			assert.deepStrictEqual( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false ) {
				assert.deepStrictEqual( session.get( 'authenticated' ), null );
				session.add( 'authenticated', true );
			}
			else {
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers['set-cookie'] !== 'undefined', true );

			const cookies	= {},
				rc		= response.headers['set-cookie'][0];

			rc && rc.split( ';' ).forEach( function( cookie ) {
				const parts						= cookie.split( '=' );
				cookies[parts.shift().trim()]	= decodeURI( parts.join( '=' ) );
			});

			assert.equal( typeof cookies.sid === 'string', true );

			const headers	= { cookie: `sid=${cookies.sid}`};

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.authenticated !== 'undefined', true );
			assert.equal( response.headers.authenticated, 1 );

			const headers	= { cookie: `sid=wrong`};

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.authenticated === 'undefined', true );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_session.works.as.expected.with.response.end',
	test	: ( done ) => {
		const name	= 'testErSessionWithEnd';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server );
		app.apply( app.er_session );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false )
			{
				assert.deepStrictEqual( session.get( 'authenticated' ), null );
				session.add( 'authenticated', true );
			}
			else
			{
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.response.end( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers['set-cookie'] !== 'undefined', true );

			const cookies	= {},
				rc		= response.headers['set-cookie'][0];

			rc && rc.split( ';' ).forEach( function( cookie ) {
				const parts						= cookie.split( '=' );
				cookies[parts.shift().trim()]	= decodeURI( parts.join( '=' ) );
			});

			assert.equal( typeof cookies.sid === 'string', true );

			const headers	= { cookie: `sid=${cookies.sid}`};

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.authenticated !== 'undefined', true );
			assert.equal( response.headers.authenticated, 1 );

			const headers	= { cookie: `sid=wrong`};

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.authenticated === 'undefined', true );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_session.works.as.expected.with.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErSession';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );
		app.apply( app.er_session );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false )
			{
				assert.deepStrictEqual( session.get( 'authenticated' ), null );
				session.add( 'authenticated', true );
			}
			else
			{
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.send( name );
		} );

		app.listen( 4370, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4370 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['set-cookie'] !== 'undefined', true );

				const cookies	= {},
					rc		= response.headers['set-cookie'][0];

				rc && rc.split( ';' ).forEach( function( cookie ) {
					const parts						= cookie.split( '=' );
					cookies[parts.shift().trim()]	= decodeURI( parts.join( '=' ) );
				});

				assert.equal( typeof cookies.sid === 'string', true );

				const headers	= { cookie: `sid=${cookies.sid}`};

				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers, 4370 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers.authenticated !== 'undefined', true );
				assert.equal( response.headers.authenticated, 1 );

				const headers	= { cookie: `sid=wrong`};

				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers, 4370 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers.authenticated === 'undefined', true );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_session.works.as.expected.with.big.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErSession';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );
		app.apply( app.er_session );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false )
			{
				assert.deepStrictEqual( session.get( 'authenticated' ), null );
				session.add( 'authenticated', true );
			}
			else
			{
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.send( name );
		} );

		app.listen( 4379, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4379 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['set-cookie'] !== 'undefined', true );

				const cookies	= {},
					rc		= response.headers['set-cookie'][0];

				rc && rc.split( ';' ).forEach( function( cookie ) {
					const parts						= cookie.split( '=' );
					cookies[parts.shift().trim()]	= decodeURI( parts.join( '=' ) );
				});

				assert.equal( typeof cookies.sid === 'string', true );

				const headers	= { cookie: `sid=${cookies.sid}`};

				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers, 4379 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers.authenticated !== 'undefined', true );
				assert.equal( response.headers.authenticated, 1 );

				const headers	= { cookie: `sid=wrong`};

				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers, 4379 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers.authenticated === 'undefined', true );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_session.works.as.expected.with.headers',
	test	: ( done ) => {
		const name	= 'testErSessionWithHeaders';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server );
		app.apply( app.er_session, { isCookieSession: false } );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false )
			{
				assert.deepStrictEqual( session.get( 'authenticated' ), null );
				session.add( 'authenticated', true );
			}
			else
			{
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.sid !== 'undefined', true );

			const sid		= response.headers.sid;
			const headers	= { sid };

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );

			assert.equal( typeof response.headers.authenticated !== 'undefined', true );
			assert.equal( response.headers.authenticated, 1 );

			const headers	= { sid: 'wrong' };

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.authenticated === 'undefined', true );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_session.works.as.expected.with.headers.with.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErSessionWithHeaders';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );
		app.apply( app.er_session, { isCookieSession: false } );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false )
			{
				assert.deepStrictEqual( session.get( 'authenticated' ), null );
				session.add( 'authenticated', true );
			}
			else
			{
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.send( name );
		});

		app.listen( 4371, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4371 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers.sid !== 'undefined', true );

				const sid		= response.headers.sid;
				const headers	= { sid };

				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers, 4371 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );

				assert.equal( typeof response.headers.authenticated !== 'undefined', true );
				assert.equal( response.headers.authenticated, 1 );

				const headers	= { sid: 'wrong' };

				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers, 4371 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers.authenticated === 'undefined', true );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_session.works.as.expected.with.headers.with.big.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErSessionWithHeaders';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false, useBigMap: true } ) } );
		app.apply( app.er_session, { isCookieSession: false } );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false )
			{
				assert.deepStrictEqual( session.get( 'authenticated' ), null );
				session.add( 'authenticated', true );
			}
			else
			{
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.send( name );
		});

		app.listen( 4378, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4378 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers.sid !== 'undefined', true );

				const sid		= response.headers.sid;
				const headers	= { sid };

				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers, 4378 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );

				assert.equal( typeof response.headers.authenticated !== 'undefined', true );
				assert.equal( response.headers.authenticated, 1 );

				const headers	= { sid: 'wrong' };

				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers, 4378 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers.authenticated === 'undefined', true );

				done();
			}).catch( done );
		});
	}
});
