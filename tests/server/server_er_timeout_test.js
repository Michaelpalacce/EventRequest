const { assert, test, helpers }	= require( '../test_helper' );
const { App, Server }			= require( './../../index' );
const app						= App();

test({
	message	: 'Server.test.er_timeout.without.reaching.timeout',
	test	: ( done ) => {
		const body			= 'testTimeoutWithoutReachingTimeout';
		const timeout		= 100;
		let timeoutCalled	= 0;

		if ( ! app.hasPlugin( app.er_timeout ) )
			app.apply( app.er_timeout, { timeout } );

		app.add( ( event ) => {
				event.on( 'clearTimeout', () => {
					timeoutCalled++;
				});

				event.next();
			}
		);

		app.get( '/testTimeoutWithoutReachingTimeout', ( event ) => {
			event.send( body );
		} );

		helpers.sendServerRequest( '/testTimeoutWithoutReachingTimeout' ).then(( response ) => {
			assert.equal( response.body.toString(), body );
			assert.equal( timeoutCalled, 1 );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_timeout.with.reaching.timeout',
	test	: ( done ) => {
		const timeout	= 100;
		let timeoutCalled	= 0;

		if ( ! app.hasPlugin( app.er_timeout ) )
			app.apply( app.er_timeout, { timeout } );

		app.add({
			handler	: ( event ) => {
				event.on( 'clearTimeout', () => {
					timeoutCalled++;
				});

				event.next();
			}
		});

		app.get( '/testTimeoutWithReachingTimeout', ( event ) => {} );

		helpers.sendServerRequest( '/testTimeoutWithReachingTimeout', 'GET', 408 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error : { code: 'app.er.timeout.timedOut' } } ) );
			assert.equal( timeoutCalled, 1 );

			app.add({
				handler	: ( event ) => {
					event.clearTimeout();
					event.next();
				}
			});

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_timeout.with.reaching.timeout.but.request.is.finished',
	test	: ( done ) => {
		const app			= new Server();
		const timeout		= 100;
		let timeoutCalled	= 0;

		if ( ! app.hasPlugin( app.er_timeout ) )
			app.apply( app.er_timeout, { timeout } );

		app.add({
			handler	: ( event ) => {
				event.on( 'clearTimeout', () => {
					timeoutCalled++;
				});

				event.finished	= true;

				// Expired but the timeout checked that the request was finished and did nothing;
				setTimeout(()=>{
					event.finished	= false;
					event.send( 'DONE' );
				}, 200 );
			}
		});

		app.get( '/testTimeoutWithReachingTimeout', ( event ) => {} );

		app.listen( 4400, () => {
			helpers.sendServerRequest( '/testTimeoutWithReachingTimeout', 'GET', 200, '', {}, 4400, 'DONE' ).then(( response ) => {
				assert.equal( timeoutCalled, 1 );
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_timeout.with.reaching.timeout.and.custom.callback',
	test	: ( done ) => {
		const timeout	= 100;
		let timeoutCalled	= 0;

		const app	= new Server();

		app.apply( app.er_timeout, { timeout, callback: ( event ) => { event.send( 'It is all good', 200 ) } } );

		app.add(
			( event ) => {
				event.on( 'clearTimeout', () => {
					timeoutCalled++;
				});

				event.next();
			}
		);

		app.get( '/testTimeoutWithReachingTimeoutAndCustomCallback', ( event ) => {} );

		app.listen( 4120, () => {
			helpers.sendServerRequest( '/testTimeoutWithReachingTimeoutAndCustomCallback', 'GET', 200, '', {}, 4120, 'It is all good'  ).then(( response ) => {
				assert.equal( timeoutCalled, 1 );

				done();
			}).catch( done );
		});
	}
});