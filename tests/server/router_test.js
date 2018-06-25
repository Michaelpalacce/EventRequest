'use strict';

// Dependencies
const { assert, test, helpers }	= require( './../testing_suite' );
const Router					= require( './../../server/router' );
const Route						= require( './../../server/route' );

test({
	message	: 'Router.constructor does not die',
	test	: ( done )=>{
		assert.doesNotThrow( ()=>{
			new Router();
		});

		done();
	}
});

test({
	message	: 'Router.add throws an exception on invalid middleware',
	test	: ( done )=>{
		let router	= new Router();
		assert.throws( ()=>{
			router.add();
		});
		done();
	}
});

test({
	message	: 'Router.add adds a valid middleware',
	test	: ( done )=>{
		let router			= new Router();
		let defaultRoute	= new Route({});

		assert.doesNotThrow( ()=>{
			router.add({});
		});


		assert.deepStrictEqual( [defaultRoute], router.middleware );
		done();
	}
});

test({
	message	: 'Router.add adds another router\'s middleware if passed',
	test	: ( done )=>{
		let routerOne		= new Router();
		let routerTwo		= new Router();

		routerOne.add({
			route	: '/'
		});
		routerOne.add({
			route	: '/test'
		});

		routerTwo.add( routerOne );

		assert.deepStrictEqual( routerOne, routerTwo );

		done();
	}
});

test({
	message	: 'Router.match method matches String requestedMethod and String method',
	test	: ( done )=>{
		assert.equal( Router.matchMethod( 'GET', 'GET' ), true );
		assert.equal( Router.matchMethod( 'POST', 'GET' ), false );

		done();
	}
});

test({
	message	: 'Router.match method matches String requestedMethod and Route method',
	test	: ( done )=>{
		let getRoute	= new Route( { method : 'GET' } );

		assert.equal( Router.matchMethod( 'GET', getRoute ), true );
		assert.equal( Router.matchMethod( 'POST', getRoute ), false );

		done();
	}
});

test({
	message	: 'Router.match method matches  String requestedMethod and Array method',
	test	: ( done )=>{
		assert.equal( Router.matchMethod( 'GET', ['GET','POST'] ), true );
		assert.equal( Router.matchMethod( 'PUT', ['GET','POST'] ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and String route',
	test	: ( done )=>{
		assert.deepStrictEqual( Router.matchRoute( '/test', '/test' ), { matched : true, params: {} } );
		assert.deepStrictEqual( Router.matchRoute( '/test', '/notTest' ), { matched : false, params: {} } );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and RegExp route',
	test	: ( done )=>{
		assert.deepStrictEqual( Router.matchRoute( '/test', new RegExp( '\/test' ) ), { matched : true, params: {} } );
		assert.deepStrictEqual( Router.matchRoute( '/notTest', new RegExp( '\/test' ) ), { matched : false, params: {} } );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and Route route',
	test	: ( done )=>{
		assert.deepStrictEqual( Router.matchRoute( '/test', new Route( { route: '/test' } ) ), { matched : true, params: {} } );
		assert.deepStrictEqual( Router.matchRoute( '/notTest', new Route( { route: '/test' } ) ), { matched : false, params: {} } );

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent throws on invalid EventRequest',
	test	: ( done )=>{
		let router	= new Router();

		assert.throws( ()=>{
			router.getExecutionBlockForCurrentEvent( {} );
		});

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent returns correct execution block',
	test	: ( done )=>{
		let router							= new Router();
		let eventRequest					= helpers.getEventRequest( 'GET', '/test', {} );
		let emptyRoute						= new Route({}); // SHOULD BE ADDED
		let routeWithMethodGet				= new Route({ method: 'GET' }); // SHOULD BE ADDED
		let routeWithMethodPost				= new Route({ method: 'POST' });
		let routeWIthRouteTest				= new Route({ route: '/test' }); // SHOULD BE ADDED
		let routeWIthRouteNotTest			= new Route({ route: '/notTest' });
		let routeWIthRouteNotTestAndGet		= new Route({ route: '/notTest', method: 'GET' });
		let routeWIthRouteNotTestAndPost	= new Route({ route: '/notTest', method: 'POST' });
		let routeWIthRouteTestAndGet		= new Route({ route: '/test', method: 'GET' }); // SHOULD BE ADDED
		let routeWIthRouteTestAndPost		= new Route({ route: '/test', method: 'POST' });

		router.add( emptyRoute );
		router.add( routeWithMethodGet );
		router.add( routeWithMethodPost );
		router.add( routeWIthRouteTest );
		router.add( routeWIthRouteNotTest );
		router.add( routeWIthRouteNotTestAndGet );
		router.add( routeWIthRouteNotTestAndPost );
		router.add( routeWIthRouteTestAndGet );
		router.add( routeWIthRouteTestAndPost );

		let expectedExecutionBlockCount	= 4;

		assert.deepStrictEqual( router.getExecutionBlockForCurrentEvent( eventRequest ).length, expectedExecutionBlockCount );

		done();
	}
});
