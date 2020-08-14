const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../index' );
const fs						= require( 'fs' );
const path						= require( 'path' );

const PROJECT_ROOT				= path.parse( require.main.filename ).dir;

test({
	message	: 'Server.test.er_static_does.not.serve.files.outside.static.folder',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/../index.js', 'GET', 404, '', {}, 4128 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/../index.js"}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4128 );
	}
});

test({
	message	: 'Server.test.er_static.with.directory',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/test', 'GET', 404, '', {}, 4117 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/test"}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4117 );
	}
});

test({
	message	: 'Server.test.er_static.with.directory.that.does.not.exist',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/wrong', 'GET', 404, '', {}, 4129 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/wrong"}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4129 );
	}
});

test({
	message	: 'Server.test.er_static.with.file.that.does.not.exist',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/wrong.css', 'GET', 404, '', {}, 4130 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/wrong.css"}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4130 );
	}
});

test({
	message	: 'Server.test.er_static.with.dot.file',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/.', 'GET', 404, '', {}, 4131 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/."}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4131 );
	}
});

test({
	message	: 'Server.test.er_static.with.dot.file.2',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/..', 'GET', 404, '', {}, 4132 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/.."}}'
			);

			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4132 );
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4116 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
			);

			assert.deepStrictEqual( response.headers['cache-control'], 'public, max-age=604800, immutable' );

			done();
		}).catch( done );

		app.listen( 4116 );
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.without.cache.control',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], cache: { static: false } } );

		helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4127 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
			);

			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4127 );
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.with.cache',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static, { paths: ['public'], cache: { cacheControl: 'private', other: 'no-transform' } } );

		helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4125 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
			);

			assert.deepStrictEqual( response.headers['cache-control'], 'private, no-transform' );

			done();
		}).catch( done );

		app.listen( 4125 );
	}
});