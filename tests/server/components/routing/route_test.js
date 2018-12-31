'use strict';

// Dependencies
const { assert, test }	= require( '../../../test_helper' );
const Route				= require( '../../../../server/components/routing/route' );

/**
 * @brief	Gets a route with the given arguments
 *
 * @param	Function handler
 * @param	mixed route
 * @param	mixed method
 *
 * @return	Route
 */
function getRoute( handler = ()=>{}, route, method )
{
	return new Route({
		handler,
		route,
		method
	});
}

test({
	message	: 'Route.constructor does not die when with correct arguments',
	test	: ( done ) =>{
		getRoute();

		done();
	}
});

test({
	message	: 'Route.constructor throws with invalid arguments',
	test	: ( done ) =>{
		assert.throws( ()=>{
			new Route();
		});

		done();
	}
});

test({
	message	: 'Route.constructor adds a defaults if they are not specified',
	test	: ( done ) =>{
		let route	= new Route({});

		assert.equal( typeof route.getHandler() === 'function', true );
		assert.equal( route.getMethod() === '', true );
		assert.equal( route.getRoute() === '', true );

		done();
	}
});

test({
	message	: 'Route.matchMethod matches String when empty',
	test	: ( done ) =>{
		let route	= new Route({});

		assert.equal( route.matchMethod( 'GET' ), true );
		assert.equal( route.matchMethod( 'POST' ), true );
		assert.equal( route.matchMethod( 'DELETE' ), true );
		assert.equal( route.matchMethod( 'PUT' ), true );
		assert.equal( route.matchMethod( 'SOMETHING' ), true );

		done();
	}
});

test({
	message	: 'Route.matchMethod matches String when provided',
	test	: ( done ) =>{
		let route	= getRoute( undefined, undefined, 'GET' );

		assert.equal( route.matchMethod( 'GET' ), true );
		assert.equal( route.matchMethod( 'POST' ), false );
		assert.equal( route.matchMethod( 'DELETE' ), false );
		assert.equal( route.matchMethod( 'PUT' ), false );
		assert.equal( route.matchMethod( 'SOMETHING' ), false );

		done();
	}
});

test({
	message	: 'Route.matchMethod matches Array when empty',
	test	: ( done ) =>{
		let route	= getRoute( undefined, undefined, [] );

		assert.equal( route.matchMethod( 'GET' ), true );
		assert.equal( route.matchMethod( 'POST' ), true );
		assert.equal( route.matchMethod( 'DELETE' ), true );
		assert.equal( route.matchMethod( 'PUT' ), true );
		assert.equal( route.matchMethod( 'SOMETHING' ), true );

		done();
	}
});

test({
	message	: 'Route.matchMethod matches Array when provided',
	test	: ( done ) =>{
		let route	= getRoute( undefined, undefined, ['GET', 'POST'] );

		assert.equal( route.matchMethod( 'GET' ), true );
		assert.equal( route.matchMethod( 'POST' ), true );
		assert.equal( route.matchMethod( 'DELETE' ), false );
		assert.equal( route.matchMethod( 'PUT' ), false );
		assert.equal( route.matchMethod( 'SOMETHING' ), false );

		done();
	}
});

test({
	message	: 'Route.matchRoute matches String',
	test	: ( done ) => {
		let route	= getRoute( undefined, '/' );

		assert.deepEqual( route.matchPath( '' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/' ), { matched: true, params: {} } );
		assert.deepEqual( route.matchPath( '/path' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/path/test' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/path/valueToMatch' ), { matched: false, params: {} } );

		done();
	}
});

test({
	message	: 'Route.matchRoute matches Regex',
	test	: ( done ) => {
		let route	= getRoute( undefined, new RegExp( '/pa' ) );

		assert.deepEqual( route.matchPath( '' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/path' ), { matched: true, params: {} } );
		assert.deepEqual( route.matchPath( '/path/test' ), { matched: true, params: {} } );
		assert.deepEqual( route.matchPath( '/path/valueToMatch' ), { matched: true, params: {} } );

		done();
	}
});

test({
	message	: 'Route.matchRoute matches all, BESIDES empty request path, in case of empty route provided',
	test	: ( done ) => {
		let route	= getRoute( undefined, '' );

		assert.deepEqual( route.matchPath( '' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/' ), { matched: true, params: {} } );
		assert.deepEqual( route.matchPath( '/path' ), { matched: true, params: {} } );
		assert.deepEqual( route.matchPath( '/path/test' ), { matched: true, params: {} } );
		assert.deepEqual( route.matchPath( '/path/valueToMatch' ), { matched: true, params: {} } );

		done();
	}
});

test({
	message	: 'Route.matchRoute matches params',
	test	: ( done ) => {
		let route	= getRoute( undefined, '/path/:test:' );

		assert.deepEqual( route.matchPath( '' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/path' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/path/test' ), { matched: true, params: { test: 'test' } } );
		assert.deepEqual( route.matchPath( '/path/test/sth' ), { matched: false, params: {} } );
		assert.deepEqual( route.matchPath( '/path/valueToMatch' ), { matched: true, params: { test: 'valueToMatch' } } );

		done();
	}
});
