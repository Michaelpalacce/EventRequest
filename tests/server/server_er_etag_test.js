const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../index' );
const fs						= require( 'fs' );
const path						= require( 'path' );

test({
	message	: 'Server.test.er_etag.adds.a.middleware',
	test	: ( done ) => {
		const port	= 4160;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			assert.deepStrictEqual( typeof event.etag, 'function' );
			assert.deepStrictEqual( typeof event.getConditionalResult, 'function' );
			assert.deepStrictEqual( typeof event.conditionalSend, 'function' );
			assert.deepStrictEqual( typeof event.setEtagHeader, 'function' );

			event.send();
		});

		app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, '' ).then(() => {
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.setEtagHeader.works.as.expected',
	test	: ( done ) => {
		const port	= 4161;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.setEtagHeader( 'test' );

			event.send();
		});

		app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], 'test' );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.etag',
	test	: ( done ) => {
		const port	= 4162;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.send( event.etag( 'TEST' ) );
		});

		app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, '"984816fd329622876e14907634264e6f332e9fb3"' ).then(( response ) => {
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.etag.weak',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.send( event.etag( 'TEST', false ) );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, 'W/"033bd94b1168d7e4f0d644c3c95e35bf"' ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.etag.with.buffer',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.send( event.etag( Buffer.from( 'TEST' ) ) );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, '"984816fd329622876e14907634264e6f332e9fb3"' ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.etag.with.buffer.weak',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.send( event.etag( Buffer.from( 'TEST' ), false ) );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, 'W/"033bd94b1168d7e4f0d644c3c95e35bf"' ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.etag.with.fs.Stats',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.send( event.etag( fs.statSync( path.join( __dirname, './plugins/available_plugins/fixture/etag_test_file' ) ) ) );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, '"d4a112c3ffcf1b27f883ef0949de75c6fac76454"' ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.etag.with.fs.Stats.weak',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.send( event.etag( fs.statSync( path.join( __dirname, './plugins/available_plugins/fixture/etag_test_file' ) ), false ) );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, 'W/"873b9a9f491c321c0c6de48c7d82d751"' ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.with.options',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag, { strong : false} );

		app.get( '/', event => {
			event.send( event.etag( 'TEST' ) );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, 'W/"033bd94b1168d7e4f0d644c3c95e35bf"' ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});
