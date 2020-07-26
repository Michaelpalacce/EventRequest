'use strict';

// Dependencies
const { assert, test, helpers, tester }	= require( '../../../test_helper' );
const Router							= require( '../../../../server/components/routing/router' );
const Route								= require( '../../../../server/components/routing/route' );
const Server							= require( '../../../../server/server' );

test({
	message	: 'Router.constructor does not die',
	test	: ( done ) => {
		assert.doesNotThrow( () => {
			new Router();
		});

		done();
	}
});

test({
	message	: 'Router.add throws an exception on invalid middleware',
	test	: ( done ) => {
		let router	= new Router();
		assert.throws( () => {
			router.add( null );
		});
		done();
	}
});

test({
	message	: 'Router.enableCaching.with.defaults',
	test	: ( done ) => {
		let router	= new Router();

		assert.deepStrictEqual( router.cachingIsEnabled, true );

		router.enableCaching( false );

		assert.deepStrictEqual( router.cachingIsEnabled, false );

		router.enableCaching();

		assert.deepStrictEqual( router.cachingIsEnabled, true );

		done();
	}
});

test({
	message	: 'Router.setKeyLimit.with.defaults',
	test	: ( done ) => {
		let router	= new Router();

		assert.deepStrictEqual( router.keyLimit, 5000 );

		router.setKeyLimit( 100 );

		assert.deepStrictEqual( router.keyLimit, 100 );

		router.setKeyLimit();

		assert.deepStrictEqual( router.keyLimit, 5000 );

		done();
	}
});

test({
	message	: 'Router.get.post.etc.with.invalid.middleware',
	test	: ( done ) => {
		let router	= new Router();

		assert.throws(() => {
			router.get();
		});

		assert.throws(() => {
			router.post();
		});

		assert.throws(() => {
			router.put();
		});

		assert.throws(() => {
			router.delete();
		});

		assert.throws(() => {
			router.head();
		});

		assert.throws(() => {
			router.patch();
		});

		assert.throws(() => {
			router.copy();
		});

		done();
	}
});

test({
	message	: 'Router.add adds a valid middleware',
	test	: ( done ) => {
		let router			= new Router();
		let defaultRoute	= new Route({});

		assert.doesNotThrow( () => {
			router.add({});
		});

		assert.deepStrictEqual( [defaultRoute], router.middleware );
		done();
	}
});

test({
	message	: 'Router.add.with.2.invalid.arguments',
	test	: ( done ) => {
		const router	= new Router();

		assert.throws( () => {
			router.add( 'wrong', 'wrong' );
		});

		done();
	}
});

test({
	message	: 'Router.add.another.router.with.middleware.with.regex.removes.^.if.present',
	test	: ( done ) => {
		const router	= new Router();

		const routerTwo	= new Router();
		routerTwo.get( /^\/test/, () => {} );

		router.add( '/users', routerTwo );

		assert.deepStrictEqual( router.middleware.length, 1 );
		assert.deepStrictEqual( router.middleware[0].getRoute(), /\/users\/test/ );

		done();
	}
});

test({
	message	: 'Router.add.another.router.adds.global.middlewares.as.well',
	test	: ( done ) => {
		const router		= new Router();
		const routerTwo		= new Router();

		const middleware	= () => {};
		routerTwo.define( 'test', middleware );

		router.add( routerTwo );

		assert.deepStrictEqual( Object.keys( router.globalMiddlewares ).length, 1 );
		assert.deepStrictEqual( router.globalMiddlewares.test, middleware );

		done();
	}
});

test({
	message	: 'Router.add.another.router.adds.global.middlewares.as.well.if.adding.with.route',
	test	: ( done ) => {
		const router		= new Router();
		const routerTwo		= new Router();

		const middleware	= () => {};
		routerTwo.define( 'test', middleware );

		router.add( '/user', routerTwo );

		assert.deepStrictEqual( Object.keys( router.globalMiddlewares ).length, 1 );
		assert.deepStrictEqual( router.globalMiddlewares.test, middleware );

		done();
	}
});

test({
	message	: 'Router.add.throws.if.middleware.does.not.exist',
	test	: ( done ) => {
		const router	= new Router();

		router.get( '/', 'test', () => {} );

		assert.throws(() => {
			router.getExecutionBlockForCurrentEvent( helpers.getEventRequest( 'GET', '/' ) );
		});

		done();
	}
});

test({
	message	: 'Router.add returns self',
	test	: ( done ) => {
		const router		= new Router();
		const defaultRoute	= new Route({});

		assert.doesNotThrow( () => {
			assert.deepStrictEqual( router.add({}), router );
		});

		assert.deepStrictEqual( [defaultRoute], router.middleware );
		done();
	}
});

test({
	message	: 'Router.add with invalid middleware throws',
	test	: ( done ) => {
		const router		= new Router();

		assert.throws( () => {
			router.add();
		});

		done();
	}
});

test({
	message	: 'Router.add.adds.another.router\'s middleware if passed',
	test	: ( done ) => {
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
	test	: ( done ) => {
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
			handler	: () => {}
		});
		routerOne.get( '/routre', () => {} );
		routerOne.post( '/routrePOST', () => {} );

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
	test	: ( done ) => {
		let routerOne		= new Router();
		let routerTwo		= new Router();

		routerOne.get( /\/(value)/g, () => {} );

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
	test	: ( done ) => {
		assert.equal( Router.matchMethod( 'GET', 'GET' ), true );
		assert.equal( Router.matchMethod( 'POST', 'GET' ), false );

		done();
	}
});

test({
	message	: 'Router.matchMethod.on.error',
	test	: ( done ) => {
		assert.equal( Router.matchMethod( 'POST', {} ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute.on.error',
	test	: ( done ) => {
		assert.equal( Router.matchRoute( 'POST', {} ), false );

		done();
	}
});

test({
	message	: 'Router._clearCache.when.cache.is.full',
	test	: ( done ) => {
		const router	= new Router();

		router.get( '/', () => {} );
		router.post( '/', () => {} );

		router.setKeyLimit( 1 );

		router.getExecutionBlockForCurrentEvent( helpers.getEventRequest( 'GET', '/' ) );

		setTimeout(() => {
			router.getExecutionBlockForCurrentEvent( helpers.getEventRequest( 'POST', '/' ) );
			assert.deepStrictEqual( Object.keys( router.cache ).length, 2 );

			setTimeout(() => {
				router._clearCache( 10, 0 );

				assert.deepStrictEqual( Object.keys( router.cache ).length, 1 );
				assert.deepStrictEqual( typeof router.cache['/POST'] !== 'undefined', true );

				done();
			}, 5 );
		}, 5 );
	}
});

test({
	message	: 'Router._isCacheFull.if.key.limit.is.0',
	test	: ( done ) => {
		const router	= new Router();

		router.setKeyLimit( 0 );

		router.cache['testkey']	= {};

		assert.deepStrictEqual( router._isCacheFull(), false );

		done();
	}
});

test({
	message	: 'Router.match method matches String requestedMethod and String method for instance router',
	test	: ( done ) => {
		const router	= new Router();

		assert.equal( router.matchMethod( 'GET', 'GET' ), true );
		assert.equal( router.matchMethod( 'POST', 'GET' ), false );

		done();
	}
});

test({
	message	: 'Router.match method matches String requestedMethod and Route method',
	test	: ( done ) => {
		let getRoute	= new Route( { method : 'GET' } );

		assert.equal( Router.matchMethod( 'GET', getRoute ), true );
		assert.equal( Router.matchMethod( 'POST', getRoute ), false );

		done();
	}
});

test({
	message	: 'Router.match method matches String requestedMethod and Route method for instance router',
	test	: ( done ) => {
		const router	= new Router();
		let getRoute	= new Route( { method : 'GET' } );

		assert.equal( router.matchMethod( 'GET', getRoute ), true );
		assert.equal( router.matchMethod( 'POST', getRoute ), false );

		done();
	}
});

test({
	message	: 'Router.match method matches  String requestedMethod and Array method',
	test	: ( done ) => {
		assert.equal( Router.matchMethod( 'GET', ['GET','POST'] ), true );
		assert.equal( Router.matchMethod( 'PUT', ['GET','POST'] ), false );

		done();
	}
});

test({
	message	: 'Router.match method matches  String requestedMethod and Array method for instance router',
	test	: ( done ) => {
		const router	= new Router();

		assert.equal( router.matchMethod( 'GET', ['GET','POST'] ), true );
		assert.equal( router.matchMethod( 'PUT', ['GET','POST'] ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and String route',
	test	: ( done ) => {
		assert.deepStrictEqual( Router.matchRoute( '/test', '/test' ), true );
		assert.deepStrictEqual( Router.matchRoute( '/test', '/notTest' ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and String route  for instance router',
	test	: ( done ) => {
		const router	= new Router();

		assert.deepStrictEqual( router.matchRoute( '/test', '/test' ), true );
		assert.deepStrictEqual( router.matchRoute( '/test', '/notTest' ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and RegExp route',
	test	: ( done ) => {
		assert.deepStrictEqual( Router.matchRoute( '/test', new RegExp( '\/test' ) ), true );
		assert.deepStrictEqual( Router.matchRoute( '/notTest', new RegExp( '\/test' ) ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and RegExp route for instance router',
	test	: ( done ) => {
		const router	= new Router();

		assert.deepStrictEqual( router.matchRoute( '/test', new RegExp( '\/test' ) ), true );
		assert.deepStrictEqual( router.matchRoute( '/notTest', new RegExp( '\/test' ) ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and Route route',
	test	: ( done ) => {
		assert.deepStrictEqual( Router.matchRoute( '/test', new Route( { route: '/test' } ) ), true );
		assert.deepStrictEqual( Router.matchRoute( '/notTest', new Route( { route: '/test' } ) ), false );

		done();
	}
});

test({
	message	: 'Router.matchRoute matches String requestedRoute and Route route for instance router',
	test	: ( done ) => {
		const router	= new Router();

		assert.deepStrictEqual( router.matchRoute( '/test', new Route( { route: '/test' } ) ), true );
		assert.deepStrictEqual( router.matchRoute( '/notTest', new Route( { route: '/test' } ) ), false );

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent throws on invalid EventRequest',
	test	: ( done ) => {
		const router	= new Router();

		assert.throws( () => {
			router.getExecutionBlockForCurrentEvent( {} );
		});

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent returns correct execution block',
	test	: ( done ) => {
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
	test	: ( done ) => {
		const middlewareName	= 'test';
		const router			= new Router();
		assert.deepStrictEqual( router.globalMiddlewares, {} );
		assert.equal( Object.keys( router.globalMiddlewares ).length, 0 );

		router.define( middlewareName, ( event ) => {} );
		const globalMiddlewareKeys	= Object.keys( router.globalMiddlewares );

		assert.equal( globalMiddlewareKeys.length, 1 );
		assert.equal( globalMiddlewareKeys[0], middlewareName );

		done();
	}
});

test({
	message	: 'Router.define returns router',
	test	: ( done ) => {
		const router	= new Router();

		assert.deepStrictEqual( router.define( 'test', ( event ) => {} ), router );

		done();
	}
});

test({
	message	: 'Router.define throws if trying to define a middleware with the same name',
	test	: ( done ) => {
		const middlewareName	= 'test';
		const router			= new Router();

		assert.doesNotThrow( () => {
			router.define( middlewareName, ( event ) => {} );
		});

		assert.throws( () => {
			router.define( middlewareName, ( event ) => {} );
		});

		done();
	}
});

test({
	message	: 'Router.define throws if middlewareName has invalid name',
	test	: ( done ) => {
		const router	= new Router();

		assert.throws( () => {
			router.define( 123, ( event ) => {} );
		});

		done();
	}
});

test({
	message	: 'Router.define throws if middleware is not a function',
	test	: ( done ) => {
		const router	= new Router();

		assert.throws( () => {
			router.define( 'test', 'bad' );
		});

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent adds global middlewares',
	test	: ( done ) => {
		const eventRequest				= helpers.getEventRequest( 'GET', '/test', {} );
		const expectedExecutionBlockCount	= 3;
		const router						= new Router();
		const routeWIthRouteTestAndGet	= new Route(
			{
				route: '/test',
				method: 'GET',
				handler: () => {},
				middlewares: ['test', 'test2']
			}
		);

		router.define( 'test', () => {} );
		router.define( 'test2', () => {} );
		router.add( routeWIthRouteTestAndGet );

		assert.deepStrictEqual( router.getExecutionBlockForCurrentEvent( eventRequest ).length, expectedExecutionBlockCount );

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent.caches.if.caching.is.enabled',
	test	: ( done ) => {
		const eventRequest					= helpers.getEventRequest( 'GET', '/test', {} );
		const expectedExecutionBlockCount	= 1;
		const router						= new Router();
		const route							= new Route(
			{
				route: '/test',
				method: 'GET',
				handler: () => {}
			}
		);

		router.add( route );

		assert.deepStrictEqual( router.getExecutionBlockForCurrentEvent( eventRequest ).length, expectedExecutionBlockCount );
		assert.deepStrictEqual( router.getExecutionBlockForCurrentEvent( eventRequest ).length, expectedExecutionBlockCount );
		assert.equal( typeof router.cache[`${route.getRoute()}${route.getMethod()}`] === 'object', true );
		assert.equal( typeof router.cache[`${route.getRoute()}${route.getMethod()}`].block !== 'undefined', true );
		assert.equal( Array.isArray( router.cache[`${route.getRoute()}${route.getMethod()}`].block ), true );
		assert.deepStrictEqual( router.cache[`${route.getRoute()}${route.getMethod()}`].block, [route.getHandler()] );
		assert.equal( typeof router.cache[`${route.getRoute()}${route.getMethod()}`].date === 'number', true );
		assert.equal( typeof router.cache[`${route.getRoute()}${route.getMethod()}`].params === 'object', true );
		assert.deepStrictEqual( router.cache[`${route.getRoute()}${route.getMethod()}`].params, {} );

		done();
	}
});

test({
	message	: 'Router.setKeyLimit.and._isCacheFull',
	test	: ( done ) => {
		const eventRequest		= helpers.getEventRequest( 'GET', '/test', {} );
		const eventRequestTwo	= helpers.getEventRequest( 'GET', '/testTwo', {} );

		const router			= new Router();

		const route				= new Route( { route: '/test', method: 'GET', handler: () => {} } );
		const routeTwo			= new Route( { route: '/testTwo', method: 'GET', handler: () => {} } );

		router.add( route ).add( routeTwo );

		router.getExecutionBlockForCurrentEvent( eventRequest );
		router.getExecutionBlockForCurrentEvent( eventRequestTwo );

		assert.equal( router.keyLimit, 5000 );
		assert.equal( router._isCacheFull(), false );

		router.setKeyLimit( 1 );

		assert.equal( router.keyLimit, 1 );
		assert.equal( router._isCacheFull(), true );

		done();
	}
});

test({
	message	: 'Router.enableCaching',
	test	: ( done ) => {
		const router	= new Router();

		assert.equal( router.cachingIsEnabled, true );

		router.enableCaching( false );

		assert.equal( router.cachingIsEnabled, false );

		router.enableCaching( true );

		assert.equal( router.cachingIsEnabled, true );

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent.does.not.cache.if.caching.is.disabled',
	test	: ( done ) => {
		const eventRequest					= helpers.getEventRequest( 'GET', '/test', {} );

		const expectedExecutionBlockCount	= 1;
		const router						= new Router();
		const route							= new Route(
			{
				route: '/test',
				method: 'GET',
				handler: () => {}
			}
		);

		router.add( route );

		router.enableCaching( false );

		assert.deepStrictEqual( router.getExecutionBlockForCurrentEvent( eventRequest ).length, expectedExecutionBlockCount );
		assert.deepStrictEqual( router.cache, {} );

		done();
	}
});

test({
	message	: 'Router.getExecutionBlockForCurrentEvent fails if route has a non existing global middleware',
	test	: ( done ) => {
		const router					= new Router();
		const eventRequest				= helpers.getEventRequest( 'GET', '/test', {} );

		const routeWIthRouteTestAndGet	= new Route(
			{
				route: '/test',
				method: 'GET',
				handler: () => {},
				middlewares: ['test', 'test2']
			}
		);

		router.add( routeWIthRouteTestAndGet );

		assert.throws( () => {
			router.getExecutionBlockForCurrentEvent( eventRequest );
		} );

		done();
	}
});

test({
	message	: 'Router.add adds another router\'s GLOBAL middleware if passed',
	test	: ( done ) => {
		const routerOne	= new Router();
		const routerTwo	= new Router();

		routerOne.define( 'test1', () => {} );
		routerTwo.define( 'test2', () => {} );

		routerOne.add( routerTwo );

		assert.equal( Object.keys( routerOne.globalMiddlewares ).length, 2 );

		done();
	}
});

test({
	message	: 'Router.add doesn\'t add another router\'s GLOBAL middleware if it has duplicates',
	test	: ( done ) => {
		const routerOne	= new Router();
		const routerTwo	= new Router();

		routerOne.define( 'test', () => {} );
		routerTwo.define( 'test', () => {} );

		assert.throws(() => {
			routerOne.add( routerTwo );
		});

		done();
	}
});

test({
	message	: 'Router.setServerOnRuntime adds methods to the Server and to itself that return instances of themselves',
	test	: ( done ) => {
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

		assert.deepStrictEqual( server.add( { handler: () => {} } ) instanceof Server, true );
		assert.deepStrictEqual( server.add( () => {} ) instanceof Server, true );
		assert.deepStrictEqual( server.get( () => {} ) instanceof Server, true );
		assert.deepStrictEqual( server.post( () => {} ) instanceof Server, true );
		assert.deepStrictEqual( server.put( () => {} ) instanceof Server, true );
		assert.deepStrictEqual( server.delete( () => {} ) instanceof Server, true );
		assert.deepStrictEqual( server.head( () => {} ) instanceof Server, true );
		assert.deepStrictEqual( server.patch( () => {} ) instanceof Server, true );
		assert.deepStrictEqual( server.copy( () => {} ) instanceof Server, true );

		assert.deepStrictEqual( router.add( { handler: () => {} } ) instanceof Router, true );
		assert.deepStrictEqual( router.add( () => {} ) instanceof Router, true );
		assert.deepStrictEqual( router.get( () => {} ) instanceof Router, true );
		assert.deepStrictEqual( router.post( () => {} ) instanceof Router, true );
		assert.deepStrictEqual( router.put( () => {} ) instanceof Router, true );
		assert.deepStrictEqual( router.delete( () => {} ) instanceof Router, true );
		assert.deepStrictEqual( router.head( () => {} ) instanceof Router, true );
		assert.deepStrictEqual( router.patch( () => {} ) instanceof Router, true );
		assert.deepStrictEqual( router.copy( () => {} ) instanceof Router, true );

		done();
	}
});
