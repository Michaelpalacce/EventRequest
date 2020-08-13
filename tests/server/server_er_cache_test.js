const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../index' );

test({
	message	: 'Server.test.er_cache.adds.caching.header',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_cache, { cacheControl: 'private', other: 'no-transform' } );

		app.get( '/', event => event.send() );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, 4118, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['cache-control'], 'private, no-transform' );

			done();
		}).catch( done );

		app.listen( 4118 );
	}
});

test({
	message	: 'Server.test.er_cache.adds.caching.header.with.empty',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_cache, {} );

		app.get( '/', event => event.send() );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, 4119, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4119 );
	}
});

test({
	message	: 'Server.test.er_cache.adds.caching.header.with.nothing',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_cache );

		app.get( '/', event => event.send() );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, 4121, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4121 );
	}
});

test({
	message	: 'Server.test.er_cache.adds.caching.header.with.dynamic.middleware',
	test	: ( done ) => {
		const app	= new Server();

		app.get( '/', app.er_cache.cache( { cacheControl: 'private', other: 'no-transform' } ),event => event.send() );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, 4122, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['cache-control'], 'private, no-transform' );

			done();
		}).catch( done );

		app.listen( 4122 );
	}
});

test({
	message	: 'Server.test.er_cache.adds.caching.header.with.empty.with.dynamic.middleware',
	test	: ( done ) => {
		const app	= new Server();

		app.get( '/', app.er_cache.cache( {} ), event => event.send() );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, 4123, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4123 );
	}
});

test({
	message	: 'Server.test.er_cache.adds.caching.header.with.nothing.with.dynamic.middleware',
	test	: ( done ) => {
		const app	= new Server();

		app.get( '/', app.er_cache.cache(), event => event.send() );

		helpers.sendServerRequest( '/', 'GET', 200, '', {}, 4124, '' ).then(( response ) => {
			assert.deepStrictEqual( response.headers['cache-control'], undefined );

			done();
		}).catch( done );

		app.listen( 4124 );
	}
});
