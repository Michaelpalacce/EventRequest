'use strict';

// Dependencies
const { assert, test, helpers, Mock }	= require( '../test_helper' );
const App								= require( './../../server/server' );
const Router							= require( './../../server/components/routing/router' );
const PreloadedPluginManager			= require( './../../server/plugins/preloaded_plugins' );
const Server							= App.class;


test({
	message	: 'Server.constructor starts without crashing with defaults',
	test	: ( done )=>{
		assert.doesNotThrow( ()=>{
			let server	= new Server();

			assert.equal( 3, server.router.middleware.length );
		});
		done();
	}
});


test({
	message	: 'Server.constructor defaults',
	test	: ( done )=>{
		let server	= new Server();
		assert.equal( true, server.router instanceof Router );
		assert.equal( 3, server.router.middleware.length );
		assert.equal( 4, Object.keys( server.plugins ).length );
		assert.deepStrictEqual( server.pluginManager, PreloadedPluginManager );

		assert.equal( typeof server.er_timeout === 'string', true );
		assert.equal( typeof server.er_env === 'string', true );
		assert.equal( typeof server.er_rate_limits === 'string', true );
		assert.equal( typeof server.er_static_resources === 'string', true );
		assert.equal( typeof server.er_cache_server === 'string', true );
		assert.equal( typeof server.er_templating_engine === 'string', true );
		assert.equal( typeof server.er_file_stream === 'string', true );
		assert.equal( typeof server.er_logger === 'string', true );
		assert.equal( typeof server.er_body_parser === 'string', true );
		assert.equal( typeof server.er_session === 'string', true );
		assert.equal( typeof server.er_response_cache === 'string', true );
		assert.equal( typeof server.er_body_parser_json === 'string', true );
		assert.equal( typeof server.er_body_parser_form === 'string', true );
		assert.equal( typeof server.er_body_parser_multipart === 'string', true );

		done();
	}
});

test({
	message	: 'Server is started',
	test	: ( done ) =>{
		helpers.sendServerRequest( '', '/ping', 'GET', ( err, response )=>{
			if ( err )
			{
				done( err );
			}
			else
			{
				response.statusCode === 200 ? done() : done( 'Wrong status code returned' );
			}
		});
	}
});

test({
	message	: 'Server.getPluginManager returns a pluginManager',
	test	: ( done ) =>{
		let server			= new Server();
		let pluginManager	= server.getPluginManager();

		assert.equal( true, pluginManager instanceof PreloadedPluginManager.constructor );
		done();
	}
});

test({
	message	: 'Server.add adds a handler with different permutations',
	test	: ( done ) =>{
		let server	= new Server();

		server.add({
			handler	:()=>{}
		});

		server.add({
			route	: '/',
			handler	:()=>{}
		});

		server.add({
			route	: '/',
			method	: 'GET',
			handler	:()=>{}
		});

		server.add({
			method	: 'GET',
			handler	:()=>{}
		});

		server.add({
			route	: '/',
			method	: 'GET'
		});

		// 5 added 3 preloaded
		assert.equal( 8, server.router.middleware.length );

		done();
	}
});

test({
	message	: 'Server.apply applies only a PluginInterface and a valid string',
	test	: ( done ) =>{
		let server			= new Server();

		let PluginManager	= server.getPluginManager();
		let staticResources	= PluginManager.getPlugin( 'er_static_resources' );

		server.apply( staticResources );
		server.apply( 'er_static_resources' );

		assert.throws(()=>{
			server.apply( 'wrong' );
		});

		assert.throws(()=>{
			server.apply( {} );
		});

		// 2 added 3 pre loaded
		assert.equal( 5, server.router.middleware.length );

		done();
	}
});

test({
	message	: 'Server.get works as intended',
	test	: ( done ) =>{
		let server			= new Server();
		let eventRequest	= helpers.getEventRequest( 'GET', '/' );

		server.get( '/', ( event )=>{
			event.next();
		});

		server.get( '/test', ( event )=>{
			event.next();
		});

		let router	= server.router;
		let block	= router.getExecutionBlockForCurrentEvent( eventRequest );

		assert.equal( 3, block.length );

		done();
	}
});

test({
	message	: 'Server.post works as intended',
	test	: ( done ) =>{
		let server			= new Server();
		let eventRequest	= helpers.getEventRequest( 'POST', '/' );

		server.post( '/', ( event )=>{
			event.next();
		});

		server.post( '/test', ( event )=>{
			event.next();
		});

		let router	= server.router;
		let block	= router.getExecutionBlockForCurrentEvent( eventRequest );

		assert.equal( 3, block.length );

		done();
	}
});

test({
	message	: 'Server.delete works as intended',
	test	: ( done ) =>{
		let server			= new Server();
		let eventRequest	= helpers.getEventRequest( 'DELETE', '/' );

		server.delete( '/', ( event )=>{
			event.next();
		});

		server.delete( '/test', ( event )=>{
			event.next();
		});

		let router	= server.router;
		let block	= router.getExecutionBlockForCurrentEvent( eventRequest );

		assert.equal( 3, block.length );

		done();
	}
});

test({
	message	: 'Server.put works as intended',
	test	: ( done ) =>{
		let server			= new Server();
		let eventRequest	= helpers.getEventRequest( 'PUT', '/' );

		server.put( '/', ( event )=>{
			event.next();
		});

		server.put( '/test', ( event )=>{
			event.next();
		});

		let router	= server.router;
		let block	= router.getExecutionBlockForCurrentEvent( eventRequest );

		assert.equal( 3, block.length );

		done();
	}
});

test({
	message	: 'Server.define calls router.define',
	test	: ( done ) =>{
		const RouterMock		= Mock( Router );
		const middlewareName	= 'test';
		const server			= new Server();
		const router			= new RouterMock();
		let called				= false;

		router._mock({
			method			: 'define',
			shouldReturn	: ()=>{
				called	= true;
			}
		});

		server.router			= router;

		server.define( middlewareName, ()=>{} );

		if ( called === false )
		{
			return done( 'Router.define was not called but should have been' );
		}

		done();
	}
});

test({
	message	: 'Server() returns the same instance',
	test	: ( done )=>{
		let server		= App();
		let serverTwo	= App();

		server.define( 'testMiddleware', ()=>{} );

		assert.throws( ()=>{
			serverTwo.define( 'testMiddleware', ()=>{} );
		});

		App.cleanUp();

		done();
	}
});

test({
	message	: 'Server.cleanUp() cleans up',
	test	: ( done )=>{
		let server		= App();

		server.define( 'testMiddleware', ()=>{} );

		assert.throws( ()=>{
			server.define( 'testMiddleware', ()=>{} );
		});

		App.cleanUp();

		App().define( 'testMiddleware', ()=>{} );

		done();
	}
});

test({
	message	: 'Server.attach() returns a function',
	test	: ( done )=>{
		assert.equal( typeof App.attach() === 'function', true );

		done();
	}
});

test({
	message	: 'Server.attach() using a httpServer works as expected',
	test	: ( done )=>{
		const httpServer	= require( 'http' );
		const body			= '<h1>Hello World!</h1>';
		const port			= 3334;
		const app			= App();

		app.get( '/testRoute', ( event ) => {
			event.send( body, 201 );
		});

		const server	= httpServer.createServer( App.attach() );

		server.listen( port );

		helpers.sendServerRequest( '', '/testRoute', 'GET', ( err, response )=>{
			if ( err )
			{
				done( err );
			}
			else
			{
				response.statusCode === 201 ? done() : done( 'Wrong status code returned' );
			}
		}, port );

		server.close();

		done();
	}
});
