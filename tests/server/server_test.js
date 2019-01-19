'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../test_helper' );
const Server					= require( './../../server/server' );
const Router					= require( './../../server/components/routing/router' );
const PreloadedPluginManager	= require( './../../server/plugins/preloaded_plugins' );

test({
	message	: 'Server.constructor starts without crashing with defaults',
	test	: ( done )=>{
		assert.doesNotThrow( ()=>{
			let server	= new Server();

			assert.equal( 'http', server.protocol );
			assert.deepStrictEqual( {}, server.httpsOptions );
			assert.equal( 3000, server.port );
			assert.equal( true, server.applyPlugins );
			assert.equal( 3, server.router.middleware.length );
		});
		done();
	}
});

test({
	message	: 'Server.constructor does not apply plugins if passed',
	test	: ( done )=>{
		assert.doesNotThrow( ()=>{
			let server	= new Server( { plugins: false });

			assert.equal( false, server.applyPlugins );
			assert.equal( 0, server.router.middleware.length );
		});
		done();
	}
});

test({
	message	: 'Server.constructor instantiates a router and has a pluginManager',
	test	: ( done )=>{
		let server	= new Server();
		assert.equal( true, server.router instanceof Router );
		assert.equal( 3, server.router.middleware.length );
		assert.deepStrictEqual( server.pluginManager, PreloadedPluginManager );
		done();
	}
});

test({
	message	: 'Server.constructor options when options are correct',
	test	: ( done )=>{
		let options	= {};
		new Server( options );

		done();
	}
});

test({
	message	: 'Server.constructor options when options are incorrect',
	test	: ( done )=>{
		let options	= new Error();
		new Server( options );

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
