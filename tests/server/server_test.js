'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../test_helper' );
const { Server, Router }		= require( './../../index' );
const PreloadedPluginManager	= require( './../../server/plugins/preloaded_plugins' );

test({
	message	: 'Server.constructor starts without crashing',
	test	: ( done )=>{
		assert.doesNotThrow( ()=>{
			new Server();
		});
		done();
	}
});

test({
	message	: 'Server.constructor instantiates a router and has a pluginManager',
	test	: ( done )=>{
		let server	= new Server();
		assert.deepStrictEqual( server.router, new Router() );
		assert.deepStrictEqual( server.pluginManager, PreloadedPluginManager );
		assert.deepStrictEqual( server.plugins, [] );
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

		assert.equal( 5, server.router.middleware.length );

		done();
	}
});


test({
	message	: 'Server.apply applies only a PluginInterface and a valid string',
	test	: ( done ) =>{
		let server			= new Server();

		let PluginManager	= server.getPluginManager();
		let staticResources	= PluginManager.getPlugin( 'event_request_static_resources' );

		server.apply( staticResources );
		server.apply( 'event_request_static_resources' );

		assert.throws(()=>{
			server.apply( 'wrong' );
		});

		assert.throws(()=>{
			server.apply( {} );
		});

		assert.equal( 2, server.router.middleware.length );

		done();
	}
});
