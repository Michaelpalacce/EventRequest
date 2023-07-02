const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../server/index' );

test({
	message	: 'Server.test.er_content_type.adds.a.middleware',
	test	: ( done ) => {
		const port	= 5102;
		const app	= new Server();

		app.apply( app.er_content_type );

		app.get( '/', event => {
			assert.deepStrictEqual( typeof event.contentType, 'function' );
			assert.deepStrictEqual( typeof event.contentTypeFromFileName, 'function' );

			event.send();
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest( '/', 'GET', 200, '', {}, port, '' )
		);

		const server	= app.listen( port, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_content_type.sendCallback.adds.header.if.not.set',
	test	: ( done ) => {
		const port	= 5103;
		const app	= new Server();

		app.apply( app.er_content_type );

		app.get( '/', event => {
			event.send();
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest( '/', 'GET', 200, '', {}, port ).then(res => {
				assert.deepStrictEqual( typeof res.headers["content-type"], 'string' );
				assert.deepStrictEqual( res.headers["content-type"], 'application/json' );
			})
		);

		const server	= app.listen( port, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_content_type.sendCallback.adds.header.if.not.set.with.different.default',
	test	: ( done ) => {
		const port	= 5101;
		const app	= new Server();

		app.apply( app.er_content_type, {
			defaultContentType: "other"
		} );

		app.get( '/', event => {
			event.send();
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest( '/', 'GET', 200, '', {}, port ).then(res => {
				assert.deepStrictEqual( typeof res.headers["content-type"], 'string' );
				assert.deepStrictEqual( res.headers["content-type"], 'other' );
			})
		);

		const server	= app.listen( port, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_content_type.sendCallback.does.not.add.header.when.set',
	test	: ( done ) => {
		const port	= 5104;
		const app	= new Server();

		app.apply( app.er_content_type );

		app.get( '/', event => {
			event.contentType("Test")
			event.send();
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest( '/', 'GET', 200, '', {}, port ).then(res => {
				assert.deepStrictEqual( typeof res.headers["content-type"], 'string' );
				assert.deepStrictEqual( res.headers["content-type"], 'Test; charset=UTF-8' );
			})
		);

		const server	= app.listen( port, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_content_type.sendCallback.does.not.add.header.when.set.different.charset',
	test	: ( done ) => {
		const port	= 5105;
		const app	= new Server();

		app.apply( app.er_content_type );

		app.get( '/', event => {
			event.contentType("Test", "UTF-16")
			event.send();
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest( '/', 'GET', 200, '', {}, port ).then(res => {
				assert.deepStrictEqual( typeof res.headers["content-type"], 'string' );
				assert.deepStrictEqual( res.headers["content-type"], 'Test; charset=UTF-16' );
			})
		);

		const server	= app.listen( port, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

////////

test({
	message	: 'Server.test.er_content_type.sendCallback.does.not.add.header.when.set.with.contentTypeFromFileName',
	test	: ( done ) => {
		const port	= 5106;
		const app	= new Server();

		app.apply( app.er_content_type );

		app.get( '/', event => {
			event.contentTypeFromFileName("test.xml")
			event.send();
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest( '/', 'GET', 200, '', {}, port ).then(res => {
				assert.deepStrictEqual( typeof res.headers["content-type"], 'string' );
				assert.deepStrictEqual( res.headers["content-type"], 'application/xml; charset=UTF-8' );
			})
		);

		const server	= app.listen( port, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_content_type.sendCallback.does.not.add.header.when.set.different.charset.with.contentTypeFromFileName',
	test	: ( done ) => {
		const port	= 5107;
		const app	= new Server();

		app.apply( app.er_content_type );

		app.get( '/', event => {
			event.contentTypeFromFileName("test.xml", "UTF-16")
			event.send();
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest( '/', 'GET', 200, '', {}, port ).then(res => {
				assert.deepStrictEqual( typeof res.headers["content-type"], 'string' );
				assert.deepStrictEqual( res.headers["content-type"], 'application/xml; charset=UTF-16' );
			})
		);

		const server	= app.listen( port, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});
