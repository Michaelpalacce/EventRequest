'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const MemoryDataServerPlugin	= require( '../../../../server/plugins/available_plugins/memory_data_server_plugin' );
const MemoryDataServer			= require( '../../../../server/components/caching/memory/memory_data_server' );
const Router					= require( '../../../../server/components/routing/router' );

test({
	message	: 'MemoryDataServerPlugin startServer starts the server',
	test	: ( done )=>{
		let memoryDataServerPlugin	= new MemoryDataServerPlugin( 'id' );

		memoryDataServerPlugin.startServer( ( error, server )=>{
			assert.equal( false, error );
			server.createNamespace( 'test' ).then( ( data )=>{ done(); }, done );
		});
	}
});

test({
	message	: 'MemoryDataServerPlugin startServer does not die if started multiple times',
	test	: ( done )=>{
		let memoryDataServerPlugin	= new MemoryDataServerPlugin( 'id' );

		memoryDataServerPlugin.startServer();
		memoryDataServerPlugin.startServer(( server )=>{
			done();
		});
	}
});

test({
	message	: 'MemoryDataServerPlugin startServer does not die if server is already running',
	test	: ( done )=>{
		let memoryDataServerPluginOne	= new MemoryDataServerPlugin( 'id' );
		let memoryDataServerPluginTwo	= new MemoryDataServerPlugin( 'id2' );

		memoryDataServerPluginOne.startServer();
		memoryDataServerPluginTwo.startServer(()=>{
			done();
		});
	}
});

test({
	message	: 'MemoryDataServerPlugin getServer returns false if server is not started and MemoryDataServer after start',
	test	: ( done )=>{
		let memoryDataServerPlugin	= new MemoryDataServerPlugin( 'id' );

		assert.equal( false, memoryDataServerPlugin.getServer() );

		memoryDataServerPlugin.startServer();

		assert.equal( true, memoryDataServerPlugin.getServer() instanceof MemoryDataServer );

		done();
	}
});

test({
	message	: 'MemoryDataServerPlugin stops the server',
	test	: ( done )=>{
		let memoryDataServerPlugin	= new MemoryDataServerPlugin( 'id' );

		memoryDataServerPlugin.startServer();
		memoryDataServerPlugin.stopServer();

		memoryDataServerPlugin.getServer().existsNamespace( 'test' ).then( ()=>{ done( 'Server should be dead' ) }, ( err )=>{
			// assert that there is an error ( existsNamespace returns true in case of error )
			assert.equal( true, err );

			done();
		} );
	}
});

test({
	message	: 'MemoryDataServerPlugin getPluginMiddleware returns an array',
	test	: ( done )=>{
		let memoryDataServerPlugin	= new MemoryDataServerPlugin( 'id' );

		let pluginMiddleware		= memoryDataServerPlugin.getPluginMiddleware();
		assert.equal( true, Array.isArray( pluginMiddleware ) );
		assert.equal( 1, pluginMiddleware.length );

		done();
	}
});

test({
	message	: 'MemoryDataServerPlugin adds a caching server',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		let memoryDataServerPlugin	= new MemoryDataServerPlugin( 'id', { timeout: 0 } );
		let router					= new Router();

		let pluginMiddlewares		= memoryDataServerPlugin.getPluginMiddleware();

		memoryDataServerPlugin.startServer(()=>{
			assert.equal( 1, pluginMiddlewares.length );

			router.add( pluginMiddlewares[0] );
			router.add( helpers.getEmptyMiddleware() );

			eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
			eventRequest.next();

			assert.equal( true, typeof eventRequest.cachingServer !== 'undefined' );
			assert.equal( true, eventRequest.cachingServer instanceof MemoryDataServer );

			done();
		});
	}
});
test({
	message	: 'MemoryDataServerPlugin sets false to cachingServer if the server is not started',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		let memoryDataServerPlugin	= new MemoryDataServerPlugin( 'id', { timeout: 0 } );
		let router					= new Router();

		let pluginMiddlewares		= memoryDataServerPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( true, eventRequest.cachingServer === false );

		done();
	}
});
