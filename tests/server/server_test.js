'use strict';

// Dependencies
const { assert, test, helpers, Mock }		= require( '../test_helper' );
const path									= require( 'path' );
const http									= require( 'http' );
const fs									= require( 'fs' );
const { Loggur, Logger, File, LOG_LEVELS }	= require( './../../server/components/logger/loggur' );
const Router								= require( './../../server/components/routing/router' );
const DataServer							= require( './../../server/components/caching/data_server' );
const DataServerMap							= require( './../../server/components/caching/data_server_map' );
const PluginManager							= require( './../../server/plugins/plugin_manager' );

const { App, Server }						= require( './../../index' );
const app									= App();

test({
	message	: 'Server.constructor.starts.without.crashing.with.defaults',
	test	: ( done ) => {
		assert.doesNotThrow( () => {
			const server	= new Server();

			assert.equal( 1, server.router.middleware.length );
		});
		done();
	}
});

test({
	message	: 'Server.App.Returns.the.same.as.App()',
	test	: ( done ) => {
		assert.deepStrictEqual( app, App.App() );
		done();
	}
});

test({
	message	: 'Server.constructor.defaults',
	test	: ( done ) => {
		let server	= new Server();
		assert.equal( true, server.router instanceof Router );
		assert.equal( 1, server.router.middleware.length );
		assert.equal( 2, Object.keys( server.plugins ).length );
		assert.equal( typeof server.pluginBag === 'object', true );
		assert.deepStrictEqual( server.pluginManager instanceof PluginManager, true );

		assert.equal( typeof server.er_cache === 'object', true );
		assert.equal( typeof server.er_timeout === 'object', true );
		assert.equal( typeof server.er_env === 'object', true );
		assert.equal( typeof server.er_rate_limits === 'object', true );
		assert.equal( typeof server.er_static === 'object', true );
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
		assert.equal( typeof server.er_cors === 'object', true );
		assert.equal( typeof server.er_security === 'object', true );
		assert.equal( typeof server.er_validation === 'object', true );

		done();
	}
});

test({
	message	: 'Server.is.started',
	test	: ( done ) => {
		helpers.sendServerRequest( '/ping' ).then(() => {
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.getPluginManager.returns.a.pluginManager',
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
	message	: 'Server.add.adds.a.handler.with.different.permutations',
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
	message	: 'Server.apply.applies.only.a.PluginInterface.and.a.valid.string',
	test	: ( done ) => {
		const server			= new Server();

		const PluginManager		= server.getPluginManager();
		const staticResources	= PluginManager.getPlugin( 'er_static' );

		const validPlugin		= {
			getPluginId				: ()=>{ return 'id'; },
			getPluginDependencies	: ()=>{ return []; },
			getPluginMiddleware		: ()=>{ return []; },
			setOptions				: ()=>{},
			setServerOnRuntime		: ()=>{},
		};

		server.apply( staticResources );
		server.apply( 'er_static' );
		server.apply( validPlugin );

		assert.throws(() => {
			server.apply({
				getPluginDependencies	: ()=>{ return []; },
				getPluginMiddleware		: ()=>{ return []; },
				setOptions				: ()=>{},
				setServerOnRuntime		: ()=>{},
			});
		});

		assert.throws(() => {
			server.apply({
				getPluginId				: ()=>{ return 'id'; },
				getPluginMiddleware		: ()=>{ return []; },
				setOptions				: ()=>{},
				setServerOnRuntime		: ()=>{},
			});
		});

		assert.throws(() => {
			server.apply({
				getPluginId				: ()=>{ return 'id'; },
				getPluginDependencies	: ()=>{ return []; },
				setOptions				: ()=>{},
				setServerOnRuntime		: ()=>{},
			});
		});

		assert.throws(() => {
			server.apply({
				getPluginId				: ()=>{ return 'id'; },
				getPluginDependencies	: ()=>{ return []; },
				getPluginMiddleware		: ()=>{ return []; },
				setServerOnRuntime		: ()=>{},
			});
		});

		assert.throws(() => {
			server.apply({
				getPluginId				: ()=>{ return 'id'; },
				getPluginDependencies	: ()=>{ return []; },
				getPluginMiddleware		: ()=>{ return []; },
				setOptions				: ()=>{},
			});
		});

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
	message	: 'Server.get.works.as.intended',
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
	message	: 'Server.post.works.as.intended',
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
	message	: 'Server.delete.works.as.intended',
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
	message	: 'Server.put.works.as.intended',
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
	message	: 'Server.define.calls.router.define',
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
	message	: 'Server.Router.returns.a.new.router',
	test	: ( done ) => {
		const router	= app.Router();
		assert( router instanceof Router, true );

		done();
	}
});

test({
	message	: 'Server.Router.can.be.attached.back',
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
	message	: 'Server.Router.does.not.affect.the.original.router.if.not.applied.back',
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
	message	: 'Server().returns.the.same.instance',
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
	message	: 'Server.cleanUp().cleans.up',
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
	message	: 'App().attach().returns.a.function',
	test	: ( done ) => {
		assert.equal( typeof App().attach() === 'function', true );

		done();
	}
});

test({
	message	: 'App().attach().using.a.httpServer.works.as.expected',
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
	message	: 'Server.testGETWithoutRoute.(.skipped.cause.it.will.fail.all.the.others.)',
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
	message	: 'Server.testGET',
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
	message	: 'Server.testPOST',
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
	message	: 'Server.testDELETE',
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
	message	: 'Server.testPUT',
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
	message	: 'Server.testHEAD.also.head.does.not.return.body.even.if.sent',
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
	message	: 'Server.testPATCH',
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
	message	: 'Server.testGET.with.add',
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
	message	: 'Server.testPOST.with.add',
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
	message	: 'Server.testDELETE.with.add',
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
	message	: 'Server.testPUT.with.add',
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
	message	: 'Server.testHEAD.with.add.also.head.does.not.return.body.even.if.sent',
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
	message	: 'Server.testPATCH.with.add',
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
	message	: 'Server.test.add.is.case.insensitive',
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
	message	: 'Server.test.multiple.middlewares',
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
	message	: 'Server.test.empty.middleware',
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
	message	: 'Server.test.eventRequest.header.functions',
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
	message	: 'Server.test.eventRequest.setStatusCode',
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
	message	: 'Server.test.eventRequest.redirect',
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
	message	: 'Server.test.eventRequest.redirect',
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
	message	: 'Server.test.eventRequest.isFinished',
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
	message	: 'Server.test.eventRequest.send.string',
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
	message	: 'Server.test.eventRequest.send.object',
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
	message	: 'Server.test.eventRequest.sendError',
	test	: ( done ) => {
		const name	= 'testEventSendError';

		app.get( `/${name}`, ( event ) => {
			event.sendError( name );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 500 ).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), JSON.stringify( { error: { code: name } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.eventRequest.send.with.malformed.payload',
	test	: ( done ) => {
		const name	= 'testEventRequestSendWithMalformedPayload';

		app.get( `/${name}`, ( event ) => {
			const circular	= {};
			circular.a		= { b: circular };

			event.send( circular );
		});

		helpers.sendServerRequest( `/${name}`, 'GET', 500 ).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString().indexOf(
					'{"error":{"code":"app.general","message":"Converting circular structure to JSON'
				) !== -1,
				true
			);

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.router.cache.if.params.are.changed',
	test	: ( done ) => {
		const name	= 'testRouterCacheWhenParamsAreChanged';

		app.get( `/${name}/:id:`, ( event ) => {
			event.send( event.params );
		});

		helpers.sendServerRequest( `/${name}/idOne`, 'GET', 200 ).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), JSON.stringify( { id: 'idOne' } ) );

			return helpers.sendServerRequest( `/${name}/idTwo`, 'GET', 200 );
		}).then(( response )=>{
			assert.deepStrictEqual( response.body.toString(), JSON.stringify( { id: 'idTwo' } ) );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.eventRequest.sendError.when.response.is.finished',
	test	: ( done ) => {
		const name	= 'testEventSendErrorWhenFinished';

		app.get( `/${name}`, ( event ) => {
			event.response.end( 'ok' )
			event.sendError( name );
		});

		helpers.sendServerRequest( `/${name}`, 'GET', 200 ).then(( response ) => {
			assert.deepStrictEqual( response.body.toString(), 'ok' );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.eventRequest.sendError.send.Error',
	test	: ( done ) => {
		const name	= 'testEventSendErrorWithError';
		const error	= new Error( 'test' );

		app.get( `/${name}`, ( event ) => {
			event.sendError( error );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 500 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: { code: 'test' } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.eventRequest.sendError.with.different.status',
	test	: ( done ) => {
		const name	= 'testEventSendErrorWithDifferentStatus';

		app.get( `/${name}`, ( event ) => {
			event.sendError( name, 501 );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 501 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: { code: name } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.eventRequest.send.Error',
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
	message	: 'Server.test.eventRequest.send.raw',
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
	message	: 'Server.test.eventRequest.isFinished',
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
	message	: 'Server.test.eventRequest.setCookie',
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
	message	: 'Server.test.er_data_server.works.as.expected',
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
	message	: 'Server.test.er_data_server.works.as.expected.with.map',
	test	: ( done ) => {
		const app			= new Server();
		const name			= 'testCacheServerMap';
		const secondName	= `/${name}Second`;
		const key			= `${name}_KEY`;
		const value			= `${name}_VALUE`;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );

		app.listen( 4380, () => {
			app.get( `/${name}`, async ( event ) => {
				assert.equal( event.dataServer instanceof DataServerMap, true );

				await event.dataServer.set( key, value ).catch( done );
				await event.dataServer.set( `${key}_delete`, value ).catch( done );

				await event.dataServer.delete( `${key}_delete` ).catch( done );

				event.send( name );
			});

			app.get( secondName, async ( event ) => {
				assert.equal( event.dataServer instanceof DataServerMap, true );

				const cacheValue	= await event.dataServer.get( key ).catch( done );

				assert.equal( cacheValue, value );
				assert.equal( await event.dataServer.get( `${key}_delete` ).catch( done ), null );

				event.send( secondName );
			});

			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4380 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				return helpers.sendServerRequest( secondName, 'GET', 200, '', {}, 4380 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), secondName );
				done();
			}).catch( done )
		});
	}
});

test({
	message	: 'Server.test.er_data_server.works.as.expected.with.big.map',
	test	: ( done ) => {
		const app			= new Server();
		const name			= 'testCacheServerMap';
		const secondName	= `/${name}Second`;
		const key			= `${name}_KEY`;
		const value			= `${name}_VALUE`;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false, useBigMap: true } ) } );

		app.listen( 4381, () => {
			app.get( `/${name}`, async ( event ) => {
				assert.equal( event.dataServer instanceof DataServerMap, true );

				await event.dataServer.set( key, value ).catch( done );
				await event.dataServer.set( `${key}_delete`, value ).catch( done );

				await event.dataServer.delete( `${key}_delete` ).catch( done );

				event.send( name );
			});

			app.get( secondName, async ( event ) => {
				assert.equal( event.dataServer instanceof DataServerMap, true );

				const cacheValue	= await event.dataServer.get( key ).catch( done );

				assert.equal( cacheValue, value );
				assert.equal( await event.dataServer.get( `${key}_delete` ).catch( done ), null );

				event.send( secondName );
			});

			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4381 ).then(( response ) => {
				assert.equal( response.body.toString(), name );
				return helpers.sendServerRequest( secondName, 'GET', 200, '', {}, 4381 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), secondName );
				done();
			}).catch( done )
		});
	}
});

test({
	message	: 'Server.test.server.does.not.export./public.by.default',
	test	: ( done ) => {
		helpers.sendServerRequest( `/public/test/index.html`, 'GET', 404 ).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: { code: 'app.general', message: 'Cannot GET /public/test/index.html' } } ) );
			done();
		}).catch( done )
	}
});

test({
	message	: 'Server.test.er_static.works.as.expected',
	test	: ( done ) => {
		app.apply( app.er_static, { paths: ['tests/server/fixture/static'] } );

		helpers.sendServerRequest( `/tests/server/fixture/static/test_file.js` ).then(( response ) => {
			assert.equal( response.headers['content-type'], 'application/javascript' );
			assert.equal( response.body.toString(), 'const test=\'123\';' );

			return helpers.sendServerRequest( '/tests/server/fixture/static/test.css' );
		}).then(( response ) => {
			assert.equal( response.headers['content-type'], 'text/css' );
			assert.equal( response.body.toString(), 'body{background:black;}' );

			return helpers.sendServerRequest( '/tests/server/fixture/static/unknown_file.js', 'GET', 404 );
		}).then(( response ) => {
			assert.equal( response.body.toString().includes( '{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found' ), true );

			done();
		}).catch( done )
	}
});

test({
	message	: 'Server.test.er_static.works.as.expected.with.string',
	test	: ( done ) => {
		const app	= new Server();
		app.apply( app.er_static, { paths: 'tests/server/fixture/static' } );

		app.listen( 4500, ()=>{
			helpers.sendServerRequest( `/tests/server/fixture/static/test_file.js`, 'GET', 200, '', {}, 4500 ).then(( response ) => {
				assert.equal( response.headers['content-type'], 'application/javascript' );
				assert.equal( response.body.toString(), 'const test=\'123\';' );

				return helpers.sendServerRequest( '/tests/server/fixture/static/test.css', 'GET', 200, '', {}, 4500 );
			}).then(( response ) => {
				assert.equal( response.headers['content-type'], 'text/css' );
				assert.equal( response.body.toString(), 'body{background:black;}' );

				return helpers.sendServerRequest( '/tests/server/fixture/static/unknown_file.js', 'GET', 404, '', {}, 4500 );
			}).then(( response ) => {
				assert.equal( response.body.toString().includes( '{"error":{"code":"app.er.staticResources.fileNotFound","message":"File not found' ), true );
				setTimeout(()=>{
					done();
				}, 100 )
			}).catch( done )
		});
	}
});

test({
	message	: 'Server.test.er_static.works.as.expected.with.default',
	test	: ( done ) => {
		const app	= new Server();
		app.apply( app.er_static );

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
				'{"error":{"code":"app.general","message":"Could not find a FileStream that supports that format"}}'
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
	message	: 'Server.test.calling.next.twice.does.not.die.critically',
	test	: ( done ) => {
		const error	= 'An Error Has Occurred!';

		app.get( '/testCallingNextTwiceDoesNotDieCritically', ( event ) => {
			event.next( error );
			event.next();
		});

		helpers.sendServerRequest( `/testCallingNextTwiceDoesNotDieCritically`, 'GET', 500 ).then( ( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: { code: 'app.general', message: error } } ) );
			done();
		} ).catch( done );
	}
});

test({
	message	: 'Server.testServerAddsXPoweredBy',
	test	: ( done ) => {
		app.get( '/textServerAddsXPoweredBy', event => event.send( 'ok' ) );

		helpers.sendServerRequest( `/textServerAddsXPoweredBy` ).then( ( response ) => {
			assert.equal( response.body.toString(), 'ok' );
			assert.equal( response.headers['x-powered-by'], 'event_request' );

			done();
		} ).catch( done );
	}
});

test({
	message	: 'Server.testServerAddsXPoweredBy.when.disabled',
	test	: ( done ) => {
		app.get( '/textServerAddsXPoweredByWhenDisabled', ( event ) => {
			event.disableXPoweredBy	= true;
			event.send( 'ok' );
		});

		helpers.sendServerRequest( `/textServerAddsXPoweredByWhenDisabled` ).then( ( response ) => {
			assert.equal( response.body.toString(), 'ok' );
			assert.equal( response.headers['x-powered-by'], undefined );

			done();
		} ).catch( done );
	}
});

test({
	message	: 'Server.testServerAddsXPoweredBy.when.send.is.not.used',
	test	: ( done ) => {
		app.get( '/textServerAddsXPoweredByWithoutSend', event => event.end( 'ok' ) );

		helpers.sendServerRequest( `/textServerAddsXPoweredByWithoutSend` ).then( ( response ) => {
			assert.equal( response.body.toString(), 'ok' );
			assert.equal( response.headers['x-powered-by'], undefined );

			done();
		} ).catch( done );
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
		const relativeLogLocation	= './tests/server/fixture/logger/testWithoutLoggerLog.log';
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

		const app	= new Server();

		Loggur.disableDefault();

		Loggur.addLogger( 'test', logger );

		app.get( '/eventRequestOnErrorWithoutALogger', ( event ) => {
			event.emit( 'on_error', 'ERROR!' );
			event.emit( 'on_error', new Error( 'ERROR ! ERROR' ) );
			event.emit( 'on_error', { test: 123 } );
			event.emit( 'on_error', { error: new Error( 'test' ), code: 51251 } );

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
			fileTransport.getWriteStream().end();
			setTimeout(() => {
				assert.deepStrictEqual( response.body.toString(), 'ERROR!' );

				process.log			= undefined;

				assert.deepStrictEqual( fs.existsSync( fileTransport.getFileName() ), true );
				assert.deepStrictEqual( fs.statSync( fileTransport.getFileName() ).size > 0, true );

				const logData	= fs.readFileSync( fileTransport.getFileName() );

				if ( fs.existsSync( fileTransport.getFileName() ) )
					fs.unlinkSync( fileTransport.getFileName() );

				assert.deepStrictEqual( logData.includes( 'ERROR!' ), true );
				assert.deepStrictEqual( logData.includes( 'ERROR ! ERROR' ), true );
				assert.deepStrictEqual( logData.includes( '{"test":123}' ), true );
				assert.deepStrictEqual( logData.includes( '{"error":"Error: test' ), true );
				assert.deepStrictEqual( logData.includes( ',"code":51251' ), true );

				Loggur.loggers	= {};
				done();
			}, 250 );
		}).catch( done );

		app.listen( 4212 );
	}
});

test({
	message	: 'Server.eventRequest.on.error.with.a.logger',
	test	: ( done ) => {
		const relativeLogLocation	= './tests/server/fixture/logger/testWithoutLoggerLog.log';
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

		const app	= new Server();

		Loggur.disableDefault();
		Loggur.addLogger( 'test', logger );

		app.get( '/eventRequestOnErrorWithoutALogger', ( event ) => {
			event.logger	= {};
			event.emit( 'on_error', 'ERROR!' );
			event.emit( 'on_error', new Error( 'ERROR ! ERROR' ) );
			event.emit( 'on_error', { test: 123 } );
			event.emit( 'on_error', { error: new Error( 'test' ), code: 51251 } );

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
			4217
		).then(( response ) => {
			fileTransport.getWriteStream().end();
			setTimeout(() => {
				assert.deepStrictEqual( response.body.toString(), 'ERROR!' );

				process.log			= undefined;

				assert.deepStrictEqual( fs.existsSync( fileTransport.getFileName() ), true );
				assert.deepStrictEqual( fs.statSync( fileTransport.getFileName() ).size > 0, false );

				const logData	= fs.readFileSync( fileTransport.getFileName() );

				if ( fs.existsSync( fileTransport.getFileName() ) )
					fs.unlinkSync( fileTransport.getFileName() );

				assert.deepStrictEqual( logData.toString(), '' );
				Loggur.loggers	= {};

				done();
			}, 250 );
		}).catch( done );

		app.listen( 4217 );
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
