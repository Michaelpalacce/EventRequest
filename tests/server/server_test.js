'use strict';

// Dependencies
const { assert, test, helpers, Mock, Mocker }	= require( '../test_helper' );
const path										= require( 'path' );
const http										= require( 'http' );
const fs										= require( 'fs' );
const { Loggur, File, Logger }					= require( './../../server/components/logger/loggur' );
const Router									= require( './../../server/components/routing/router' );
const DataServer								= require( './../../server/components/caching/data_server' );
const PluginManager								= require( './../../server/plugins/plugin_manager' );
const Session									= require( './../../server/components/session/session' );
const querystring								= require( 'querystring' );
const RateLimitsPlugin							= require( './../../server/plugins/available_plugins/rate_limits_plugin' );
const JsonBodyParser							= require( './../../server/components/body_parsers/json_body_parser' );
const BodyParserPlugin							= require( './../../server/plugins/available_plugins/body_parser_plugin' );

const { App, Server }							= require( './../../index' );
const app										= App();

test({
	message	: 'Server.constructor starts without crashing with defaults',
	test	: ( done ) => {
		assert.doesNotThrow( () => {
			const server	= new Server();

			assert.equal( 1, server.router.middleware.length );
		});
		done();
	}
});

test({
	message	: 'Server.App Returns the same as App()',
	test	: ( done ) => {
		assert.deepStrictEqual( app, App.App() );
		done();
	}
});

test({
	message	: 'Server.constructor defaults',
	test	: ( done ) => {
		let server	= new Server();
		assert.equal( true, server.router instanceof Router );
		assert.equal( 1, server.router.middleware.length );
		assert.equal( 2, Object.keys( server.plugins ).length );
		assert.equal( typeof server.pluginBag === 'object', true );
		assert.deepStrictEqual( server.pluginManager instanceof PluginManager, true );

		assert.equal( typeof server.er_timeout === 'object', true );
		assert.equal( typeof server.er_env === 'object', true );
		assert.equal( typeof server.er_rate_limits === 'object', true );
		assert.equal( typeof server.er_static_resources === 'object', true );
		assert.equal( typeof server.er_data_server === 'object', true );
		assert.equal( typeof server.er_templating_engine === 'object', true );
		assert.equal( typeof server.er_file_stream === 'object', true );
		assert.equal( typeof server.er_logger === 'object', true );
		assert.equal( typeof server.er_session === 'object', true );
		assert.equal( typeof server.er_response_cache === 'object', true );
		assert.equal( typeof server.er_body_parser_json === 'object', true );
		assert.equal( typeof server.er_body_parser_form === 'object', true );
		assert.equal( typeof server.er_body_parser_multipart === 'object', true );
		assert.equal( typeof server.er_body_parser_raw === 'object', true );
		assert.equal( typeof server.er_validation === 'object', true );

		done();
	}
});

test({
	message	: 'Server is started',
	test	: ( done ) => {
		helpers.sendServerRequest( '/ping' ).then(() => {
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.getPluginManager returns a pluginManager',
	test	: ( done ) => {
		const server		= new Server();
		const pluginManager	= server.getPluginManager();

		assert.equal( true, pluginManager instanceof PluginManager );
		done();
	}
});

test({
	message	: 'Server.getPlugin.when.has.plugin',
	test	: ( done ) => {
		const server	= new Server();

		server.apply( server.er_cors );

		assert.doesNotThrow(()=>{
			server.getPlugin( 'er_cors' );
			server.getPlugin( server.er_cors );
		});

		done();
	}
});

test({
	message	: 'Server.getPlugin.when.not.has.plugin',
	test	: ( done ) => {
		const server	= new Server();

		assert.throws(()=>{
			server.getPlugin( server.er_cors );
		});

		assert.throws(()=>{
			server.getPlugin( 'er_cors' );
		});

		done();
	}
});

test({
	message	: 'Server.add adds a handler with different permutations',
	test	: ( done ) => {
		const server	= new Server();

		server.add({
			handler	:() => {}
		});

		server.add({
			route	: '/',
			handler	:() => {}
		});

		server.add({
			route	: '/',
			method	: 'GET',
			handler	:() => {}
		});

		server.add({
			method	: 'GET',
			handler	:() => {}
		});

		server.add({
			route	: '/',
			method	: 'GET'
		});

		server.add(() => {});

		// 5 added 1 pre loaded
		assert.equal( 7, server.router.middleware.length );

		done();
	}
});

test({
	message	: 'Server.testAddingRoutersWithRoute',
	test	: ( done ) => {
		const name		= '/testAddingRoutersWithRoute';
		const router	= new Router();

		router.get( name, ( event ) => {
			event.send( name )
		});

		router.post( name, ( event ) => {
			event.send( name )
		});

		router.delete( name, ( event ) => {
			event.send( name )
		});

		router.patch( name, ( event ) => {
			event.send( name )
		});

		router.get( `${name}/:user:`, ( event ) => {
			event.send( event.params.user )
		});

		router.get( '', ( event ) => {
			event.send( name )
		});

		router.get( /\/(value)/, ( event ) => {
			event.send( name )
		});

		router.post( ``, ( event ) => {
			event.send( name )
		});

		router.delete( `/`, ( event ) => {
			event.send( name )
		});

		router.patch( `/`, ( event ) => {
			event.send( name )
		});

		app.add( '/testAdding', router );

		const promises	= [];

		promises.push( helpers.sendServerRequest( '', 'GET', 404 ) );
		promises.push( helpers.sendServerRequest( '/value', 'GET', 404 ) );
		promises.push( helpers.sendServerRequest( '', 'POST', 404 ) );
		promises.push( helpers.sendServerRequest( '/', 'DELETE', 404 ) );
		promises.push( helpers.sendServerRequest( '/', 'PATCH', 404 ) );
		promises.push( helpers.sendServerRequest( name, 'GET', 404 ) );
		promises.push( helpers.sendServerRequest( name, 'POST', 404 ) );
		promises.push( helpers.sendServerRequest( name, 'DELETE', 404 ) );
		promises.push( helpers.sendServerRequest( name, 'PATCH', 404 ) );
		promises.push( helpers.sendServerRequest( `${name}/randomUser`, 'GET', 404 ) );

		promises.push( helpers.sendServerRequest( `/testAdding`, 'GET', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding/value`, 'GET', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding${name}`, 'GET', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding${name}`, 'POST', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding`, 'POST', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding${name}`, 'DELETE', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding`, 'DELETE', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding${name}`, 'PATCH', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding`, 'PATCH', 200, '', {}, 3333, name ) );
		promises.push( helpers.sendServerRequest( `/testAdding${name}/randomUser`, 'GET', 200, '', {}, 3333, 'randomUser' ) );

		Promise.all( promises ).then(() => {
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.testRouterWildCards',
	test	: ( done ) => {
		const name	= '/testRouterWildCards';
		const value	= 'testValue';

		app.get( `${name}/:value:`, ( event ) => {
			event.send( event.params.value );
		});

		app.get( `${name}/:value:/somethingElse`, ( event ) => {
			event.send( event.params.value );
		});

		app.get( `${name}/:value:/:anotherValue:`, ( event ) => {
			event.send( event.params );
		});

		const promises	= [];

		promises.push( helpers.sendServerRequest( `${name}/${value}`, 'GET', 200, '', {}, 3333, value ) );
		promises.push( helpers.sendServerRequest( `${name}/${value}/somethingElse`, 'GET', 200, '', {}, 3333, value ) );
		promises.push(
			helpers.sendServerRequest(
				`${name}/${value}/anotherValue`,
				'GET',
				200,
				'',
				{},
				3333,
				JSON.stringify( { value, anotherValue: 'anotherValue' } )
			)
		);

		Promise.all( promises ).then(() => {
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.apply applies only a PluginInterface and a valid string',
	test	: ( done ) => {
		const server			= new Server();

		const PluginManager		= server.getPluginManager();
		const staticResources	= PluginManager.getPlugin( 'er_static_resources' );

		server.apply( staticResources );
		server.apply( 'er_static_resources' );

		assert.throws(() => {
			server.apply( 'wrong' );
		});

		assert.throws(() => {
			server.apply( {} );
		});

		// 2 added 1 pre loaded
		assert.equal( 3, server.router.middleware.length );

		done();
	}
});

test({
	message	: 'Server.get works as intended',
	test	: ( done ) => {
		const server		= new Server();
		const eventRequest	= helpers.getEventRequest( 'GET', '/' );

		server.get( '/', ( event ) => {
			event.next();
		});

		server.get( '/test', ( event ) => {
			event.next();
		});

		server.get( ( event ) => {
			event.next();
		});

		const router	= server.router;
		const block		= router.getExecutionBlockForCurrentEvent( eventRequest );

		assert.equal( 2, block.length );

		done();
	}
});

test({
	message	: 'Server.post works as intended',
	test	: ( done ) => {
		const server		= new Server();
		const eventRequest	= helpers.getEventRequest( 'POST', '/' );

		server.post( '/', ( event ) => {
			event.next();
		});

		server.post( '/test', ( event ) => {
			event.next();
		});

		server.post( ( event ) => {
			event.next();
		});

		const router	= server.router;
		const block		= router.getExecutionBlockForCurrentEvent( eventRequest );

		assert.equal( 2, block.length );

		done();
	}
});

test({
	message	: 'Server.delete works as intended',
	test	: ( done ) => {
		const server		= new Server();
		const eventRequest	= helpers.getEventRequest( 'DELETE', '/' );

		server.delete( '/', ( event ) => {
			event.next();
		});

		server.delete( '/test', ( event ) => {
			event.next();
		});

		server.delete( ( event ) => {
			event.next();
		});

		const router	= server.router;
		const block	= router.getExecutionBlockForCurrentEvent( eventRequest );

		assert.equal( 2, block.length );

		done();
	}
});

test({
	message	: 'Server.put works as intended',
	test	: ( done ) => {
		const server		= new Server();
		const eventRequest	= helpers.getEventRequest( 'PUT', '/' );

		server.put( '/', ( event ) => {
			event.next();
		});

		server.put( '/test', ( event ) => {
			event.next();
		});

		server.put( ( event ) => {
			event.next();
		});

		const router	= server.router;
		const block		= router.getExecutionBlockForCurrentEvent( eventRequest );

		assert.equal( 2, block.length );

		done();
	}
});

test({
	message	: 'Server.define calls router.define',
	test	: ( done ) => {
		const RouterMock		= Mock( Router );
		const middlewareName	= 'test';
		const server			= new Server();
		const router			= new RouterMock();
		let called				= false;

		router._mock({
			method			: 'define',
			shouldReturn	: () => {
				called	= true;
			}
		});

		server.router			= router;

		server.define( middlewareName, () => {} );

		called === true ? done() : done( 'Router.define was not called but should have been' );
	}
});

test({
	message	: 'Server.Router returns a new router',
	test	: ( done ) => {
		const router	= app.Router();
		assert( router instanceof Router, true );

		done();
	}
});

test({
	message	: 'Server.Router can be attached back',
	test	: ( done ) => {
		const server	= App();
		const name		= '/testRouterCanBeAttachedBack';

		const router	= server.Router();

		router.get( name, ( event ) => {
			event.send( name );
		});

		server.add( router );

		helpers.sendServerRequest( name, 'GET', 200 ).then(( response ) => {
			assert.equal( response.body.toString(), name );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.Router does not affect the original router if not applied back',
	test	: ( done ) => {
		const server	= App();
		const name		= '/testRouterReturnsANewRouter';

		const router	= server.Router();

		server.get( name, ( event ) => {
			event.send( name );
		});

		router.get( name, ( event ) => {
			event.send( 'wrong' );
		});

		server.listen( 3352,() => {
			helpers.sendServerRequest( name, 'GET', 200, '', {}, 3352 ).then(( response ) => {
				assert.equal( response.body.toString(), name );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server() returns the same instance',
	test	: ( done ) => {
		const server	= App();
		const serverTwo	= App();

		server.define( 'testMiddleware', () => {} );

		assert.throws( () => {
			serverTwo.define( 'testMiddleware', () => {} );
		});

		App.cleanUp();

		done();
	}
});

test({
	message	: 'Server.cleanUp() cleans up',
	test	: ( done ) => {
		const server	= App();

		server.define( 'testMiddleware', () => {} );

		assert.throws( () => {
			server.define( 'testMiddleware', () => {} );
		});

		App.cleanUp();

		App().define( 'testMiddleware', () => {} );

		done();
	}
});

test({
	message	: 'App().attach() returns a function',
	test	: ( done ) => {
		assert.equal( typeof App().attach() === 'function', true );

		done();
	}
});

test({
	message	: 'App().attach() using a httpServer works as expected',
	test	: ( done ) => {
		const httpServer	= require( 'http' );
		const body			= '<h1>Hello World!</h1>';
		const port			= 1234;
		const app			= App();

		app.get( '/attachUsingHttpServer', ( event ) => {
			event.send( body, 201 );
		});

		const server	= httpServer.createServer( App().attach() );

		server.listen( port );

		server.on( 'listening', () => {
			helpers.sendServerRequest( '/attachUsingHttpServer', 'GET',  201, '', {}, port ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server testGETWithoutRoute ( skipped cause it will fail all the others )',
	test	: ( done ) => {
		const body	= 'testGET';
		const app	= new Server();

		app.get( ( event ) => {
			event.send( body );
		});

		const server	= http.createServer( app.attach() );

		server.listen( 3335 );

		helpers.sendServerRequest( '/testGET', 'POST', 404, '', {}, 3335 ).then(() => {
			return helpers.sendServerRequest( '/testGET', 'DELETE', 404, '', {}, 3335 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'PUT', 404, '', {}, 3335 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'HEAD', 404, '', {}, 3335 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'COPY', 404, '', {}, 3335 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'PATCH', 404, '', {}, 3335 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'GET', 200, '', {}, 3335 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testGET',
	test	: ( done ) => {
		const body	= 'testGET';
		app.get( '/testGET', ( event ) => {
			event.send( body );
		});

		helpers.sendServerRequest( '/testGET', 'POST', 404 ).then(() => {
			return helpers.sendServerRequest( '/testGET', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGET' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testPOST',
	test	: ( done ) => {
		const body	= 'testPOST';
		app.post( '/testPOST', ( event ) => {
			event.send( body );
		});

		helpers.sendServerRequest( '/testPOST', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testPOST', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOST', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOST', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOST', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOST', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOST', 'POST' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testDELETE',
	test	: ( done ) => {
		const body	= 'testDELETE';
		app.delete( '/testDELETE', ( event ) => {
			event.send( body );
		});

		helpers.sendServerRequest( '/testDELETE', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testDELETE', 'POST', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETE', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETE', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETE', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETE', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETE', 'DELETE' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testPUT',
	test	: ( done ) => {
		const body	= 'testPUT';
		app.put( '/testPUT', ( event ) => {
			event.send( body );
		});

		helpers.sendServerRequest( '/testPUT', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testPUT', 'POST', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUT', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUT', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUT', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUT', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUT', 'PUT' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testHEAD also head does not return body even if sent',
	test	: ( done ) => {
		const body	= 'testHEAD';
		app.head( '/testHEAD', ( event ) => {
			event.send( body );
		});

		helpers.sendServerRequest( '/testHEAD', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testHEAD', 'POST', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEAD', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEAD', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEAD', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEAD', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEAD', 'HEAD' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), '' );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testPATCH',
	test	: ( done ) => {
		const body	= 'testPATCH';
		app.patch( '/testPATCH', ( event ) => {
			event.send( body );
		});

		helpers.sendServerRequest( '/testPATCH', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testPATCH', 'POST', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCH', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCH', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCH', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCH', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCH', 'PATCH' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testGET with add',
	test	: ( done ) => {
		const body	= 'testGETWithAdd';
		app.add({
			method	: 'GET',
			route	: '/testGETWithAdd',
			handler	: ( event ) => {
				event.send( body );
			}
		});

		helpers.sendServerRequest( '/testGETWithAdd', 'POST', 404 ).then(() => {
			return helpers.sendServerRequest( '/testGETWithAdd', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGETWithAdd', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGETWithAdd', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGETWithAdd', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGETWithAdd', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testGETWithAdd' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testPOST with add',
	test	: ( done ) => {
		const body	= 'testPOSTWithAddWithAdd';
		app.add({
			method	: 'POST',
			route	: '/testPOSTWithAdd',
			handler	: ( event ) => {
				event.send( body );
			}
		});

		helpers.sendServerRequest( '/testPOSTWithAdd', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testPOSTWithAdd', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOSTWithAdd', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOSTWithAdd', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOSTWithAdd', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOSTWithAdd', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPOSTWithAdd', 'POST' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testDELETE with add',
	test	: ( done ) => {
		const body	= 'testDELETEWithAdd';
		app.add({
			method	: 'DELETE',
			route	: '/testDELETEWithAdd',
			handler	: ( event ) => {
				event.send( body );
			}
		});

		helpers.sendServerRequest( '/testDELETEWithAdd', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testDELETEWithAdd', 'POST', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETEWithAdd', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETEWithAdd', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETEWithAdd', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETEWithAdd', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testDELETEWithAdd', 'DELETE' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testPUT with add',
	test	: ( done ) => {
		const body	= 'testPUTWithAdd';
		app.add({
			method	: 'PUT',
			route	: '/testPUTWithAdd',
			handler	: ( event ) => {
				event.send( body );
			}
		});

		helpers.sendServerRequest( '/testPUTWithAdd', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testPUTWithAdd', 'POST', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUTWithAdd', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUTWithAdd', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUTWithAdd', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUTWithAdd', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPUTWithAdd', 'PUT' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testHEAD with add also head does not return body even if sent',
	test	: ( done ) => {
		const body	= 'testHEADWithAdd';
		app.add({
			method	: 'HEAD',
			route	: '/testHEADWithAdd',
			handler	: ( event ) => {
				event.send( body );
			}
		});

		helpers.sendServerRequest( '/testHEADWithAdd', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testHEADWithAdd', 'POST', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEADWithAdd', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEADWithAdd', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEADWithAdd', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEADWithAdd', 'PATCH', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testHEADWithAdd', 'HEAD' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), '' );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server testPATCH with add',
	test	: ( done ) => {
		const body	= 'testPATCHWithAdd';
		app.add({
			method	: 'PATCH',
			route	: '/testPATCHWithAdd',
			handler	: ( event ) => {
				event.send( body );
			}
		});

		helpers.sendServerRequest( '/testPATCHWithAdd', 'GET', 404 ).then(() => {
			return helpers.sendServerRequest( '/testPATCHWithAdd', 'POST', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCHWithAdd', 'DELETE', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCHWithAdd', 'PUT', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCHWithAdd', 'COPY', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCHWithAdd', 'HEAD', 404 );
		}).then(() => {
			return helpers.sendServerRequest( '/testPATCHWithAdd', 'PATCH' );
		}).then(( response ) => {
			assert.equal( response.body.toString(), body );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test add is case insensitive',
	test	: ( done ) => {
		const body			= 'testGETCaseInsensitive';
		const headerName	= 'testGETCaseInsensitive';
		const headerValue	= 'value';
		app.add({
			method	: 'GET',
			route	: '/testGETCaseInsensitive',
			handler	: ( event ) => {
				event.setResponseHeader( headerName, headerValue );
				event.next();
			}
		});

		app.add({
			method	: 'get',
			route	: '/testGETCaseInsensitive',
			handler	: ( event ) => {
				event.send( body );
			}
		});

		helpers.sendServerRequest( '/testGETCaseInsensitive' ).then(( response ) => {
			assert.equal( response.headers[headerName.toLowerCase()], headerValue );
			assert.equal( response.body.toString(), body );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.global.middlewares',
	test	: ( done ) => {
		const body			= 'testGETWithMiddlewares';
		const headerName	= 'testGETWithMiddlewares';
		const headerValue	= 'value';

		app.define( 'testGETWithMiddlewaresMiddleware', ( event ) => {
			event.setResponseHeader( headerName, headerValue );
			event.next();
		} );

		app.get( '/testGETWithMiddlewares', 'testGETWithMiddlewaresMiddleware', ( event ) => {
			event.send( body );
		} );

		helpers.sendServerRequest( '/testGETWithMiddlewares' ).then(( response ) => {
			assert.equal( response.headers[headerName.toLowerCase()], headerValue );
			assert.equal( response.body.toString(), body );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test multiple middlewares',
	test	: ( done ) => {
		const body				= 'testGETWithMultipleMiddlewares';

		const headerName		= 'testGETWithMultipleMiddlewaresOne';
		const headerValue		= 'valueOne';

		const headerNameTwo		= 'testGETWithMultipleMiddlewaresTwo';
		const headerValueTwo	= 'valueTwo';

		app.define( 'testGETWithMultipleMiddlewaresMiddlewareOne', ( event ) => {
			event.setResponseHeader( headerName, headerValue );
			event.next();
		} );

		app.define( 'testGETWithMultipleMiddlewaresMiddlewareTwo', ( event ) => {
			event.setResponseHeader( headerNameTwo, headerValueTwo );
			event.next();
		} );

		app.get( '/testGETWithMultipleMiddlewares', ['testGETWithMultipleMiddlewaresMiddlewareOne', 'testGETWithMultipleMiddlewaresMiddlewareTwo'], ( event ) => {
			event.send( body );
		} );

		helpers.sendServerRequest( '/testGETWithMultipleMiddlewares' ).then(( response ) => {
			assert.equal( response.headers[headerName.toLowerCase()], headerValue );
			assert.equal( response.headers[headerNameTwo.toLowerCase()], headerValueTwo );
			assert.equal( response.body.toString(), body );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test empty middleware',
	test	: ( done ) => {
		const body			= 'testEmptyMiddleware';
		const headerName	= 'testEmptyMiddleware';
		const headerValue	= 'valueOne';

		app.add(( event ) => {
			event.setResponseHeader( headerName, headerValue );
			event.next();
		});

		app.get( '/testEmptyMiddleware', ( event ) => {
			event.send( body );
		} );

		helpers.sendServerRequest( '/testEmptyMiddleware' ).then(( response ) => {
			assert.equal( response.headers[headerName.toLowerCase()], headerValue );
			assert.equal( response.body.toString(), body );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest header functions',
	test	: ( done ) => {
		const name			= 'testEventRequestHeaderFunctions';
		const headerName	= 'testEventRequestHeaderFunctions';
		const headerValue	= 'valueOne';

		app.get( `/${name}`, ( event ) => {
			event.setResponseHeader( 'testHeader', headerValue );
			event.setResponseHeader( 'shouldNotExist', headerValue );
			event.removeResponseHeader( 'shouldNotExist' );

			if (
				event.hasRequestHeader( headerName )
				&& event.getRequestHeader( headerName ) === headerValue
				&& event.hasRequestHeader( 'missing' ) === false
				&& event.getRequestHeader( 'missing' ) === null
				&& event.getRequestHeader( 'missing', 'default' ) === 'default'
				&& event.response.getHeader( 'testHeader' ) === headerValue
			) {
				return event.send( name );
			}

			event.sendError( 'Error', 400 );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 200, '', { [headerName]: headerValue } ).then(( response ) => {
			assert.equal( response.headers['testheader'] === headerValue, true );
			assert.equal( response.headers['shouldnotexist'] === undefined, true );
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest setStatusCode',
	test	: ( done ) => {
		const name					= 'testSetStatusCode';
		const expectedStatusCode	= 201;

		app.get( `/${name}`, ( event ) => {
			event.setStatusCode( expectedStatusCode );
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', expectedStatusCode ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.eventRequest.send.without.specifying.a.status.code',
	test	: ( done ) => {
		const name					= 'testSendWithoutSpecifyingAStatusCode';
		const expectedStatusCode	= 200;

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', expectedStatusCode ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});


test({
	message	: 'Server.test eventRequest redirect',
	test	: ( done ) => {
		const name					= 'testRedirect';
		const expectedStatusCode	= 303;
		const expectedRedirectRoute	= '/testRedirectedRoute';

		app.get( `/${name}`, ( event ) => {
			event.redirect( expectedRedirectRoute, expectedStatusCode );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', expectedStatusCode ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { redirectUrl: expectedRedirectRoute } ) );
			assert.equal( typeof response.headers.location === 'string', true );
			assert.equal( response.headers.location === expectedRedirectRoute, true );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest redirect',
	test	: ( done ) => {
		const name					= 'testRedirectTwo';
		const expectedRedirectRoute	= '/testRedirectedRouteTwo';

		app.get( `/${name}`, ( event ) => {
			event.redirect( expectedRedirectRoute );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 302 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { redirectUrl: expectedRedirectRoute } ) );
			assert.equal( typeof response.headers.location === 'string', true );
			assert.equal( response.headers.location === expectedRedirectRoute, true );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest isFinished',
	test	: ( done ) => {
		const name					= 'testIsFinished';

		app.get( `/${name}`, ( event ) => {
			event.response.finished	= true;

			if ( ! event.isFinished() )
			{
				event.response.finished	= false;
				return event.sendError( '', 400 );
			}
			event.response.finished	= false;

			event.finished	= true;

			if ( ! event.isFinished() )
			{
				event.finished	= false;
				return event.sendError( '', 400 );
			}

			event.finished	= false;

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest send string',
	test	: ( done ) => {
		const name	= 'testSendString';

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest send object',
	test	: ( done ) => {
		const name	= 'testSendObject';

		app.get( `/${name}`, ( event ) => {
			event.send( { name } );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { name } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest sendError',
	test	: ( done ) => {
		const name	= 'testEventSendError';

		app.get( `/${name}`, ( event ) => {
			event.sendError( name );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 500 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: name } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest sendError send Error',
	test	: ( done ) => {
		const name	= 'testEventSendErrorWithError';
		const error	= new Error( 'test' );

		app.get( `/${name}`, ( event ) => {
			event.sendError( error );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 500 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'test' } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest sendError with different status',
	test	: ( done ) => {
		const name	= 'testEventSendErrorWithDifferentStatus';

		app.get( `/${name}`, ( event ) => {
			event.sendError( name, 501 );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 501 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: name } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest send Error',
	test	: ( done ) => {
		const error	= new Error( 'Error' );
		const name	= 'testSendError';

		app.get( `/${name}`, ( event ) => {
			event.send( error );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( {} ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest send raw',
	test	: ( done ) => {
		const name	= 'testSendErrorRaw';

		app.get( `/${name}`, ( event ) => {
			event.send( '<h1>Test</h1>', 200, true );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), '<h1>Test</h1>' );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest send stream',
	test	: ( done ) => {
		const name	= 'testSendErrorStream';

		app.get( `/${name}`, ( event ) => {
			event.send( fs.createReadStream( path.join( __dirname, './fixture/send/fileToStream.txt' ) ) );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), 'test' );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest isFinished',
	test	: ( done ) => {
		const name					= 'testIsFinished';

		app.get( `/${name}`, ( event ) => {
			event.response.finished	= true;

			if ( ! event.isFinished() )
			{
				event.response.finished	= false;
				return event.sendError( '', 400 );
			}
			event.response.finished	= false;

			event.finished	= true;

			if ( ! event.isFinished() )
			{
				event.finished	= false;
				return event.sendError( '', 400 );
			}

			event.finished	= false;

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test eventRequest setCookie',
	test	: ( done ) => {
		const name			= 'testSetCookie';
		const cookiesValue	= 'ok';

		app.get( `/${name}`, ( event ) => {
			if (
				! event.setCookie( 'test1', cookiesValue )
				|| event.setCookie( 'test2' )
				|| event.setCookie( 'test3', null )
				|| event.setCookie( 'test4', undefined )
				|| event.setCookie( null, cookiesValue )
				|| event.setCookie( undefined, cookiesValue )
				|| ! event.setCookie( 'test5', cookiesValue )
				|| ! event.setCookie( 'test6', cookiesValue )
				|| ! event.setCookie( 'test7', cookiesValue, { Path: '/', Domain: 'localhost', HttpOnly: true, 'Max-Age': 100, Expires: 500, caseSensitive: 5, CaseSensitive: 10 } )
			) {
				event.sendError( 'error', 400 );
			}
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( Array.isArray( response.headers['set-cookie'] ), true );
			const presentCookies	= ['test1', 'test5', 'test6','test7'];
			const cookies			= response.headers['set-cookie'].join( ' ' );

			for ( const cookieName of presentCookies )
			{
				assert.equal( cookies.includes( cookieName ), true );
			}
			assert.equal( response.headers['set-cookie'][3].includes( 'Path=/;' ), true );
			assert.equal( response.headers['set-cookie'][3].includes( 'Domain=localhost;' ), true );
			assert.equal( response.headers['set-cookie'][3].includes( 'HttpOnly=true;' ), true );
			assert.equal( response.headers['set-cookie'][3].includes( 'caseSensitive=5;' ), true );
			assert.equal( response.headers['set-cookie'][3].includes( 'CaseSensitive=10;' ), true );
			assert.equal( response.headers['set-cookie'][3].includes( 'Max-Age' ), true );
			assert.equal( response.headers['set-cookie'][3].includes( 'Expires' ), true );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.er_securityOnDefaults',
	test	: ( done ) => {
		const port	= 3370;
		const name	= 'testErSecurityOnDefaults';
		const app	= new Server();

		app.apply( app.er_security );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', true );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', true );

				assert.equal( response.headers['content-security-policy'], "default-src 'none'; script-src 'self'; img-src 'self'; font-src 'self'; style-src 'self'; connect-src 'self'; child-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=31536000;" );
				assert.equal( response.headers['expect-ct'], "max-age=86400, enforce" );
				assert.equal( response.headers['x-content-type-options'], "nosniff" );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_security.with.constructor.with.options',
	test	: ( done ) => {
		const port	= 3379;
		const name	= 'testErSecurityWithConstructorWithOptionsRemovesBuild';
		const app	= new Server();

		const SecurityConstructor	= app.er_security.constructor;
		const securityPlugin		= new SecurityConstructor( 'id', { build : false } );
		assert.deepStrictEqual( securityPlugin.options, { build: false } );

		app.apply( securityPlugin );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );

				assert.equal( typeof response.headers['content-security-policy'], 'undefined' );
				assert.equal( typeof response.headers['strict-transport-security'], 'undefined' );
				assert.equal( typeof response.headers['expect-ct'], 'undefined' );
				assert.equal( typeof response.headers['x-content-type-options'], 'undefined' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_securityWithChangesFromTheOptions',
	test	: ( done ) => {
		const port	= 3371;
		const name	= 'testErSecurityWithChangesFromTheOptions';
		const app	= new Server();

		app.apply( app.er_security, {
			csp		: { xss: false,  directives: { 'font-src': ["self", 'test'], 'upgrade-insecure-requests': [] }, self: true, sandbox: true },
			ect		: { enabled: false, maxAge: 30000 },
			hsts	: { maxAge: 300, preload: true, includeSubDomains: false },
			cto		: { enabled: true }
		});

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', false );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', true );

				assert.equal( response.headers['content-security-policy'], "font-src 'self' test; upgrade-insecure-requests; default-src 'self'; sandbox;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=300; preload;" );
				assert.equal( response.headers['expect-ct'], undefined );
				assert.equal( response.headers['x-content-type-options'], "nosniff" );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_securityWithChangesInline',
	test	: ( done ) => {
		const port	= 3372;
		const name	= 'testErSecurityWithChangesInline';
		const app	= new Server();

		app.apply( app.er_security, { csp : { xss: false } } );

		app.add(( event ) => {

			event.$security.csp.addFontSrc( 'self' );
			event.$security.csp.addFontSrc( "'self'" );
			event.$security.csp.addFontSrc( 'test' );
			event.$security.csp.upgradeInsecureRequests();
			event.$security.csp.enableSelf();
			event.$security.csp.enableSandbox();

			event.$security.ect.setEnabled( false );
			event.$security.ect.setMaxAge( 30000 );

			event.$security.hsts.setMaxAge( 300 );
			event.$security.hsts.setMaxAge( null );
			event.$security.hsts.setMaxAge( 'string' );
			event.$security.hsts.preload();
			event.$security.hsts.includeSubDomains( false );

			event.$security.build();

			event.next();
		});

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', false );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', true );

				assert.equal( response.headers['content-security-policy'], "font-src 'self' test; upgrade-insecure-requests; default-src 'self'; sandbox;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=300; preload;" );
				assert.equal( response.headers['expect-ct'], undefined );
				assert.equal( response.headers['x-content-type-options'], "nosniff" );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_securityCallingBuildMultipleTimes',
	test	: ( done ) => {
		const port	= 3373;
		const name	= 'testErSecurityWithChangesInline';
		const app	= new Server();

		app.apply( app.er_security, { csp : { xss: false } } );

		app.add(( event ) => {

			event.$security.csp.addFontSrc( 'self' );
			event.$security.csp.addFontSrc( "'self'" );
			event.$security.csp.addFontSrc( 'test' );
			event.$security.csp.upgradeInsecureRequests();
			event.$security.csp.enableSelf();
			event.$security.csp.enableSandbox();

			event.$security.ect.setEnabled( false );
			event.$security.ect.setMaxAge( 30000 );

			event.$security.hsts.setMaxAge( 300 );
			event.$security.hsts.setMaxAge( null );
			event.$security.hsts.setMaxAge( 'string' );
			event.$security.hsts.preload();
			event.$security.hsts.includeSubDomains( false );

			event.$security.build();
			event.$security.build();
			event.$security.build();

			event.next();
		});

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', false );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', true );

				assert.equal( response.headers['content-security-policy'], "font-src 'self' test; upgrade-insecure-requests; default-src 'self'; sandbox;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=300; preload;" );
				assert.equal( response.headers['expect-ct'], undefined );
				assert.equal( response.headers['x-content-type-options'], "nosniff" );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_securityCallingBuildMultipleTimesAppliesChangesIfAny',
	test	: ( done ) => {
		const port	= 3374;
		const name	= 'testErSecurityWithChangesInline';
		const app	= new Server();

		app.apply( app.er_security, { csp : { xss: false } } );

		app.add(( event ) => {

			event.$security.csp.addFontSrc( 'self' );
			event.$security.csp.addFontSrc( "'self'" );
			event.$security.csp.addFontSrc( 'test' );
			event.$security.csp.upgradeInsecureRequests();
			event.$security.csp.enableSelf();
			event.$security.csp.enableSandbox();

			event.$security.ect.setEnabled( false );
			event.$security.ect.setMaxAge( 30000 );

			event.$security.hsts.setMaxAge( 300 );
			event.$security.hsts.setMaxAge( null );
			event.$security.hsts.setMaxAge( 'string' );
			event.$security.hsts.preload();
			event.$security.hsts.includeSubDomains( false );

			event.$security.build();

			event.$security.csp.addScriptSrc( 'test' );
			event.$security.cto.setEnabled( false );

			event.$security.build();

			event.next();
		});

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', false );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', false );

				assert.equal( response.headers['content-security-policy'], "font-src 'self' test; upgrade-insecure-requests; default-src 'self'; sandbox; script-src test;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=300; preload;" );
				assert.equal( response.headers['expect-ct'], undefined );
				assert.equal( response.headers['x-content-type-options'], undefined );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test er_body_parser_json does not parse anything but application/json',
	test	: ( done ) => {
		const name			= 'testErJsonBodyParserParsesApplicationJson';
		const formDataKey	= 'testErJsonBodyParserParsesApplicationJson';
		const formDataValue	= 'value';

		const app			= new Server();

		app.apply( app.er_body_parser_json, { maxPayloadLength: 60 } );

		app.get( `/${name}`, ( event ) => {
			if (
				typeof event.body === 'undefined'
				|| typeof event.body[formDataKey] === 'undefined'
				|| ! event.body[formDataKey].includes( formDataValue )
			) {
				event.sendError( 'Body was not parsed', 400 );
			}

			event.send( 'ok' );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': 'application/json' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ ['content-type'.toUpperCase()]: 'application/json' },
				3337
			)
		);

		// Above the limit of 60 bytes
		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue + formDataValue + formDataValue } ),
				{ 'content-type': 'application/json' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': 'application/*' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': '*/*' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': 'json' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': '*' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{},
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				'{wrongJson',
				{},
				3337
			)
		);

		const server	= app.listen( 3337, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_body_parser_json.does.not.parse.anything.but.application/json.setting.options',
	test	: ( done ) => {
		const name			= 'testErJsonBodyParserParsesApplicationJson';
		const formDataKey	= 'testErJsonBodyParserParsesApplicationJson';
		const formDataValue	= 'value';

		const app			= new Server();

		app.er_body_parser_json.setOptions({
			maxPayloadLength: 60
		});
		app.apply( app.er_body_parser_json );

		app.get( `/${name}`, ( event ) => {
			if (
				typeof event.body === 'undefined'
				|| typeof event.body[formDataKey] === 'undefined'
				|| ! event.body[formDataKey].includes( formDataValue )
			) {
				event.sendError( 'Body was not parsed', 400 );
			}

			event.send( 'ok' );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': 'application/json' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ ['content-type'.toUpperCase()]: 'application/json' },
				3337
			)
		);

		// Above the limit of 60 bytes
		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue + formDataValue + formDataValue } ),
				{ 'content-type': 'application/json' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': 'application/*' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': '*/*' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': 'json' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': '*' },
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				JSON.stringify( { [formDataKey]: formDataValue } ),
				{},
				3337
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				'{wrongJson',
				{},
				3337
			)
		);

		const server	= app.listen( 3337, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test er_body_parser_json does not parse above the maxPayload if strict',
	test	: ( done ) => {
		const name			= 'testErJsonBodyParserParsesApplicationJson';
		const formDataKey	= 'testErJsonBodyParserParsesApplicationJson';
		const formDataValue	= 'value';

		const app			= new Server();

		app.apply( app.er_body_parser_json, { maxPayloadLength: 60, strict: true } );

		app.get( `/${name}`, ( event ) => {
			assert.deepStrictEqual( event.body, {} );
			assert.deepStrictEqual( event.rawBody, {} );

			event.send( 'ok' );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify( { [formDataKey]: formDataValue + formDataValue + formDataValue } ),
				{ 'content-type': 'application/json' },
				3338
			)
		);

		const server	= app.listen( 3338, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test er_body_parser_form parser above the maxPayload if not strict',
	test	: ( done ) => {
		const name			= 'testErBodyParserFormParsesApplicationXWwwFormUrlencoded';
		const formDataKey	= 'testErBodyParserFormParsesApplicationXWwwFormUrlencoded';
		const formDataValue	= 'value';

		const app			= new Server();

		app.apply( app.er_body_parser_form, { maxPayloadLength: 60, strict: false } );

		app.get( `/${name}`, ( event ) => {
			if (
				typeof event.body === 'undefined'
				|| typeof event.body[formDataKey] === 'undefined'
				|| ! event.body[formDataKey].includes( formDataValue )
			) {
				event.sendError( 'Body was not parsed', 400 );
			}

			event.send( 'ok' );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': 'application/x-www-form-urlencoded' },
				3339
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify( { [formDataKey]: formDataValue + formDataValue + formDataValue } ),
				{ 'content-type': 'application/x-www-form-urlencoded' },
				3339
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type' : '' },
				3339
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': 'application/*' },
				3339
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				querystring.stringify( { [formDataKey]: formDataValue } ),
				{ 'content-type': '*' },
				3339
			)
		);

		const server	= app.listen( 3339, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test er_body_parser_form does parse not above the maxPayload if strict',
	test	: ( done ) => {
		const name			= 'testErBodyParserFormParsesApplicationXWwwFormUrlencoded';
		const formDataKey	= 'testErBodyParserFormParsesApplicationXWwwFormUrlencoded';
		const formDataValue	= 'value';

		const app			= new Server();

		app.apply( app.er_body_parser_form, { maxPayloadLength: 60, strict: true } );

		app.get( `/${name}`, ( event ) => {
			assert.deepStrictEqual( event.body, {} );

			event.send( 'ok' );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				querystring.stringify( { [formDataKey]: formDataValue + formDataValue + formDataValue } ),
				{ 'content-type': 'application/x-www-form-urlencoded' },
				3340
			)
		);

		const server	= app.listen( 3340, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_body_parser_multipart.parses.only.multipart/form-data',
	test	: ( done ) => {
		const name				= 'testErBodyParserMultipartParsesMultipartFormData';
		const multipartDataCR	= fs.readFileSync( path.join( __dirname, './fixture/body_parser/multipart/multipart_data_CR' ) );
		const multipartDataCRLF	= fs.readFileSync( path.join( __dirname, './fixture/body_parser/multipart/multipart_data_CRLF' ) );
		const multipartDataLF	= fs.readFileSync( path.join( __dirname, './fixture/body_parser/multipart/multipart_data_LF' ) );
		const tempDir			= path.join( __dirname, `./fixture/body_parser/multipart` );
		const app				= new Server();

		app.apply( app.er_body_parser_multipart, { tempDir } );

		app.get( `/${name}`, ( event ) => {
			if (
				typeof event.body === 'undefined'
				|| typeof event.body.$files === 'undefined'
				|| event.body.text !== 'text default'
				|| event.body.$files.length !== 2
				|| event.body.$files[0].type !== 'file'
				|| event.body.$files[0].size !== 17
				|| event.body.$files[0].contentType !== 'text/plain'
				|| event.body.$files[0].name !== 'a.txt'
				|| ! event.body.$files[0].path.includes( tempDir )
				|| event.body.$files[1].type !== 'file'
				|| event.body.$files[1].size !== 48
				|| event.body.$files[1].contentType !== 'text/html'
				|| event.body.$files[1].name !== 'a.html'
				|| ! event.body.$files[1].path.includes( tempDir )
			) {
				event.sendError( 'Body was not parsed', 400 );
			}

			event.send( 'ok' );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				multipartDataCRLF,
				{ 'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266' },
				3341
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				multipartDataCR,
				{ 'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266' },
				3341
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				multipartDataLF,
				{ 'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266' },
				3341
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				multipartDataCRLF,
				{ 'content-type': 'multipart/form-data; boundary=---------------------------9041544843365972754266' },
				3341
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				500,
				multipartDataCRLF,
				{ 'content-type': 'multipart/form-data' },
				3341
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				multipartDataCRLF,
				{},
				3341
			)
		);

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				400,
				'',
				{ 'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266' },
				3341
			)
		);

		const server	= app.listen( 3341, () => {
			Promise.all( responses ).then(() => {
				setTimeout(() => {
					server.close();
					done();
				}, 500 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test er_body_parser_multipart will not parse if limit is reached',
	test	: ( done ) => {
		const name			= 'testErBodyParserMultipartParsesMultipartFormData';
		const multipartData	= fs.readFileSync( path.join( __dirname, `./fixture/body_parser/multipart/multipart_data_CRLF` ) );
		const tempDir		= path.join( __dirname, './fixture/body_parser/multipart' );
		const app			= new Server();

		app.apply( app.er_body_parser_multipart, { tempDir, maxPayload: 10 } );

		app.get( `/${name}`, ( event ) => {
			event.send( 'ok' );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				500,
				multipartData,
				{ 'content-type': 'multipart/form-data; boundary=---------------------------9051914041544843365972754266' },
				3342
			)
		);

		const server	= app.listen( 3342, () => {
			Promise.all( responses ).then(() => {
				setTimeout(() => {
					server.close();
					done();
				}, 500 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test body_parser_handler fallback parser',
	test	: ( done ) => {
		const name	= 'testBodyParserHandlerFallbackParser';
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( `/${name}`, ( event ) => {
			event.send( { body: event.body, rawBody: event.rawBody } );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				'SomeRandomData',
				{ 'content-type': 'somethingDoesntMatter' },
				3901,
				JSON.stringify( { body: 'SomeRandomData', rawBody: 'SomeRandomData' } )
			)
		);

		const server	= app.listen( 3901, () => {
			Promise.all( responses ).then(() => {
				setTimeout(() => {
					server.close();
					done();
				}, 500 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_body_parser.setOptions.without.anything',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json, { maxPayloadLength: 1 } );
		assert.deepStrictEqual( app.er_body_parser_json.options, { maxPayloadLength: 1 } );

		app.er_body_parser_json.setOptions();
		app.apply( app.er_body_parser_json );
		assert.deepStrictEqual( app.er_body_parser_json.options, {} );

		done();
	}
});

test({
	message	: 'Server.test.er_body_parser.when.event.body.already.exists.does.not.parse',
	test	: ( done ) => {
		const name	= 'testErBodyParserDoesNotParseIfBodyExists';
		const app	= new Server();

		app.get( `/${name}`, ( event ) => {
			event.body		= 'TEST';
			event.rawBody	= 'TEST';
			event.next();
		});

		app.apply( app.er_body_parser_json );

		app.get( `/${name}`, ( event ) => {
			event.send( { body: event.body, rawBody: event.rawBody } );
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				JSON.stringify( { key: 123 } ),
				{ 'content-type': 'application/json' },
				4300,
				JSON.stringify( { body: 'TEST', rawBody: 'TEST' } )
			)
		);

		const server = app.listen( 4300, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_body_parser.when.parsed.data.is.invalid',
	test	: ( done ) => {
		const name				= 'testErBodyParserIfInvalidParserData';
		const app				= new Server();
		const MockBodyParser	= Mock( JsonBodyParser );

		Mocker( MockBodyParser, {
			method			: 'parse',
			shouldReturn	: () => {
				return new Promise(( resolve ) => {
					resolve( 'wrongData' );
				});
			}
		});

		Mocker( MockBodyParser, {
			method			: 'supports',
			shouldReturn	: () => {
				return true;
			}
		});

		app.apply( new BodyParserPlugin( MockBodyParser, 'er_test' ) );

		app.get( `/${name}`, ( event ) => {
			event.send( { body: event.body, rawBody: event.rawBody } );
		});

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				'',
				{ 'content-type': '*/*' },
				4301,
				JSON.stringify( { body: {}, rawBody: {} } )
			)
		);

		const server = app.listen( 4301, () => {
			Promise.all( responses ).then(() => {
				server.close();
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_body_parser.setServerOnRuntime.without.pluginbag.creates.one',
	test	: ( done ) => {
		const app	= new Server();

		assert.deepStrictEqual( typeof app.pluginBag.parsers, 'undefined' );

		app.apply( app.er_body_parser_json );
		assert.deepStrictEqual( typeof app.pluginBag.parsers, 'object' );
		assert.deepStrictEqual( Object.keys( app.pluginBag.parsers ).length, 1 );

		app.apply( app.er_body_parser_form );
		assert.deepStrictEqual( typeof app.pluginBag.parsers, 'object' );
		assert.deepStrictEqual( Object.keys( app.pluginBag.parsers ).length, 2 );

		done();
	}
});

test({
	message	: 'Server.test er_body_parser_raw handles anything',
	test	: ( done ) => {
		const name	= 'testErBodyParserRaw';
		const app	= new Server();

		app.apply( app.er_body_parser_raw, { maxPayloadLength: 15 } );

		app.get( `/${name}`, ( event ) => {
			event.send( { body: event.body, rawBody: event.rawBody } );
		} );

		const responses	= [];

		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				'SomeRandomData',
				{ 'content-type': 'somethingDoesntMatter' },
				3902,
				JSON.stringify( { body: 'SomeRandomData', rawBody: 'SomeRandomData' } )
			)
		);

		// Returns 200 and an empty body due to limit reached
		responses.push(
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				200,
				'SomeRandomDataSomeRandomData',
				{ 'content-type': 'somethingDoesntMatter' },
				3902,
				JSON.stringify( { body: {}, rawBody: {} } )
			)
		);

		const server	= app.listen( 3902, () => {
			Promise.all( responses ).then(() => {
				setTimeout(() => {
					server.close();
					done();
				}, 500 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_logger',
	test	: ( done ) => {
		const name					= 'testErLogger';
		const relativeLogLocation	= './tests/server/fixture/logger/testLog.log';
		const fileTransport			= new File({
			logLevel	: Loggur.LOG_LEVELS.debug,
			filePath	: relativeLogLocation
		});

		const logger				= Loggur.createLogger({
			serverName	: 'Server.test_er_logger',
			logLevel	: Loggur.LOG_LEVELS.debug,
			capture		: false,
			transports	: [fileTransport]
		});

		const app		= new Server();

		assert.deepStrictEqual( app.Loggur, Loggur );

		app.apply( app.er_logger, { logger, attachToProcess: true } );

		app.get( `/${name}`, ( event ) => {
			if (
				typeof process.dumpStack !== 'function'
				|| typeof process.log !== 'function'
			) {
				event.sendError( 'Logger is not attached correctly', 500 );
			}

			process.dumpStack();
			process.log( 'TESTLOG' );

			event.emit( 'redirect', { redirectUrl: 'REDIRECT-LINK' } );
			event.emit( 'cachedResponse' );
			event.emit( 'stop' );
			event.emit( 'clearTimeout' );
			event.emit( 'on_error', new Error( 'error' ) );
			event.emit( 'error', new Error( 'normal error' ) );
			event.emit( 'error', 'NORMAL SIMPLE ERROR MESSAGE' );
			event.emit( 'on_error', 'SIMPLE ERROR MESSAGE' );

			event.setResponseHeader( 'key', 'value' );

			event.send( name );
		} );

		const server	= app.listen( 3336, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', { headerName: 'value' }, 3336 ).then(( response ) => {
				fileTransport.getWriteStream().end();
				setTimeout(() => {
					process.dumpStack	= undefined;
					process.log			= undefined;

					assert.equal( fs.existsSync( fileTransport.getFileName() ), true );
					assert.equal( fs.statSync( fileTransport.getFileName() ).size > 0, true );
					assert.equal( response.body.toString(), name );

					const logData	= fs.readFileSync( fileTransport.getFileName() );

					assert.equal( logData.includes( `GET /${name} 200` ), true );
					assert.equal( logData.includes( 'Event is cleaning up' ), true );
					assert.equal( logData.includes( 'Event finished' ), true );
					assert.equal( logData.includes( 'Server.test_er_logger/Master' ), true );
					assert.equal( logData.includes( 'Redirect to: REDIRECT-LINK' ), true );
					assert.equal( logData.includes( 'Response to' ), true );
					assert.equal( logData.includes( 'send from cache' ), true );
					assert.equal( logData.includes( 'Event stopped' ), true );
					assert.equal( logData.includes( 'Timeout cleared' ), true );
					assert.equal( logData.includes( 'Header set: key with value: value' ), true );
					assert.equal( logData.includes( 'Headers: ' ), true );
					assert.equal( logData.includes( 'Cookies: ' ), true );
					assert.equal( logData.includes( 'Error : SIMPLE ERROR MESSAGE' ), true );
					assert.equal( logData.includes( 'Error : NORMAL SIMPLE ERROR MESSAGE' ), true );
					assert.equal( logData.includes( 'Error : Error: error' ), true );
					assert.equal( logData.includes( 'Error : Error: normal error' ), true );
					assert.equal( logData.includes( 'at EventRequest._next' ), true );

					if ( fs.existsSync( fileTransport.getFileName() ) )
						fs.unlinkSync( fileTransport.getFileName() );

					server.close();
					done();
				}, 250 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_logger.when.user.agent.is.set',
	test	: ( done ) => {
		const name					= 'testErLogger';
		const relativeLogLocation	= './tests/server/fixture/logger/testLog.log';
		const fileTransport			= new File({
			logLevel	: Loggur.LOG_LEVELS.debug,
			filePath	: relativeLogLocation
		});

		const logger				= Loggur.createLogger({
			serverName	: 'Server.test_er_logger',
			logLevel	: Loggur.LOG_LEVELS.debug,
			capture		: false,
			transports	: [fileTransport]
		});

		const app		= new Server();

		assert.deepStrictEqual( app.Loggur, Loggur );

		app.apply( app.er_logger, { logger, attachToProcess: true } );

		app.get( `/${name}`, ( event ) => {
			if (
				typeof process.dumpStack !== 'function'
				|| typeof process.log !== 'function'
			) {
				event.sendError( 'Logger is not attached correctly', 500 );
			}

			process.dumpStack();
			process.log( 'TESTLOG' );

			event.emit( 'redirect', { redirectUrl: 'REDIRECT-LINK' } );
			event.emit( 'cachedResponse' );
			event.emit( 'stop' );
			event.emit( 'clearTimeout' );
			event.emit( 'on_error', new Error( 'error' ) );
			event.emit( 'error', new Error( 'normal error' ) );
			event.emit( 'error', 'NORMAL SIMPLE ERROR MESSAGE' );
			event.emit( 'on_error', 'SIMPLE ERROR MESSAGE' );

			event.setResponseHeader( 'key', 'value' );

			event.send( name );
		} );

		const server	= app.listen( 4310, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', { headerName: 'value', 'user-agent': 'someUserAgent' }, 4310 ).then(( response ) => {
				fileTransport.getWriteStream().end();
				setTimeout(() => {
					process.dumpStack	= undefined;
					process.log			= undefined;

					assert.equal( fs.existsSync( fileTransport.getFileName() ), true );
					assert.equal( fs.statSync( fileTransport.getFileName() ).size > 0, true );
					assert.equal( response.body.toString(), name );

					const logData	= fs.readFileSync( fileTransport.getFileName() );

					assert.equal( logData.includes( `GET /${name} 200` ), true );
					assert.equal( logData.includes( 'someUserAgent' ), true );
					assert.equal( logData.includes( 'Event is cleaning up' ), true );
					assert.equal( logData.includes( 'Event finished' ), true );
					assert.equal( logData.includes( 'Server.test_er_logger/Master' ), true );
					assert.equal( logData.includes( 'Redirect to: REDIRECT-LINK' ), true );
					assert.equal( logData.includes( 'Response to' ), true );
					assert.equal( logData.includes( 'send from cache' ), true );
					assert.equal( logData.includes( 'Event stopped' ), true );
					assert.equal( logData.includes( 'Timeout cleared' ), true );
					assert.equal( logData.includes( 'Header set: key with value: value' ), true );
					assert.equal( logData.includes( 'Headers: ' ), true );
					assert.equal( logData.includes( 'Cookies: ' ), true );
					assert.equal( logData.includes( 'Error : SIMPLE ERROR MESSAGE' ), true );
					assert.equal( logData.includes( 'Error : NORMAL SIMPLE ERROR MESSAGE' ), true );
					assert.equal( logData.includes( 'Error : Error: error' ), true );
					assert.equal( logData.includes( 'Error : Error: normal error' ), true );
					assert.equal( logData.includes( 'at EventRequest._next' ), true );

					if ( fs.existsSync( fileTransport.getFileName() ) )
						fs.unlinkSync( fileTransport.getFileName() );

					server.close();
					done();
				}, 250 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_logger.getLogger.returns.default.logger.if.none.specified',
	test	: ( done ) => {
		assert.deepStrictEqual( app.er_logger.getLogger(), Loggur.getDefaultLogger() );

		done();
	}
});

test({
	message	: 'Server.test er_response_cache caches',
	test	: ( done ) => {
		const name	= 'testErResponseCacheCaches';
		let i		= 0;

		if ( ! app.hasPlugin( app.er_response_cache ) )
		{
			app.apply( app.er_data_server, { dataServer: helpers.getDataServer() } );
			app.apply( app.er_response_cache );
		}

		app.get( `/${name}`, 'cache.request', ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name );
			}

			event.sendError( 'ERROR', 501 );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );

			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_response_cache does not cache if not needed',
	test	: ( done ) => {
		const name	= 'testErResponseCacheDoesNotCacheEverything';
		let i		= 0;

		if ( ! app.hasPlugin( app.er_response_cache ) )
		{
			app.apply( app.er_data_server, { dataServer: helpers.getDataServer() } );
			app.apply( app.er_response_cache );
		}

		app.get( `/${name}`, ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name );
			}

			event.sendError( 'ERROR', 501 );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );

			return helpers.sendServerRequest( `/${name}`, 'GET', 501 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'ERROR' } ) );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_response_cache does not cache raw',
	test	: ( done ) => {
		const name	= 'testErResponseCacheDoesNotCacheRaw';
		let i		= 0;

		if ( ! app.hasPlugin( app.er_response_cache ) )
		{
			app.apply( app.er_data_server, { dataServer: helpers.getDataServer() } );
			app.apply( app.er_response_cache );
		}

		app.get( `/${name}`, ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name, 200, true );
			}

			event.sendError( 'ERROR', 501 );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );

			return helpers.sendServerRequest( `/${name}`, 'GET', 501 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'ERROR' } ) );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_timeout.without.reaching.timeout',
	test	: ( done ) => {
		const body			= 'testTimeoutWithoutReachingTimeout';
		const timeout		= 100;
		let timeoutCalled	= 0;

		if ( ! app.hasPlugin( app.er_timeout ) )
			app.apply( app.er_timeout, { timeout } );

		app.add( ( event ) => {
				event.on( 'clearTimeout', () => {
					timeoutCalled++;
				});

				event.next();
			}
		);

		app.get( '/testTimeoutWithoutReachingTimeout', ( event ) => {
			event.send( body );
		} );

		helpers.sendServerRequest( '/testTimeoutWithoutReachingTimeout' ).then(( response ) => {
			assert.equal( response.body.toString(), body );
			assert.equal( timeoutCalled, 1 );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_timeout.with.reaching.timeout',
	test	: ( done ) => {
		const timeout	= 100;
		let timeoutCalled	= 0;

		if ( ! app.hasPlugin( app.er_timeout ) )
			app.apply( app.er_timeout, { timeout } );

		app.add({
			handler	: ( event ) => {
				event.on( 'clearTimeout', () => {
					timeoutCalled++;
				});

				event.next();
			}
		});

		app.get( '/testTimeoutWithReachingTimeout', ( event ) => {} );

		helpers.sendServerRequest( '/testTimeoutWithReachingTimeout', 'GET', 503 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: `Request timed out in: ${timeout/1000} seconds`} ) );
			assert.equal( timeoutCalled, 1 );

			app.add({
				handler	: ( event ) => {
					event.clearTimeout();
					event.next();
				}
			});

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_timeout.with.reaching.timeout.but.request.is.finished',
	test	: ( done ) => {
		const app			= new Server();
		const timeout		= 100;
		let timeoutCalled	= 0;

		if ( ! app.hasPlugin( app.er_timeout ) )
			app.apply( app.er_timeout, { timeout } );

		app.add({
			handler	: ( event ) => {
				event.on( 'clearTimeout', () => {
					timeoutCalled++;
				});

				event.finished	= true;

				// Expired but the timeout checked that the request was finished and did nothing;
				setTimeout(()=>{
					event.finished	= false;
					event.send( 'DONE' );
				}, 200 );
			}
		});

		app.get( '/testTimeoutWithReachingTimeout', ( event ) => {} );

		app.listen( 4400, () => {
			helpers.sendServerRequest( '/testTimeoutWithReachingTimeout', 'GET', 200, '', {}, 4400, 'DONE' ).then(( response ) => {
				assert.equal( timeoutCalled, 1 );
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_timeout.with.reaching.timeout.and.custom.callback',
	test	: ( done ) => {
		const timeout	= 100;
		let timeoutCalled	= 0;

		const app	= new Server();

		app.apply( app.er_timeout, { timeout, callback: ( event ) => { event.send( 'It is all good', 200 ) } } );

		app.add(
			( event ) => {
				event.on( 'clearTimeout', () => {
					timeoutCalled++;
				});

				event.next();
			}
		);

		app.get( '/testTimeoutWithReachingTimeoutAndCustomCallback', ( event ) => {} );

		app.listen( 4120, () => {
			helpers.sendServerRequest( '/testTimeoutWithReachingTimeoutAndCustomCallback', 'GET', 200, '', {}, 4120, 'It is all good'  ).then(( response ) => {
				assert.equal( timeoutCalled, 1 );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_env.getEnvFileAbsPath',
	test	: ( done ) => {
		assert.deepStrictEqual( app.er_env.getEnvFileAbsPath(), path.join( path.parse( require.main.filename ).dir, '.env' ) );

		done();
	}
});

test({
	message	: 'Server.test er_env attaches environment variables to process',
	test	: ( done ) => {
		const name			= 'testErEnvAttachesVariablesToProcess';
		const fileLocation	= path.join( __dirname, './fixture/.env' );
		app.apply( app.er_env, { fileLocation } );

		assert.equal( process.env.TESTKEY, 'TESTVALUE' );

		app.get( `/${name}`, ( event ) => {
			assert.equal( process.env.TESTKEY, 'TESTVALUE' );
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_env.attaches.environment.variables.to.process.when.changed',
	test	: ( done ) => {
		const fileLocation	= path.join( __dirname, './fixture/.env' );
		app.apply( app.er_env, { fileLocation } );

		assert.equal( process.env.TESTKEY, 'TESTVALUE' );

		fs.writeFileSync( fileLocation, 'TESTKEY=TESTVALUE2' )

		setTimeout(()=>{
			assert.equal( process.env.TESTKEY, 'TESTVALUE2' );
			fs.writeFileSync( fileLocation, 'TESTKEY=TESTVALUE' )
			setTimeout(()=>{
				done();
			}, 100 );
		}, 200 );
	}
});

test({
	message	: 'Server.test.er_env.if.file.not.exists',
	test	: ( done ) => {
		const fileLocation	= path.join( __dirname, './fixture/.envNotExisting' );

		assert.throws(() => {
			app.apply( app.er_env, { fileLocation } );
		});

		done();
	}
});

test({
	message	: 'Server.test.er_env.defaults',
	test	: ( done ) => {

		assert.throws(() => {
			app.apply( app.er_env );
		});

		done();
	}
});

test({
	message	: 'Server.test er_rate_limits does not die without any parameters',
	test	: ( done ) => {
		const name			= 'testErRateLimitsDoesNotDie';
		const fileLocation	= path.join( __dirname, './../../rate_limits.json' );

		const app			= new Server();
		const server		= http.createServer( app.attach() );

		app.apply( app.er_rate_limits );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		server.listen( 3334, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 3334 ).then(( response ) => {
				setTimeout(() => {
					server.close();
					assert.equal( response.body.toString(), name );
					assert.equal( fs.existsSync( fileLocation ), false );
					done();
				}, 200 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.when.using.file.and.file.does.not.exist',
	test	: ( done ) => {
		const name			= 'testErRateLimitsUsingFileCreatesFile';
		const fileLocation	= path.join( __dirname, './fixture/er_rate_limits_when_file_does_not_exist.json' );

		if ( fs.existsSync( fileLocation ) )
			fs.unlinkSync( fileLocation );

		const app			= new Server();

		app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		app.listen( 4330, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4330 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( fs.existsSync( fileLocation ), true );

				fs.unlinkSync( fileLocation );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_rate_limits.when.using.file.and.json.is.invalid',
	test	: ( done ) => {
		const name			= 'testErRateLimitsUsingFileInvalidJson';
		const fileLocation	= path.join( __dirname, './fixture/er_rate_limits_invalid_json.json' );
		const app			= new Server();

		app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			assert.deepStrictEqual( app.er_rate_limits.rules, [{
				path: '',
				methods: [],
				maxAmount: 10000,
				refillTime: 10,
				refillAmount: 1000,
				policy: 'connection_delay',
				delayTime: 3,
				delayRetries: 5,
				stopPropagation: false,
				ipLimit: false
			}] );

			event.send( name );
		} );

		app.listen( 4331, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4331 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( fs.existsSync( fileLocation ), true );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_rate_limits.when.using.file.and.file.is.empty',
	test	: ( done ) => {
		const name			= 'testErRateLimitsUsingFileEmptyFile';
		const fileLocation	= path.join( __dirname, './fixture/er_rate_limits_empty.json' );
		const app			= new Server();

		app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			assert.deepStrictEqual( app.er_rate_limits.rules, [{
				path: '',
				methods: [],
				maxAmount: 10000,
				refillTime: 10,
				refillAmount: 1000,
				policy: 'connection_delay',
				delayTime: 3,
				delayRetries: 5,
				stopPropagation: false,
				ipLimit: false
			}] );

			event.send( name );
		} );

		app.listen( 4332, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4332 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( fs.existsSync( fileLocation ), true );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test er_rate_limits with rules in an array instead of json',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithRulesInAnArray';

		const app			= new Server();
		const server		= http.createServer( app.attach() );

		const rule			= {
			"path":`/${name}`,
			"methods":['GET'],
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict',
			"delayTime": 3,
			"delayRetries": 5,
			"stopPropagation": false,
			"ipLimit": false
		};

		app.apply( app.er_rate_limits, { rules: [rule] } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		server.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				setTimeout(() => {
					server.close();
					assert.equal( response.body.toString(), '{"error":"Too many requests"}' );
					done();
				}, 200 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.sanitize.config.on.default',
	test	: ( done ) => {
		const app	= new Server();

		app.er_rate_limits.sanitizeConfig();

		assert.deepStrictEqual( app.er_rate_limits.rules, [] );

		done();
	}
});

test({
	message	: 'Server.test.er_rate_limits.validate.rule.if.rule.is.invalid',
	test	: ( done ) => {
		const app	= new Server();

		assert.throws(() => {
			app.er_rate_limits.validateRule( {} );
		});

		done();
	}
});

test({
	message	: 'Server.test.er_rate_limits.validate.rule.if.connection_delay_rule.is.invalid',
	test	: ( done ) => {
		const app	= new Server();

		assert.throws(() => {
			app.er_rate_limits.validateRule( {
				path: '',
				methods: [],
				maxAmount: 10000,
				refillTime: 10,
				refillAmount: 1000,
				policy: 'connection_delay',
				delayTime: 3,
				stopPropagation: false,
				ipLimit: false
			} );
		});

		assert.throws(() => {
			app.er_rate_limits.validateRule( {
				path: '',
				methods: [],
				maxAmount: 10000,
				refillTime: 10,
				refillAmount: 1000,
				policy: 'connection_delay',
				delayRetries: 3,
				stopPropagation: false,
				ipLimit: false
			} );
		});

		done();
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.dynamic.middleware',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithDynamicGlobalMiddleware';

		const app			= new Server();
		const server		= http.createServer( app.attach() );

		const rule			= {
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict',
			"delayTime": 3,
			"delayRetries": 5
		};

		app.get( `/${name}`, app.er_rate_limits.rateLimit( rule ), ( event ) => {
			event.send( name );
		});

		server.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				setTimeout(() => {
					server.close();
					assert.equal( response.body.toString(), '{"error":"Too many requests"}' );
					done();
				}, 200 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.dynamic.middleware.when.request.is.finished',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithDynamicGlobalMiddleware';
		const app			= new Server();

		const rule			= {
			"maxAmount":0,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict'
		};

		app.get( `/${name}`, async ( event ) => {
			event.finished	= true;

			// This never gets rate limited
			await app.er_rate_limits.rateLimit( rule )( event );

			setTimeout(() => {
				event.finished	= false;
				event.send( name );
			}, 100 );
		});

		app.listen( 4340, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4340, name ).then(() => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.two.dynamic.middlewares',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithTwoDynamicGlobalMiddleware';

		const app			= new Server();
		const server		= http.createServer( app.attach() );

		const rule			= {
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict'
		};

		const ruleTwo		= {
			"maxAmount":0,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'permissive'
		};

		app.apply( app.er_rate_limits );

		app.get( `/${name}`, [
			app.getPlugin( app.er_rate_limits ).rateLimit( ruleTwo ),
			app.getPlugin( app.er_rate_limits ).rateLimit( rule ),
		], ( event ) => {
			assert.deepStrictEqual( event.rateLimited, true );
			assert.deepStrictEqual( event.erRateLimitRules.length, 2 );
			event.send( name );
		} );

		server.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				setTimeout(() => {
					server.close();
					assert.equal( response.body.toString(), '{"error":"Too many requests"}' );
					done();
				}, 200 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.dynamic.middleware.ignores.path.and.methods',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithDynamicGlobalMiddlewareIgnoresPathAndMethods';

		const app			= new Server();
		const server		= http.createServer( app.attach() );

		const rule			= {
			"path": ['wrong', 123],
			"methods": 123,
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict',
			"delayTime": 3,
			"delayRetries": 5,
			"stopPropagation": false,
			"ipLimit": false
		};

		app.apply( app.er_rate_limits );

		app.get( `/${name}`, app.getPlugin( app.er_rate_limits ).rateLimit( rule ), ( event ) => {
			event.send( name );
		} );

		server.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				setTimeout(() => {
					server.close();
					assert.equal( response.body.toString(), '{"error":"Too many requests"}' );
					done();
				}, 200 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.bucket.works.cross.apps',
	test	: ( done ) => {
		const dataStore	= new DataServer( { persist: false, ttl: 90000 } );

		const appOne	= new Server();
		const appTwo	= new Server();

		const name			= 'testErRateLimitsBucketWorksCrossApps';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		appOne.apply( new RateLimitsPlugin( 'rate_limits' ), { fileLocation, dataStore, useFile: true } );
		appTwo.apply( new RateLimitsPlugin( 'rate_limits' ), { fileLocation, dataStore, useFile: true } );

		appOne.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		appTwo.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		appOne.listen( 3360 );
		appTwo.listen( 3361 );

		setTimeout(() => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 3360 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 3361 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), JSON.stringify( { error: 'Too many requests' } ) );
				done();
			}).catch( done );
		}, 100 );
	}
});

test({
	message	: 'Server.test er_rate_limits.with.params',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithParams';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}/:test:`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}/testTwo`, 'GET', 200, '', {} ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}/testTwo`, 'GET', 429, '', {} );
		}).then( () => { done(); } ).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.permissive.limiting',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithPermissiveLimiting';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );
		let called			= 0;

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			called ++;

			if ( called > 1 )
			{
				assert.equal( event.rateLimited, true );
			}
			else
			{
				assert.equal( event.rateLimited, false );
			}

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.permissive.limiting.refills',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithPermissiveLimitingRefills';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			assert.equal( event.rateLimited, false );
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			setTimeout(() => {
				helpers.sendServerRequest( `/${name}` ).then(( response ) => {
					assert.equal( response.body.toString(), name );
					done();
				}).catch( done )
			}, 1000 );
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limits with connection delay policy limiting',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithConnectionDelayPolicy';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );
		const now			= Math.floor( new Date().getTime() / 1000 );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( ( Math.floor( new Date().getTime() / 1000 ) - now ) >= 2, true );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.two.connection.delay.policy.limiting',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithTwoConnectionDelayPolicy';
		const now			= Math.floor( new Date().getTime() / 1000 );
		const app			= new Server();

		app.apply( app.er_rate_limits, { rules: [
					{
						"path": "/testErRateLimitsWithTwoConnectionDelayPolicy",
						"methods": [],
						"maxAmount": 1,
						"refillTime": 1,
						"refillAmount": 1,
						"policy": "connection_delay",
						"delayTime": 1,
						"delayRetries": 10,
						"stopPropagation": false,
						"ipLimit": false
					},
					{
						path: /\/[\S]+/,
						"methods": [],
						"maxAmount": 1,
						"refillTime": 3,
						"refillAmount": 1,
						"policy": "connection_delay",
						"delayTime": 1,
						"delayRetries": 10,
						"stopPropagation": false,
						"ipLimit": false
					}
				]
			}
		);

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		app.listen( 4350, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4350 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4350 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( ( Math.floor( new Date().getTime() / 1000 ) - now ) >= 3, true );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test er_rate_limits with strict policy',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithStrictPolicy';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'Too many requests' } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limitsSTRESS with strict policy STRESS',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithStrictPolicyStress';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		const promises	= [];

		for ( let i = 0; i < 100; i ++ )
		{
			promises.push( helpers.sendServerRequest( `/${name}` ) );
		}

		setTimeout(() => {
			for ( let i = 0; i < 50; i ++ )
			{
				promises.push( helpers.sendServerRequest( `/${name}` ) );
			}

			Promise.all( promises).then(() => {
				done();
			}).catch( done );
		}, 2100 );
	}
});

test({
	message	: 'Server.test er_rate_limits with specified methods matches',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithStrictPolicyWithSpecifiedMethods';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'Too many requests' } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limits with multiple specified methods matches',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithStrictPolicyWithMultipleSpecifiedMethods';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'Too many requests' } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limits with specified methods does not match if method is not the same',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithStrictPolicyWithSpecifiedMethodsThatDoNotMatch';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limits with stopPropagation',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithPropagation';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );
		let called			= 0;

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			called ++;

			if ( called > 1 )
			{
				assert.equal( event.rateLimited, true );
			}
			else
			{
				assert.equal( event.rateLimited, false );
			}

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 200 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limits with multiple rules',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithMultipleRules';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'Too many requests' } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limits strict overrides connection delay',
	test	: ( done ) => {
		const name			= 'testErRateLimitsStrictOverridesConnectionDelayPolicy';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'Too many requests' } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limits connection delay overrides permissive',
	test	: ( done ) => {
		const name			= 'testErRateLimitsConnectionDelayOverridesPermissivePolicy';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_rate_limits connection delay returns 429 if no more retries',
	test	: ( done ) => {
		const name			= 'testErRateLimitsConnectionDelayReturns429IfNoMoreRetries';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: 'Too many requests' } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.tester_rate_limits.with.strict.policy.with.ip.limit',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithStrictPolicyWithIpLimit';
		const fileLocation	= path.join( __dirname, './fixture/rate_limits.json' );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { fileLocation, useFile: true } );

		app.get( `/${name}`, ( event ) => {
			try
			{
				assert.notEqual(
					app.getPlugin( app.er_rate_limits ).dataStore.server['$LB:/testErRateLimitsWithStrictPolicyWithIpLimitstrict::ffff:127.0.0.1//value'],
					`/${name}` )
				;
			}
			catch ( e )
			{
				return done( 'er_rate_limits with ip limit did not return as expected' );
			}

			event.send( name );
		} );

		setTimeout(() => {
			helpers.sendServerRequest( `/${name}` ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), JSON.stringify( { error: 'Too many requests' } ) );
				done();
			}).catch( done );
		}, 50 );
	}
});

test({
	message	: 'Server.test.er_templating_engine.attaches.a.render.function.that.fetches.files',
	test	: ( done ) => {
		const name			= 'testTemplatingEngine';
		const deepName		= 'testTemplatingEngineDeep';
		const templateDir 	= path.join( __dirname, './fixture/templates' );
		let renderCalled	= 0;

		app.apply( app.er_templating_engine, { templateDir } );

		app.add({
			handler	: ( event ) => {
				event.on( 'render', () => {
					renderCalled++;
				} );

				event.next();
			}
		});

		app.get( `/${name}`, ( event ) => {
			event.render( 'index' );
		} );

		app.get( `/${deepName}`, ( event ) => {
			event.render( 'deep/directory/structure/file' );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString().includes( 'THIS_IS_THE_INDEX_HTML_FILE' ), true );
			assert.equal( response.headers['content-type'], 'text/html' );

			return helpers.sendServerRequest( `/${deepName}` );
		}).then(( response ) => {
			assert.equal( response.body.toString().includes( 'THIS_IS_THE_DEEP_HTML_FILE' ), true );
			assert.equal( response.headers['content-type'], 'text/html' );

			assert.equal( renderCalled, 2 );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_templating_engine.attaches.a.render.function.that.calls.next.on.error',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.render( 'fail' );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 500 ).then(( response ) => {
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_templating_engine.with.no.template.name.passed.gets.the.index.html',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const app			= new Server();
		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.render();
		});

		app.listen( 4321, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4321 ).then(( response ) => {
				assert.deepStrictEqual( response.body.toString(), fs.readFileSync( path.join( templateDir, 'index.html' ) ).toString() );
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_templating_engine.with.no.templateDir.uses.root.public.by.default',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const app			= new Server();
		const templateDir 	= path.join( __dirname, '../../public/test' );

		app.apply( app.er_templating_engine );

		app.get( `/${name}`, ( event ) => {
			event.render( '/test/index' );
		});

		app.listen( 4325, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4325 ).then(( response ) => {
				assert.deepStrictEqual( response.body.toString(), fs.readFileSync( path.join( templateDir, 'index.html' ) ).toString() );
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_templating_engine.render.when.is.finished',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const app			= new Server();
		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.finished	= true;
			event.render( null, {}, ( error )=>{
				event.finished	= false;
				event.send( error );
			});
		});

		app.listen( 4322, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4322, 'Error rendering' ).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_templating_engine.render.when.templating.engine.rejects',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const app			= new Server();
		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.templatingEngine	= {
				render	: () => {
					throw new Error( 'Could not render' )
				}
			}

			event.render( null, {}, ( error )=>{
				event.send( error.message );
			});
		});

		app.listen( 4323, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4323, 'Could not render' ).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_router.caches.correctly',
	test	: ( done ) => {
		const name	= 'testErRouterCaches';

		app.get( `/${name}/:id:`, ( event ) => {
			event.send( event.params );
		} );

		helpers.sendServerRequest( `/${name}/idOne` ).then(( response ) => {
			assert.equal( JSON.parse( response.body.toString() ).id, 'idOne' );
			return helpers.sendServerRequest( `/${name}/idTwo` );
		}).then(( response ) => {
			assert.equal( JSON.parse( response.body.toString() ).id, 'idTwo' );

			return helpers.sendServerRequest( `/${name}/idTwo` );
		}).then(( response ) => {
			assert.equal( JSON.parse( response.body.toString() ).id, 'idTwo' );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_session works as expected',
	test	: ( done ) => {
		const name	= 'testErSession';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server );
		app.apply( app.er_session );

		app.get( `/${name}`, ( event ) => {
			event.initSession( event.next ).catch( event.next );
		} );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false )
			{
				assert.throws(() => {
					session.get( 'authenticated' );
				});

				session.add( 'authenticated', true );
			}
			else
			{
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers['set-cookie'] !== 'undefined', true );

			const cookies	= {},
				rc		= response.headers['set-cookie'][0];

			rc && rc.split( ';' ).forEach( function( cookie ) {
				const parts						= cookie.split( '=' );
				cookies[parts.shift().trim()]	= decodeURI( parts.join( '=' ) );
			});

			assert.equal( typeof cookies.sid === 'string', true );

			const headers	= { cookie: `sid=${cookies.sid}`};

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.authenticated !== 'undefined', true );
			assert.equal( response.headers.authenticated, 1 );

			const headers	= { cookie: `sid=wrong`};

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.authenticated === 'undefined', true );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_session.works.as.expected.with.headers',
	test	: ( done ) => {
		const name	= 'testErSessionWithHeaders';

		assert.throws(() => {
			const appOne	= new Server();
			appOne.apply( appOne.er_session );
		});

		app.apply( app.er_data_server );
		app.apply( app.er_session, { isCookieSession: false } );

		app.get( `/${name}`, ( event ) => {
			event.initSession( event.next ).catch( event.next );
		} );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.session instanceof Session, true );
			const session	= event.session;

			if ( session.has( 'authenticated' ) === false )
			{
				assert.throws(() => {
					session.get( 'authenticated' );
				});

				session.add( 'authenticated', true );
			}
			else
			{
				assert.equal( session.get( 'authenticated' ), true );
				event.setResponseHeader( 'authenticated', 1 );
			}

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.sid !== 'undefined', true );

			const sid		= response.headers.sid;
			const headers	= { sid };

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );

			assert.equal( typeof response.headers.authenticated !== 'undefined', true );
			assert.equal( response.headers.authenticated, 1 );

			const headers	= { sid: 'wrong' };

			return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', headers );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( typeof response.headers.authenticated === 'undefined', true );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test er_data_server works as expected',
	test	: ( done ) => {
		const name			= 'testCacheServer';
		const secondName	= `/${name}Second`;
		const key			= `${name}_KEY`;
		const value			= `${name}_VALUE`;

		app.apply( app.er_data_server, { dataServerOptions: { persist: false } } );

		app.get( `/${name}`, async ( event ) => {
			assert.equal( event.dataServer instanceof DataServer, true );

			await event.dataServer.set( key, value ).catch( done );
			await event.dataServer.set( `${key}_delete`, value ).catch( done );

			await event.dataServer.delete( `${key}_delete` ).catch( done );

			event.send( name );
		});

		app.get( secondName, async ( event ) => {
			assert.equal( event.dataServer instanceof DataServer, true );

			const cacheValue	= await event.dataServer.get( key ).catch( done );

			assert.equal( cacheValue, value );
			assert.equal( await event.dataServer.get( `${key}_delete` ).catch( done ), null );

			event.send( secondName );
		});

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			return helpers.sendServerRequest( secondName );
		}).then(( response ) => {
			assert.equal( response.body.toString(), secondName );
			done();
		}).catch( done )
	}
});

test({
	message	: 'Server.test server does not export /public by default',
	test	: ( done ) => {
		helpers.sendServerRequest( `/public/test/index.html`, 'GET', 404 ).then(( response ) => {
			assert.equal( response.body.toString(), '{"error":"Cannot GET /public/test/index.html"}' );
			done();
		}).catch( done )
	}
});

test({
	message	: 'Server.test er_static_resources works as expected',
	test	: ( done ) => {
		app.apply( app.er_static_resources, { paths: ['tests/server/fixture/static'] } );

		helpers.sendServerRequest( `/tests/server/fixture/static/test_file.js` ).then(( response ) => {
			assert.equal( response.headers['content-type'], 'application/javascript' );
			assert.equal( response.body.toString(), 'const test=\'123\';' );

			return helpers.sendServerRequest( '/tests/server/fixture/static/test.css' );
		}).then(( response ) => {
			assert.equal( response.headers['content-type'], 'text/css' );
			assert.equal( response.body.toString(), 'body{background:black;}' );

			return helpers.sendServerRequest( '/tests/server/fixture/static/unknown_file.js', 'GET', 404 );
		}).then(( response ) => {
			assert.equal( response.body.toString().includes( 'File not found' ), true );

			done();
		}).catch( done )
	}
});

test({
	message	: 'Server.test.er_static_resources.works.as.expected.with.string',
	test	: ( done ) => {
		const app	= new Server();
		app.apply( app.er_static_resources, { paths: 'tests/server/fixture/static' } );


		app.listen( 4310, ()=>{
			helpers.sendServerRequest( `/tests/server/fixture/static/test_file.js`, 'GET', 200, '', {}, 4310 ).then(( response ) => {
				assert.equal( response.headers['content-type'], 'application/javascript' );
				assert.equal( response.body.toString(), 'const test=\'123\';' );

				return helpers.sendServerRequest( '/tests/server/fixture/static/test.css', 'GET', 200, '', {}, 4310 );
			}).then(( response ) => {
				assert.equal( response.headers['content-type'], 'text/css' );
				assert.equal( response.body.toString(), 'body{background:black;}' );

				return helpers.sendServerRequest( '/tests/server/fixture/static/unknown_file.js', 'GET', 404, '', {}, 4310 );
			}).then(( response ) => {
				assert.equal( response.body.toString().includes( 'File not found' ), true );

				done();
			}).catch( done )
		});
	}
});

test({
	message	: 'Server.test.er_static_resources.works.as.expected.with.default',
	test	: ( done ) => {
		const app	= new Server();
		app.apply( app.er_static_resources );

		app.listen( 4311, ()=>{
			helpers.sendServerRequest( `/public/test/index.css`, 'GET', 200, '', {}, 4311 ).then(( response ) => {
				assert.equal( response.body.toString().includes( 'body' ), true );

				return helpers.sendServerRequest( '/public/test/index.html', 'GET', 200, '', {}, 4311 );
			}).then(( response ) => {
				assert.equal( response.body.toString().includes( 'Hello World!' ), true );

				return helpers.sendServerRequest( '/tests/server/fixture/static/unknown_file.js', 'GET', 404, '', {}, 4311 );
			}).then(( response ) => {
				assert.equal( response.body.toString().includes( 'Cannot GET' ), true );

				done();
			}).catch( done )
		});
	}
});

test({
	message	: 'Server.test.er_file_stream.works.as.expected',
	test	: ( done ) => {
		app.apply( app.er_file_stream );

		app.get( '/testErFileStreamVideoWithRange', ( event ) => {
			if (
				event.getFileStream( path.join( __dirname, './fixture/file_streams/test.mp4' ) ) == null
				|| event.getFileStream( path.join( __dirname, './fixture/file_streams/test.unsupported' ) ) !== null
				|| event.response.getHeader( 'Content-Type' ) !== 'video/mp4'
				|| event.response.getHeader( 'Content-Range' ) == null
				|| event.response.getHeader( 'Content-Length' ) == null
				|| ! event.response.getHeader( 'Content-Range' ).includes( 'bytes' )
				|| event.response.getHeader( 'Accept-Ranges' ) !== 'bytes'
				|| event.response.statusCode !== 206
			) {
				return event.sendError( 'failed', 400 );
			}

			event.send( 'ok' ) ;
		});

		app.get( '/testErFileStreamVideoWithOutRange', ( event ) => {
			if (
				event.getFileStream( path.join( __dirname, './fixture/file_streams/test.mp4' ) ) == null
				|| event.getFileStream( path.join( __dirname, './fixture/file_streams/test.unsupported' ) ) !== null
				|| event.response.getHeader( 'Content-Type' ) !== 'video/mp4'
				|| event.response.getHeader( 'Content-Length' ) == null
				|| event.response.getHeader( 'Content-Range' ) != null
				|| event.response.getHeader( 'Accept-Ranges' ) != null
				|| event.response.statusCode !== 200
			) {
				return event.sendError( 'failed', 400 );
			}

			event.send( 'ok' ) ;
		});

		app.get( '/testErFileStreamAudioWithRange', ( event ) => {
			if (
				event.getFileStream( path.join( __dirname, './fixture/file_streams/test.mp3' ) ) == null
				|| event.response.getHeader( 'Content-Type' ) !== 'audio/mp3'
				|| event.response.getHeader( 'Content-Range' ) == null
				|| event.response.getHeader( 'Content-Length' ) == null
				|| ! event.response.getHeader( 'Content-Range' ).includes( 'bytes' )
				|| event.response.getHeader( 'Accept-Ranges' ) !== 'bytes'
				|| event.response.statusCode !== 206
			) {
				return event.sendError( 'failed', 400 );
			}

			event.send( 'ok' ) ;
		});

		app.get( '/testErFileStreamAudioWithOutRange', ( event ) => {
			if (
				event.getFileStream( path.join( __dirname, './fixture/file_streams/test.mp3' ) ) == null
				|| event.response.getHeader( 'Content-Type' ) !== 'audio/mp3'
				|| event.response.getHeader( 'Content-Length' ) == null
				|| event.response.getHeader( 'Content-Range' ) != null
				|| event.response.getHeader( 'Accept-Ranges' ) != null
				|| event.response.statusCode !== 200
			) {
				return event.sendError( 'failed', 400 );
			}

			event.send( 'ok' ) ;
		});

		app.get( '/testErFileStreamImage', ( event ) => {
			if (
				event.getFileStream( path.join( __dirname, './fixture/file_streams/image.webp' ) ) === null
				|| event.response.getHeader( 'Content-Length' ) != null
				|| event.response.getHeader( 'Content-Range' ) != null
				|| event.response.getHeader( 'Accept-Ranges' ) != null
				|| event.response.statusCode !== 200
			) {
				return event.sendError( 'failed', 400 );
			}

			event.send( 'ok' ) ;
		});

		app.get( '/testErFileStreamText', ( event ) => {
			if (
				event.getFileStream( path.join( __dirname, './fixture/file_streams/text.txt' ) ) === null
				|| event.response.getHeader( 'Content-Length' ) != null
				|| event.response.getHeader( 'Content-Range' ) != null
				|| event.response.getHeader( 'Accept-Ranges' ) != null
				|| event.response.statusCode !== 200
			) {
				return event.sendError( 'failed', 400 );
			}

			event.send( 'ok' ) ;
		});

		app.get( '/testErFileStreamWhenFileNotSupported', ( event ) => {
			event.streamFile( path.join( __dirname, './fixture/file_streams/test.unsupported' ) );
		});

		app.get( '/testErFileStreamWhenFileNotSupportedWithErrorCallback', ( event ) => {
			event.streamFile( path.join( __dirname, './fixture/file_streams/test.unsupported' ), undefined, () => {
				event.send( 'OK!' );
			});
		});

		app.get( '/testErFileStreamWhenFileSupported', ( event ) => {
			event.streamFile( path.join( __dirname, './fixture/file_streams/text.txt' ) );
		});

		const responses	= [];

		responses.push( helpers.sendServerRequest( `/testErFileStreamVideoWithRange`, 'GET', 206, '', { range: 'bytes=1-50'} ) );
		responses.push( helpers.sendServerRequest( `/testErFileStreamAudioWithRange`, 'GET', 206, '', { range: 'bytes=1-50'} ) );
		responses.push( helpers.sendServerRequest( `/testErFileStreamVideoWithOutRange` ) );
		responses.push( helpers.sendServerRequest( `/testErFileStreamAudioWithOutRange` ) );
		responses.push( helpers.sendServerRequest( `/testErFileStreamImage` ) );
		responses.push( helpers.sendServerRequest( `/testErFileStreamText` ) );
		responses.push(
			helpers.sendServerRequest(
				`/testErFileStreamWhenFileNotSupported`,
				'GET',
				400,
				'',
				{},
				3333,
				'{"error":"Could not find a FileStream that supports that format"}'
			)
		);
		responses.push(
			helpers.sendServerRequest(
				`/testErFileStreamWhenFileNotSupportedWithErrorCallback`,
				'GET',
				200,
				'',
				{},
				3333,
				'OK!'
			)
		);
		responses.push(
			helpers.sendServerRequest(
				`/testErFileStreamWhenFileSupported`,
				'GET',
				200,
				'',
				{},
				3333,
				'test'
			)
		);

		Promise.all( responses ).then( () => {
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test calling next twice does not die critically',
	test	: ( done ) => {
		const error	= 'An Error Has Occurred!';

		app.get( '/testCallingNextTwiceDoesNotDieCritically', ( event ) => {
			event.next( error );
			event.next();
		});

		helpers.sendServerRequest( `/testCallingNextTwiceDoesNotDieCritically`, 'GET', 500 ).then( ( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error } ) );
			done();
		} ).catch( done );
	}
});

test({
	message	: 'Server.testServerAddsXPoweredBy.does.not.anymore',
	test	: ( done ) => {
		app.get( '/textServerAddsXPoweredBy', event => event.send( 'ok' ) );

		helpers.sendServerRequest( `/textServerAddsXPoweredBy` ).then( ( response ) => {
			assert.equal( response.body.toString(), 'ok' );
			assert.equal( typeof response.headers['x-powered-by'] === 'undefined', true );

			done();
		} ).catch( done );
	}
});

test({
	message	: 'Server.testValidation',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate( { query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } } ),
			( event ) => {
			event.send( { query: event.query, body: event.body } );
		} );

		helpers.sendServerRequest(
			'/testValidation?testKey=50',
			'GET',
			200,
			JSON.stringify( { email: 'test@example.com' } ),
			{ 'content-type': 'application/json' },
			4110
		).then(( response ) => {
			assert.deepStrictEqual(
				JSON.parse( response.body.toString() ),
				{ query: { testKey: 50 }, body: { email: 'test@example.com' } }
			);
			done();
		}).catch( done );

		app.listen( 4110 );
	}
});

test({
	message	: 'Server.testValidation.when.validation.fails',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate( { query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } } ),
			( event ) => {
			event.send( { query: event.query, body: event.body } );
		} );

		helpers.sendServerRequest(
			'/testValidation?testKey=50',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4111
		).then(( response ) => {
			assert.deepStrictEqual(
				JSON.parse( response.body.toString() ),
				{ body: { email: ['email'] } }
			);
			done();
		}).catch( done );

		app.listen( 4111 );
	}
});

test({
	message	: 'Server.testValidation.when.validation.fails.returns.first.only',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate( { query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } } ),
			( event ) => {
			event.send( { query: event.query, body: event.body } );
		} );

		helpers.sendServerRequest(
			'/testValidation?testKey=test',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4112
		).then(( response ) => {
			assert.deepStrictEqual(
				JSON.parse( response.body.toString() ),
				{ query: { testKey: ['numeric'] } }
			);
			done();
		}).catch( done );

		app.listen( 4112 );
	}
});

test({
	message	: 'Server.testValidation.when.custom.error.callback',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate(
				{ query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } },
				( event, validationParameter, validationResult ) => {

					assert.deepStrictEqual( validationParameter, 'query' );
					assert.deepStrictEqual( validationResult.getValidationResult(), { testKey: ['numeric'] } );

					event.send( 'ok' );
				}
			),
			( event ) => {
				event.next( 'Error!' );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=test',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4113
		).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'ok'
			);
			done();
		}).catch( done );

		app.listen( 4113 );
	}
});

test({
	message	: 'Server.testValidation.when.default.error.callback',
	test	: ( done ) => {
		const app	= new Server();

		app.apply(
			app.er_validation,
			{
				failureCallback: ( event, validationParameter, validationResult ) => {
					assert.deepStrictEqual( validationParameter, 'query' );
					assert.deepStrictEqual( validationResult.getValidationResult(), { testKey: ['numeric'] } );

					event.send( 'ok' );
				}
			}
		);
		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate(
				{ query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } }
			),
			( event ) => {
				event.next( 'Error!' );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=test',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4114
		).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'ok'
			);
			done();
		}).catch( done );

		app.listen( 4114 );
	}
});

test({
	message	: 'Server.testValidation.when.custom.error.callback.and.default.error.callback',
	test	: ( done ) => {
		const app	= new Server();

		app.apply(
			app.er_validation,
			{
				failureCallback: ( event ) => {
					event.next( 'Error!' );
				}
			}
		);
		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate(
				{ query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } },
				( event, validationParameter, validationResult ) => {

					assert.deepStrictEqual( validationParameter, 'query' );
					assert.deepStrictEqual( validationResult.getValidationResult(), { testKey: ['numeric'] } );

					event.send( 'ok' );
				}
			),
			( event ) => {
				event.next( 'Error!' );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=test',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4115
		).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'ok'
			);
			done();
		}).catch( done );

		app.listen( 4115 );
	}
});

test({
	message	: 'Server.attach.when.request.close.is.called.twice.does.not.throw',
	test	: ( done ) => {
		const app	= new Server();
		let called	= 0;

		app.get( '/testCloseTwice', ( event ) => {
			const request	= event.request;

			event.on( 'cleanUp',() => {
				called	++;
			});

			event.send( '' );

			request.emit( 'close' )
		});

		helpers.sendServerRequest(
			'/testCloseTwice',
			'GET',
			200,
			'',
			{},
			4210
		).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), '' );
			setTimeout(()=>{
				called === 1 ? done() : done( 'cleanUp was called more than once' );
			}, 25 );
		}).catch( done );

		app.listen( 4210 );
	}
});

test({
	message	: 'Server.add.route.without.a.handler',
	test	: ( done ) => {
		const app	= new Server();

		Loggur.loggers	= {};
		Loggur.disableDefault();

		app.add( {} );

		app.get( '/testAddRouteWithoutAHandler', ( event ) => {
			event.send( '' );
		});

		helpers.sendServerRequest(
			'/testAddRouteWithoutAHandler',
			'GET',
			200,
			'',
			{},
			4220
		).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), '' );
			done();
		}).catch( done );

		app.listen( 4220 );
	}
});

test({
	message	: 'Server.eventRequest.on.error.without.a.logger',
	test	: ( done ) => {
		const app	= new Server();

		Loggur.disableDefault();
		Loggur.loggers	= {};

		app.get( '/eventRequestOnErrorWithoutALogger', ( event ) => {
			// This will call the Loggur.log ( cannot be mocked ) But it is called since there is no throw
			event.emit( 'on_error', 'ERROR!' );

			setImmediate(()=>{
				event.send( 'ERROR!' );
			});
		});

		helpers.sendServerRequest(
			'/eventRequestOnErrorWithoutALogger',
			'GET',
			200,
			'',
			{},
			4212
		).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), 'ERROR!' );
			done();
		}).catch( done );

		app.listen( 4212 );
	}
});

test({
	message	: 'Server.eventRequest.on.error.with.a.logger',
	test	: ( done ) => {
		const app			= new Server();
		const MockLogger	= new Mock( Logger );

		app.get( '/eventRequestOnErrorWithALogger', ( event ) => {
			event.logger	= new MockLogger( {}, 'uniqueId' );

			// This will also do nothing as the on( 'error' ) is meant to be called ONLY in case the logging plugin is not attached
			event.emit( 'on_error', '' );

			setImmediate(()=>{
				event.send( 'ERRORx2!' );
			});
		});

		helpers.sendServerRequest(
			'/eventRequestOnErrorWithALogger',
			'GET',
			200,
			'',
			{},
			4213
		).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), 'ERRORx2!' );
			done();
		}).catch( done );

		app.listen( 4213 );
	}
});

test({
	message	: 'Server.attach.when.there.is.an.error',
	test	: ( done ) => {
		const app			= new Server();
		const MockRouter	= Mock( Router );
		app.router			= new MockRouter();

		app.router._mock({
			method			: 'getExecutionBlockForCurrentEvent',
			shouldReturn	: ()=>{
				throw new Error( 'Error has occured!' );
			}
		});

		helpers.sendServerRequest(
			'/',
			'GET',
			500,
			'',
			{},
			4215
		).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), '{"error":"Error has occured!"}' );
			done();
		}).catch( done );

		app.listen( 4215 );
	}
});

test({
	message	: 'Server.attach.when.there.is.an.error.and.response.is.finished',
	test	: ( done ) => {
		const app			= new Server();
		const MockRouter	= Mock( Router );
		app.router			= new MockRouter();

		app.router._mock({
			method			: 'getExecutionBlockForCurrentEvent',
			shouldReturn	: ( eventRequest )=>{
				eventRequest.isFinished	= ()=>{ return true };

				setTimeout(()=>{
					eventRequest.response.end( 'No Error' )
				});

				throw new Error( 'Error has occured!' );
			}
		});

		helpers.sendServerRequest(
			'/',
			'GET',
			200,
			'',
			{},
			4214
		).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), 'No Error' );
			done();
		}).catch( done );

		app.listen( 4214 );
	}
});

test({
	message	: 'Server.attach.when.response.error.is.called.twice.does.not.throw',
	test	: ( done ) => {
		const app	= new Server();
		let called	= 0;

		app.get( '/testResponseErrorTwice', ( event ) => {
			const response	= event.response;

			event.on( 'cleanUp',() => {
				called	++;
			});

			event.send( '' );

			response.emit( 'error' );
			response.emit( 'error' );
		});

		helpers.sendServerRequest(
			'/testResponseErrorTwice',
			'GET',
			200,
			'',
			{},
			4216
		).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), '' );
			setTimeout(()=>{
				called === 1 ? done() : done( 'cleanUp was called more than once' );
			}, 25 );
		}).catch( done );

		app.listen( 4216 );
	}
});

test({
	message	: 'Server.testGlobalMiddlewaresWithFunctions',
	test	: ( done ) => {

		const setHeader	= function( key, value )
		{
			return ( event ) => {
				event.setResponseHeader( key, value );
				event.next();
			}
		};

		const setStatus	= function( status )
		{
			return ( event ) => {
				event.setStatusCode( status );
				event.next();
			}
		};

		const app	= new App.Server();

		app.define( 'setHeader', ( event ) => {
			event.setResponseHeader( 'globalMiddleware', 'value' );
			event.next();
		});

		app.define( '/setHeader', ( event ) => {
			event.setResponseHeader( 'globalMiddlewareTwo', 'value' );
			event.next();
		});

		app.get( '/testOne', setHeader( 'testOne', 'value' ), ( event ) => {
			event.send( 'ok' );
		});

		app.get( '/testTwo', 'setHeader', ( event ) => {
			event.send( 'ok' );
		});

		app.get( '/testThree', [setStatus(403), setHeader( 'testThree', 'value' )], ( event ) => {
			event.send( 'ok' );
		});

		app.get( '/testFour', [setStatus(400), 'setHeader'], ( event ) => {
			event.send( 'ok' );
		});

		app.get( ['setHeader', setHeader( 'testFive', 'value' )], ( event ) => {
			event.send( 'ok' );
		});

		// This will NOT activate the global middleware but be a route
		app.get( '/setHeader', ( event ) => {
			event.send( 'ok' );
		});

		app.listen( 4100 );

		const promises	= [];

		promises.push( helpers.sendServerRequest( '/testOne', 'GET', 200, '', {}, 4100, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.testone === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testTwo', 'GET', 200, '', {}, 4100, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testThree', 'GET', 403, '', {}, 4100, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.testthree === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testFour', 'GET', 400, '', {}, 4100, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testFiveThisDoesNotMatter', 'GET', 200, '', {}, 4100, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
			assert.equal( response.headers.testfive === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/setHeader', 'GET', 200, '', {}, 4100, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
			assert.equal( typeof response.headers.globalMiddlewaretwo === 'undefined', true );
		}) );

		Promise.all( promises ).then( () => { done(); } ).catch( done );
	}
});

test({
	message	: 'Server.testGlobalMiddlewaresFromAnotherRouter',
	test	: ( done ) => {

		const setHeader	= function( key, value )
		{
			return ( event ) => {
				event.setResponseHeader( key, value );
				event.next();
			}
		};

		const setStatus	= function( status )
		{
			return ( event ) => {
				event.setStatusCode( status );
				event.next();
			}
		};

		const app		= new App.Server();
		const routerOne	= app.Router();

		routerOne.define( 'setHeader', ( event ) => {
			event.setResponseHeader( 'globalMiddleware', 'value' );
			event.next();
		});

		routerOne.get( '/testOne', setHeader( 'testOne', 'value' ), ( event ) => {
			event.send( 'ok' );
		});

		routerOne.get( '/testTwo', 'setHeader', ( event ) => {
			event.send( 'ok' );
		});

		routerOne.get( '/testThree', [setStatus(404), setHeader( 'testThree', 'value' )], ( event ) => {
			event.send( 'ok' );
		});

		routerOne.get( '/testFour', [setStatus(400), 'setHeader'], ( event ) => {
			event.send( 'ok' );
		});

		routerOne.get( ['setHeader', setHeader( 'testFive', 'value' )], ( event ) => {
			event.send( 'ok' );
		});

		app.add( routerOne );

		app.listen( 4102 );

		const promises	= [];

		promises.push( helpers.sendServerRequest( '/testOne', 'GET', 200, '', {}, 4102, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.testone === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testTwo', 'GET', 200, '', {}, 4102, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testThree', 'GET', 404, '', {}, 4102, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.testthree === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testFour', 'GET', 400, '', {}, 4102, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testFiveThisDoesNotMatter', 'GET', 200, '', {}, 4102, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
			assert.equal( response.headers.testfive === 'value', true );
		}) );

		Promise.all( promises ).then( () => { done(); } ).catch( done );
	}
});

test({
	message	: 'Server.testGlobalMiddlewaresFromAnotherRouterMixed',
	test	: ( done ) => {

		const setHeader	= function( key, value )
		{
			return ( event ) => {
				event.setResponseHeader( key, value );
				event.next();
			}
		};

		const setStatus	= function( status )
		{
			return ( event ) => {
				event.setStatusCode( status );
				event.next();
			}
		}

		const app		= new App.Server();
		const routerOne	= app.Router();

		app.define( 'setHeader', ( event ) => {
			event.setResponseHeader( 'globalMiddleware', 'value' );
			event.next();
		});

		app.get( '/testOne', setHeader( 'testOne', 'value' ), ( event ) => {
			event.send( 'ok' );
		});

		routerOne.get( '/testTwo', 'setHeader', ( event ) => {
			event.send( 'ok' );
		});

		app.get( '/testThree', [setStatus(404), setHeader( 'testThree', 'value' )], ( event ) => {
			event.send( 'ok' );
		});

		routerOne.get( '/testFour', [setStatus(400), 'setHeader'], ( event ) => {
			event.send( 'ok' );
		});

		routerOne.get( ['setHeader', setHeader( 'testFive', 'value' )], ( event ) => {
			event.send( 'ok' );
		});

		app.add( routerOne );

		app.listen( 4103 );

		const promises	= [];

		promises.push( helpers.sendServerRequest( '/testOne', 'GET', 200, '', {}, 4103, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.testone === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testTwo', 'GET', 200, '', {}, 4103, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testThree', 'GET', 404, '', {}, 4103, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.testthree === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testFour', 'GET', 400, '', {}, 4103, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testFiveThisDoesNotMatter', 'GET', 200, '', {}, 4103, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
			assert.equal( response.headers.testfive === 'value', true );
		}) );

		Promise.all( promises ).then( () => { done(); } ).catch( done );
	}
});

test({
	message	: 'Server.testGlobalMiddlewaresWithFunctionsWithAdd',
	test	: ( done ) => {

		const setHeader	= function( key, value )
		{
			return ( event ) => {
				event.setResponseHeader( key, value );
				event.next();
			}
		}

		const setStatus	= function( status )
		{
			return ( event ) => {
				event.setStatusCode( status );
				event.next();
			}
		};

		const app	= new App.Server();

		app.define( 'setHeader', ( event ) => {
			event.setResponseHeader( 'globalMiddleware', 'value' );
			event.next();
		});

		app.add({
			method		: 'GET',
			route		: '/testOne',
			handler		: ( event ) => {
				event.send( 'ok' );
			},
			middlewares	: setHeader( 'testOne', 'value' )
		});

		app.add({
			method		: 'GET',
			route		: '/testTwo',
			handler		: ( event ) => {
				event.send( 'ok' );
			},
			middlewares	: 'setHeader'
		});

		app.add({
			method		: 'GET',
			route		: '/testThree',
			handler		: ( event ) => {
				event.send( 'ok' );
			},
			middlewares	: [setStatus(404), setHeader( 'testThree', 'value' )]
		});

		app.add({
			method		: 'GET',
			route		: '/testFour',
			handler		: ( event ) => {
				event.send( 'ok' );
			},
			middlewares	: [setStatus(400), 'setHeader']
		});

		app.listen( 4101 );

		const promises	= [];

		promises.push( helpers.sendServerRequest( '/testOne', 'GET', 200, '', {}, 4101, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.testone === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testTwo', 'GET', 200, '', {}, 4101, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testThree', 'GET', 404, '', {}, 4101, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.testthree === 'value', true );
		}) );

		promises.push( helpers.sendServerRequest( '/testFour', 'GET', 400, '', {}, 4101, 'ok' ).then(( response ) => {
			assert.equal( typeof response.headers === 'object', true );
			assert.equal( response.headers.globalmiddleware === 'value', true );
		}) );

		Promise.all( promises ).then( () => { done(); } ).catch( done );
	}
});

test({
	message	: 'Server.testErCors',
	test	: ( done ) => {
		app.apply( app.er_cors, {
			origin: 'http://example.com',
			methods: ['GET', 'POST'],
			headers: ['Accepts', 'X-Requested-With'],
			exposedHeaders: ['Accepts'],
			status: 200,
			maxAge: 200,
			credentials: true,
		});

		app.get( '/testErCors', ( event ) => {
			event.send( 'ok' );
		});

		helpers.sendServerRequest( `/testErCors` ).then( ( response ) => {
			assert.equal( response.headers['access-control-allow-origin'], 'http://example.com' );
			assert.equal( response.headers['access-control-allow-headers'], 'Accepts, X-Requested-With' );
			assert.equal( response.headers['access-control-expose-headers'], 'Accepts' );
			assert.equal( response.headers['access-control-max-age'], '200' );
			assert.equal( response.headers['access-control-allow-credentials'], 'true' );
			assert.equal( response.headers['access-control-allow-methods'], undefined );
		} ).then(() => {
			return helpers.sendServerRequest( `/testErCors`, 'options' ).then( ( response ) => {
				assert.equal( response.headers['access-control-allow-origin'], 'http://example.com' );
				assert.equal( response.headers['access-control-allow-headers'], 'Accepts, X-Requested-With' );
				assert.equal( response.headers['access-control-expose-headers'], 'Accepts' );
				assert.equal( response.headers['access-control-max-age'], '200' );
				assert.equal( response.headers['access-control-allow-credentials'], 'true' );
				assert.equal( response.headers['access-control-allow-methods'], 'GET, POST' );
				done();
			});
		}).catch( done );
	}
});

test({
	message	: 'Server.testErCorsWithErrors',
	test	: ( done ) => {
		app.apply( app.er_cors, {
			origin: 10,
			methods: 'GET',
			headers: 'Accepts',
			exposedHeaders: 12,
			status: 'test',
			maxAge: '200',
			credentials: null,
		});

		app.get( '/testErCorsWithErrors', ( event ) => {
			event.send( 'ok' );
		});

		helpers.sendServerRequest( `/testErCors`, 'GET', 200 ).then( ( response ) => {
			assert.equal( response.headers['access-control-allow-origin'], '*' );
			assert.equal( response.headers['access-control-allow-headers'], '*' );
			assert.equal( response.headers['access-control-expose-headers'], undefined );
			assert.equal( response.headers['access-control-max-age'], undefined );
			assert.equal( response.headers['access-control-allow-credentials'], undefined );
			assert.equal( response.headers['access-control-allow-methods'], undefined );
		} ).then(() => {
			return helpers.sendServerRequest( `/testErCors`, 'options', 204 ).then( ( response ) => {
				assert.equal( response.headers['access-control-allow-origin'], '*' );
				assert.equal( response.headers['access-control-allow-headers'], '*' );
				assert.equal( response.headers['access-control-expose-headers'], undefined );
				assert.equal( response.headers['access-control-max-age'], undefined );
				assert.equal( response.headers['access-control-allow-credentials'], undefined );
				assert.equal( response.headers['access-control-allow-methods'], 'POST, PUT, GET, DELETE, HEAD, PATCH, COPY' );
				done();
			});
		}).catch( done );
	}
});
