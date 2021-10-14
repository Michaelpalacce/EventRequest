const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../index' );
const fs						= require( 'fs' );
const path						= require( 'path' );
const crypto					= require( 'crypto' );

const PROJECT_ROOT				= path.parse( require.main.filename ).dir;

const fileStats					= fs.statSync( path.join( PROJECT_ROOT, './public/test/index.html' ) );
// In linux hashes are calculated differently
const strongHash				= `"${crypto.createHash( 'sha1' ).update( `${fileStats.mtimeMs.toString()}-${fileStats.size.toString()}` ).digest( 'hex' )}"`;
const weakHash					= `W/"${crypto.createHash( 'md5' ).update( `${fileStats.mtimeMs.toString()}-${fileStats.size.toString()}` ).digest( 'hex' )}"`;

test({
	message	: 'Server.test.er_static_does.not.serve.files.from.static.folder.that.does.not.exist',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['WRONGWRONG'] } );

		app.listen( 4258, () => {
			helpers.sendServerRequest( '/index.js', 'GET', 404, '', {}, 4258 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.general","message":"Cannot GET /index.js"}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.not.serve.files.outside.static.folder',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		app.listen( 4228, () => {
			helpers.sendServerRequest( '/../index.js', 'GET', 404, '', {}, 4228 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /../index.js"}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static.with.directory',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		app.listen( 4317, () => {
			helpers.sendServerRequest( '/test', 'GET', 404, '', {}, 4317 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.general","message":"Cannot GET /test"}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static.with.directory.that.does.not.exist',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/wrong', 'GET', 404, '', {}, 4229 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.general","message":"Cannot GET /wrong"}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

			done();
		}).catch( done );

		app.listen( 4229 );
	}
});

test({
	message	: 'Server.test.er_static.with.file.that.does.not.exist',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/wrong.css', 'GET', 404, '', {}, 4230 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.general","message":"Cannot GET /wrong.css"}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

			done();
		}).catch( done );

		app.listen( 4230 );
	}
});

test({
	message	: 'Server.test.er_static.with.dot.file',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/.', 'GET', 404, '', {}, 4231 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.general","message":"Cannot GET /public/."}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

			done();
		}).catch( done );

		app.listen( 4231 );
	}
});

test({
	message	: 'Server.test.er_static.with.dot.file.2',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		app.listen( 4232, () => {
			helpers.sendServerRequest( '/public/..', 'GET', 404, '', {}, 4232 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.general","message":"Cannot GET /public/.."}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );
		app.listen( 4316, () => {
			helpers.sendServerRequest( '/test/index.html', 'GET', 200, '', {}, 4316 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.with.etag',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], cache: { static: false }, useEtag: true } );

		app.listen( 4270, () => {
			helpers.sendServerRequest( '/test/index.html', 'GET', 200, '', {}, 4270 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );
				assert.deepStrictEqual( response.headers['etag'], strongHash );

				return helpers.sendServerRequest( '/test/index.html', 'GET', 304, '', { 'if-none-match': response.headers['etag'] }, 4270, '' );
			}).then(( response ) => {
				assert.deepStrictEqual( response.headers['etag'], strongHash );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.with.etag.weak',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], cache: { static: false }, useEtag: true, strong: false } );

		app.listen( 4271, () => {
			helpers.sendServerRequest( '/test/index.html', 'GET', 200, '', {}, 4271 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );
				assert.deepStrictEqual( response.headers['etag'], weakHash );

				return helpers.sendServerRequest( '/test/index.html', 'GET', 304, '', { 'if-none-match': response.headers['etag'] }, 4271, '' );
			}).then(( response ) => {
				assert.deepStrictEqual( response.headers['etag'], weakHash );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.without.cache.control',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], cache: { static: false } } );

		app.listen( 4227, () => {
			helpers.sendServerRequest( '/test/index.html', 'GET', 200, '', {}, 4227 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.with.cache',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], cache: { cacheControl: 'private', other: 'no-transform' } } );

		app.listen( 4225, () => {
			helpers.sendServerRequest( '/test/index.html', 'GET', 200, '', {}, 4225 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], 'private, no-transform' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.not.serve.files.outside.static.folder',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2 } );

		app.listen( 4328, () => {
			helpers.sendServerRequest( '/public/../index.js', 'GET', 404, '', {}, 4328 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/../index.js"}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static.with.directory',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2 } );

		app.listen( 4117, () => {
			helpers.sendServerRequest( '/public/test', 'GET', 404, '', {}, 4117 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/test"}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static.with.directory.that.does.not.exist',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2 } );

		app.listen( 4129, () => {
			helpers.sendServerRequest( '/public/wrong', 'GET', 404, '', {}, 4129 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/wrong"}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static.with.file.that.does.not.exist',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2 } );

		app.listen( 4130, () => {
			helpers.sendServerRequest( '/public/wrong.css', 'GET', 404, '', {}, 4130 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/wrong.css"}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static.with.dot.file',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2 } );

		app.listen( 4131, () => {
			helpers.sendServerRequest( '/public/.', 'GET', 404, '', {}, 4131 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/."}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static.with.dot.file.2',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2 } );

		app.listen( 4132, () => {
			helpers.sendServerRequest( '/public/..', 'GET', 404, '', {}, 4132 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/.."}}'
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2 } );

		app.listen( 4116, () => {
			helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4116 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.with.etag',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2, cache: { static: false }, useEtag: true } );

		app.listen( 4170, () => {
			helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4170 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );
				assert.deepStrictEqual( response.headers['etag'], strongHash );

				return helpers.sendServerRequest( '/public/test/index.html', 'GET', 304, '', { 'if-none-match': response.headers['etag'] }, 4170, '' );
			}).then(( response ) => {
				assert.deepStrictEqual( response.headers['etag'], strongHash );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.with.etag.weak',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2, cache: { static: false }, useEtag: true, strong: false } );

		app.listen( 4171, () => {
			helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4171 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );
				assert.deepStrictEqual( response.headers['etag'], weakHash );

				return helpers.sendServerRequest( '/public/test/index.html', 'GET', 304, '', { 'if-none-match': response.headers['etag'] }, 4171, '' );
			}).then(( response ) => {
				assert.deepStrictEqual( response.headers['etag'], weakHash );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.without.cache.control',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2, cache: { static: false } } );

		app.listen( 4127, () => {
			helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4127 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.with.cache',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], type: 2, cache: { cacheControl: 'private', other: 'no-transform' } } );

		app.listen( 4125, () => {
			helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4125 ).then(( response ) => {
				assert.deepStrictEqual(
					response.body.toString(),
					fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
				);

				assert.deepStrictEqual( response.headers['cache-control'], 'private, no-transform' );

				done();
			}).catch( done );
		});
	}
});