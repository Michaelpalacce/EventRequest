'use strict';

// Dependencies
const { assert, test, helpers, tester }	= require( '../../../test_helper' );
const Router							= require( '../../../../server/components/routing/router' );
const Route								= require( '../../../../server/components/routing/route' );
const Server							= require( '../../../../server/server' );

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
			router.add( null );
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
	message	: 'Router.add returns self',
	test	: ( done )=>{
		const router		= new Router();
		const defaultRoute	= new Route({});

		assert.doesNotThrow( ()=>{
			assert.deepStrictEqual( router.add({}), router );
		});

		assert.deepStrictEqual( [defaultRoute], router.middleware );
		done();
	}
});

test({
	message	: 'Router.add with invalid middleware throws',
	test	: ( done )=>{
		const router		= new Router();

		assert.throws( ()=>{
			router.add();
		});

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

		assert.deepStrictEqual( routerOne.middleware, routerTwo.middleware );

		done();
	}
});

test({
	message	: 'Router.add adds another router to a given route',
	test	: ( done )=>{
		let routerOne		= new Router();
		let routerTwo		= new Router();

		routerOne.add({
			route	: '/'
		});
		routerOne.add({
			route	: '/test'
		});
		routerOne.add({
			route	: '/test/two'
		});
		routerOne.add({
			route	: '/test/:value:'
		});
		routerOne.add({
			route	: '/test',
			method	: 'GET'
		});
		routerOne.add({
			method	: 'DELETE'
		});
		routerOne.add({
			route	: '/test',
			method	: 'GET',
			handler	: ()=>{}
		});
		routerOne.get( '/routre', ()=>{} );
		routerOne.post( '/routrePOST', ()=>{} );

		routerTwo.add( '/route', routerOne );

		for ( const middleware of routerTwo.middleware )
		{
			assert.equal( middleware.route.startsWith( '/route' ), true )
		}

		done();
	}
});

test({
	message	: 'Router.add adds another router to a given route with regexp',
	test	: ( done )=>{
		let routerOne		= new Router();
		let routerTwo		= new Router();

		routerOne.get( /\/(value)/g, ()=>{} );

		routerTwo.add( '/route', routerOne );

		for ( const middleware of routerTwo.middleware )
		{
			assert.equal( Router.matchRoute( '/route/value', middleware.route ), true );
		}

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
	message	: 'Router.match method matches String requestedMethod and String method for instance router',
	test	: ( done )=>{
		const router	= new Router();

		assert.equal( router.matchMethod( 'GET', 'GET' ), true );
		assert.equal( router.matchMethod( 'POST', 'GET' ), false );

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
	message	: 'Router.match method matches String requestedMethod and Route method for instance router',
	test	: ( done )=>{
		const router	= new Router();
		let getRoute	= new Route( { method : 'GET' } );

		assert.equal( router.matchMethod( 'GET', getRoute ), true );
		assert.equal( router.matchMethod( 'POST', getRoute ), false );

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
	message	: 'Router.match method matches  String requestedMethod and Array method for instance router',
	test	: ( done )=>{
		const router	= new Router();

		assert.equal( router.matchMethod( 'GET', ['GET','POST'] ), true );
		assert.equal( router.matchMethod( 'PUT', ['GET','POST'] ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and String route',
	test	: ( done )=>{
		assert.deepStrictEqual( Router.matchRoute( '/test', '/test' ), true );
		assert.deepStrictEqual( Router.matchRoute( '/test', '/notTest' ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and String route  for instance router',
	test	: ( done )=>{
		const router	= new Router();

		assert.deepStrictEqual( router.matchRoute( '/test', '/test' ), true );
		assert.deepStrictEqual( router.matchRoute( '/test', '/notTest' ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and RegExp route',
	test	: ( done )=>{
		assert.deepStrictEqual( Router.matchRoute( '/test', new RegExp( '\/test' ) ), true );
		assert.deepStrictEqual( Router.matchRoute( '/notTest', new RegExp( '\/test' ) ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and RegExp route for instance router',
	test	: ( done )=>{
		const router	= new Router();

		assert.deepStrictEqual( router.matchRoute( '/test', new RegExp( '\/test' ) ), true );
		assert.deepStrictEqual( router.matchRoute( '/notTest', new RegExp( '\/test' ) ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and Route route',
	test	: ( done )=>{
		assert.deepStrictEqual( Router.matchRoute( '/test', new Route( { route: '/test' } ) ), true );
		assert.deepStrictEqual( Router.matchRoute( '/notTest', new Route( { route: '/test' } ) ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and Route route for instance router',
	test	: ( done )=>{
		const router	= new Router();

		assert.deepStrictEqual( router.matchRoute( '/test', new Route( { route: '/test' } ) ), true );
		assert.deepStrictEqual( router.matchRoute( '/notTest', new Route( { route: '/test' } ) ), false );

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent throws on invalid EventRequest',
	test	: ( done )=>{
		const router	= new Router();

		assert.throws( ()=>{
			router.getExecutionBlockForCurrentEvent( {} );
		});

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent returns correct execution block',
	test	: ( done )=>{
		const router						= new Router();
		const eventRequest					= helpers.getEventRequest( 'GET', '/test', {} );
		const emptyRoute					= new Route({}); // SHOULD BE ADDED
		const routeWithMethodGet			= new Route({ method: 'GET' }); // SHOULD BE ADDED
		const routeWithMethodPost			= new Route({ method: 'POST' });
		const routeWIthRouteTest			= new Route({ route: '/test' }); // SHOULD BE ADDED
		const routeWIthRouteNotTest			= new Route({ route: '/notTest' });
		const routeWIthRouteNotTestAndGet	= new Route({ route: '/notTest', method: 'GET' });
		const routeWIthRouteNotTestAndPost	= new Route({ route: '/notTest', method: 'POST' });
		const routeWIthRouteTestAndGet		= new Route({ route: '/test', method: 'GET' }); // SHOULD BE ADDED
		const routeWIthRouteTestAndPost		= new Route({ route: '/test', method: 'POST' });

		router.add( emptyRoute );
		router.add( routeWithMethodGet );
		router.add( routeWithMethodPost );
		router.add( routeWIthRouteTest );
		router.add( routeWIthRouteNotTest );
		router.add( routeWIthRouteNotTestAndGet );
		router.add( routeWIthRouteNotTestAndPost );
		router.add( routeWIthRouteTestAndGet );
		router.add( routeWIthRouteTestAndPost );

		const expectedExecutionBlockCount	= 4;

		assert.deepStrictEqual( router.getExecutionBlockForCurrentEvent( eventRequest ).length, expectedExecutionBlockCount );

		done();
	}
});

test({
	message	: 'Router.define adds a new global middleware',
	test	: ( done )=>{
		const middlewareName	= 'test';
		const router			= new Router();
		assert.deepStrictEqual( router.globalMiddlewares, {} );
		assert.equal( Object.keys( router.globalMiddlewares ).length, 0 );

		router.define( middlewareName, ( event )=>{} );
		const globalMiddlewareKeys	= Object.keys( router.globalMiddlewares );

		assert.equal( globalMiddlewareKeys.length, 1 );
		assert.equal( globalMiddlewareKeys[0], middlewareName );

		done();
	}
});

test({
	message	: 'Router.define returns router',
	test	: ( done )=>{
		const router	= new Router();

		assert.deepStrictEqual( router.define( 'test', ( event )=>{} ), router );

		done();
	}
});

test({
	message	: 'Router.define throws if trying to define a middleware with the same name',
	test	: ( done )=>{
		const middlewareName	= 'test';
		const router			= new Router();

		assert.doesNotThrow( ()=>{
			router.define( middlewareName, ( event )=>{} );
		});

		assert.throws( ()=>{
			router.define( middlewareName, ( event )=>{} );
		});

		done();
	}
});

test({
	message	: 'Router.define throws if middlewareName has invalid name',
	test	: ( done )=>{
		const router	= new Router();

		assert.throws( ()=>{
			router.define( 123, ( event )=>{} );
		});

		done();
	}
});

test({
	message	: 'Router.define throws if middleware is not a function',
	test	: ( done )=>{
		const router	= new Router();

		assert.throws( ()=>{
			router.define( 'test', 'bad' );
		});

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent adds global middlewares',
	test	: ( done )=>{
		const eventRequest				= helpers.getEventRequest( 'GET', '/test', {} );
		const expectedExecutionBlockCount	= 3;
		const router						= new Router();
		const routeWIthRouteTestAndGet	= new Route(
			{
				route: '/test',
				method: 'GET',
				handler: ()=>{},
				middlewares: ['test', 'test2']
			}
		);

		router.define( 'test', ()=>{} );
		router.define( 'test2', ()=>{} );
		router.add( routeWIthRouteTestAndGet );

		assert.deepStrictEqual( router.getExecutionBlockForCurrentEvent( eventRequest ).length, expectedExecutionBlockCount );

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent fails if route has a non existing global middleware',
	test	: ( done )=>{
		const router					= new Router();
		const eventRequest				= helpers.getEventRequest( 'GET', '/test', {} );

		const routeWIthRouteTestAndGet	= new Route(
			{
				route: '/test',
				method: 'GET',
				handler: ()=>{},
				middlewares: ['test', 'test2']
			}
		);

		router.add( routeWIthRouteTestAndGet );

		assert.throws( ()=>{
			router.getExecutionBlockForCurrentEvent( eventRequest );
		} );

		done();
	}
});

test({
	message	: 'Router.add adds another router\'s GLOBAL middleware if passed',
	test	: ( done )=>{
		const routerOne	= new Router();
		const routerTwo	= new Router();

		routerOne.define( 'test1', ()=>{} );
		routerTwo.define( 'test2', ()=>{} );

		routerOne.add( routerTwo );

		assert.equal( Object.keys( routerOne.globalMiddlewares ).length, 2 );

		done();
	}
});

test({
	message	: 'Router.add doesn\'t add another router\'s GLOBAL middleware if it has duplicates',
	test	: ( done )=>{
		const routerOne	= new Router();
		const routerTwo	= new Router();

		routerOne.define( 'test', ()=>{} );
		routerTwo.define( 'test', ()=>{} );

		assert.throws(()=>{
			routerOne.add( routerTwo );
		});

		done();
	}
});

test({
	message	: 'Router.setServerOnRuntime adds methods to the Server and to itself that return instances of themselves',
	test	: ( done )=>{
		const server	= new Server();
		const router	= server.router;

		// In general it does not have these methods
		assert.equal( typeof Server.prototype.add === 'undefined', true );
		assert.equal( typeof Server.prototype.get === 'undefined', true );
		assert.equal( typeof Server.prototype.post === 'undefined', true );
		assert.equal( typeof Server.prototype.put === 'undefined', true );
		assert.equal( typeof Server.prototype.delete === 'undefined', true );
		assert.equal( typeof Server.prototype.head === 'undefined', true );
		assert.equal( typeof Server.prototype.patch === 'undefined', true );
		assert.equal( typeof Server.prototype.copy === 'undefined', true );

		assert.equal( typeof Router.prototype.add !== 'undefined', true );

		// In general it does not have these methods
		assert.equal( typeof Router.prototype.get === 'undefined', true );
		assert.equal( typeof Router.prototype.post === 'undefined', true );
		assert.equal( typeof Router.prototype.put === 'undefined', true );
		assert.equal( typeof Router.prototype.delete === 'undefined', true );
		assert.equal( typeof Router.prototype.head === 'undefined', true );
		assert.equal( typeof Router.prototype.patch === 'undefined', true );
		assert.equal( typeof Router.prototype.copy === 'undefined', true );

		// They are attached by it's router
		assert.equal( typeof server.add !== 'undefined', true );
		assert.equal( typeof server.get !== 'undefined', true );
		assert.equal( typeof server.post !== 'undefined', true );
		assert.equal( typeof server.put !== 'undefined', true );
		assert.equal( typeof server.delete !== 'undefined', true );
		assert.equal( typeof server.head !== 'undefined', true );
		assert.equal( typeof server.patch !== 'undefined', true );
		assert.equal( typeof server.copy !== 'undefined', true );

		// They are attached by itself
		assert.equal( typeof router.get !== 'undefined', true );
		assert.equal( typeof router.post !== 'undefined', true );
		assert.equal( typeof router.put !== 'undefined', true );
		assert.equal( typeof router.delete !== 'undefined', true );
		assert.equal( typeof router.head !== 'undefined', true );
		assert.equal( typeof router.patch !== 'undefined', true );
		assert.equal( typeof router.copy !== 'undefined', true );

		assert.deepStrictEqual( server.add( { handler: ()=>{} } ) instanceof Server, true );
		assert.deepStrictEqual( server.add( ()=>{} ) instanceof Server, true );
		assert.deepStrictEqual( server.get( ()=>{} ) instanceof Server, true );
		assert.deepStrictEqual( server.post( ()=>{} ) instanceof Server, true );
		assert.deepStrictEqual( server.put( ()=>{} ) instanceof Server, true );
		assert.deepStrictEqual( server.delete( ()=>{} ) instanceof Server, true );
		assert.deepStrictEqual( server.head( ()=>{} ) instanceof Server, true );
		assert.deepStrictEqual( server.patch( ()=>{} ) instanceof Server, true );
		assert.deepStrictEqual( server.copy( ()=>{} ) instanceof Server, true );

		assert.deepStrictEqual( router.add( { handler: ()=>{} } ) instanceof Router, true );
		assert.deepStrictEqual( router.add( ()=>{} ) instanceof Router, true );
		assert.deepStrictEqual( router.get( ()=>{} ) instanceof Router, true );
		assert.deepStrictEqual( router.post( ()=>{} ) instanceof Router, true );
		assert.deepStrictEqual( router.put( ()=>{} ) instanceof Router, true );
		assert.deepStrictEqual( router.delete( ()=>{} ) instanceof Router, true );
		assert.deepStrictEqual( router.head( ()=>{} ) instanceof Router, true );
		assert.deepStrictEqual( router.patch( ()=>{} ) instanceof Router, true );
		assert.deepStrictEqual( router.copy( ()=>{} ) instanceof Router, true );

		done();
	}
});
