const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../index' );
const crypto					= require( 'crypto' );
const fs						= require( 'fs' );
const path						= require( 'path' );

// In linux hashes are calculated differently
const strongHash	= `"${crypto.createHash( 'sha1' ).update( fs.statSync( path.join( __dirname, './plugins/available_plugins/fixture/etag_test_file' ) ).mtimeMs.toString() ).digest( 'hex' )}"`;
const weakHash		= `W/"${crypto.createHash( 'md5' ).update( fs.statSync( path.join( __dirname, './plugins/available_plugins/fixture/etag_test_file' ) ).mtimeMs.toString() ).digest( 'hex' )}"`;

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

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, strongHash ).then(( response ) => {
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

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, weakHash ).then(( response ) => {
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

		app.apply( app.er_etag, { strong : false } );

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

test({
	message	: 'Server.test.er_etag.getConditionalResult',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			const { etag, pass }	= event.getConditionalResult( 'TEST' );

			assert.deepStrictEqual( pass, true );
			assert.deepStrictEqual( etag, '"984816fd329622876e14907634264e6f332e9fb3"' );

			event.send();
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.getConditionalResult.when.if-none-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			const { etag, pass }	= event.getConditionalResult( 'TEST' );

			assert.deepStrictEqual( pass, false );
			assert.deepStrictEqual( etag, '"984816fd329622876e14907634264e6f332e9fb3"' );

			event.send();
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', { 'if-none-match' : '"984816fd329622876e14907634264e6f332e9fb3"' }, port ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.getConditionalResult.when.if-none-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			const { etag, pass }	= event.getConditionalResult( 'TEST' );

			assert.deepStrictEqual( pass, false );
			assert.deepStrictEqual( etag, '"984816fd329622876e14907634264e6f332e9fb3"' );

			event.send();
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', { 'if-none-match' : '*' }, port ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.getConditionalResult.when.if-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			const { etag, pass }	= event.getConditionalResult( 'TEST' );

			assert.deepStrictEqual( pass, true );
			assert.deepStrictEqual( etag, '"984816fd329622876e14907634264e6f332e9fb3"' );

			event.send();
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', { 'if-match' : '*' }, port ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.getConditionalResult.when.if-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			const { etag, pass }	= event.getConditionalResult( 'TEST' );

			assert.deepStrictEqual( pass, true );
			assert.deepStrictEqual( etag, '"984816fd329622876e14907634264e6f332e9fb3"' );

			event.send();
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', { 'if-match' : '"984816fd329622876e14907634264e6f332e9fb3"' }, port ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, 'TEST' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.when.if-none-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 304, '', { 'if-none-match' : '"984816fd329622876e14907634264e6f332e9fb3"' }, port, '' ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.when.if-none-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 304, '', { 'if-none-match' : '*' }, port, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.when.if-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', { 'if-match' : '*' }, port ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.when.if-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 200, '', { 'if-match' : '"984816fd329622876e14907634264e6f332e9fb3"' }, port ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.when.if-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.get( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'GET', 304, '', { 'if-match' : '"wrong"' }, port, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.post',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.post( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'POST', 200, '', {}, port, 'TEST' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.post.when.if-none-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.post( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'POST', 412, '', { 'if-none-match' : '"984816fd329622876e14907634264e6f332e9fb3"' }, port, '' ).then(( response ) => {
			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.post.when.if-none-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.post( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'POST', 412, '', { 'if-none-match' : '*' }, port, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.post.when.if-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.post( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'POST', 200, '', { 'if-match' : '*' }, port ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.post.when.if-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.post( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'POST', 200, '', { 'if-match' : '"984816fd329622876e14907634264e6f332e9fb3"' }, port ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_etag.conditionalSend.post.when.if-match',
	test	: ( done ) => {
		const port	= 4165;
		const app	= new Server();

		app.apply( app.er_etag );

		app.post( '/', event => {
			event.conditionalSend( 'TEST' );
		});

		const server	= app.listen( port );

		helpers.sendServerRequest( '/', 'POST', 412, '', { 'if-match' : '"wrong"' }, port, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['etag'], '"984816fd329622876e14907634264e6f332e9fb3"' );

			server.close();
			done();
		}).catch( done );
	}
});
