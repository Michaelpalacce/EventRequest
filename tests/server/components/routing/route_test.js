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
 * @param	Array middlewares
 *
 * @return	Route
 */
function getRoute( handler = ()=>{}, route = '', method = '', middlewares = [] )
{
	return new Route({
		handler,
		route,
		method,
		middlewares
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
		assert.deepEqual( route.getMiddlewares(), [] );

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
		const route	= getRoute( undefined, undefined, ['GET', 'POST'] );

		assert.equal( route.matchMethod( 'GET' ), true );
		assert.equal( route.matchMethod( 'POST' ), true );
		assert.equal( route.matchMethod( 'DELETE' ), false );
		assert.equal( route.matchMethod( 'PUT' ), false );
		assert.equal( route.matchMethod( 'SOMETHING' ), false );

		done();
	}
});

test({
	message			: 'Route.matchRoute matches String',
	dataProvider	: [
		['', false, {}],
		['/', true, {}],
		['/path', false, {}],
		['/path/test/', false, {}],
		['/path/valueToMatch', false, {}]
	],
	test			: ( done, path, matched, params ) => {
		let route			= getRoute( undefined, '/' );
		let matchedParams	= {};

		assert.deepEqual( route.matchPath( path, matchedParams ), matched );
		assert.deepEqual( matchedParams, params );

		done();
	}
});

test({
	message			: 'Route.matchRoute matches Regex',
	dataProvider	: [
		['', false, []],
		['/', false, []],
		['/path', true, []],
		['/path/test', true, []],
		['/path/valueToMatch', true, []],
	],
	test			: ( done, path, matched, params ) => {
		let route			= getRoute( undefined, new RegExp( '/pa' ) );
		let matchedParams	= [];

		assert.deepEqual( route.matchPath( path, matchedParams ), matched );
		assert.deepEqual( matchedParams, params );

		done();
	}
});

test({
	message			: 'Route.matchRoute matches all, BESIDES empty request path, in case of empty route provided',
	dataProvider	: [
		['', false, []],
		['/', true, []],
		['/path', true, []],
		['/path/test', true, []],
		['/path/valueToMatch', true, []],
	],
	test			: ( done, path, matched, params ) => {
		let route			= getRoute( undefined, '' );
		let matchedParams	= [];

		assert.deepEqual( route.matchPath( path, matchedParams ), matched );
		assert.deepEqual( matchedParams, params );

		done();
	}
});

test({
	message			: 'Route.match Route Matches Params',
	dataProvider	: [
		['', false, {}],
		['/', false, {}],
		['/path', false, {}],
		['/path/test', true, { value: 'test' }],
		['/path/test/sth', false, {}],
		['/path/valueToMatch', true, { value: 'valueToMatch'}],
	],
	test			: ( done, path, matched, params ) => {
		let route			= getRoute( undefined, '/path/:value:' );
		const matchedParams	= {};

		assert.deepEqual( route.matchPath( path, matchedParams ), matched );
		assert.deepEqual( matchedParams, params );
		done();
	}
});

test({
	message			: 'Route sets middlewares correctly',
	dataProvider	: [
		[ 'test', ['test'] ],
		[ ['test'], ['test'] ],
		[ ['test', 'test2'], ['test', 'test2'] ],
		[ 123, [] ],
		[ '123', ['123'] ],
	],
	test			: ( done, middleware, expectedStructure )=>{
		const route	= getRoute( undefined, undefined, undefined, middleware );

		assert.deepStrictEqual( route.getMiddlewares(), expectedStructure );

		done();
	}
});

test({
	message	: 'Route.getMiddlewares returns an array of middlewares',
	test	: ( done )=>{
		const middlewares	= ['test', 'test2'];
		const route			= getRoute( undefined, undefined, undefined, middlewares );

		assert.deepStrictEqual( route.getMiddlewares(), middlewares );
		assert.equal( Array.isArray( route.getMiddlewares() ), true );

		done();
	}
});
