const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../index' );
const fs						= require( 'fs' );
const path						= require( 'path' );

const PROJECT_ROOT				= path.parse( require.main.filename ).dir;

test({
	message	: 'Server.test.er_static_does.not.serve.files.outside.static.folder',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static_resources, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/../index.js', 'GET', 404, '', {}, 4117 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found: /public/../index.js"}}'
			);

			done();
		}).catch( done );

		app.listen( 4117 );
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static_resources, { paths: ['public'] } );

		helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4116 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
			);

			done();
		}).catch( done );

		app.listen( 4116 );
	}
});

test({
	message	: 'Server.test.er_static_does.serves.files.inside.static.folder.with.cache',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_static_resources, { paths: ['public'], cache: { cacheControl: 'private', other: 'no-transform' } } );

		helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4116 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				fs.readFileSync( path.join( PROJECT_ROOT, './public/test/index.html' ) ).toString()
			);

			assert.deepStrictEqual( response.headers['cache-control'], 'private, no-transform' );

			done();
		}).catch( done );

		app.listen( 4116 );
	}
});