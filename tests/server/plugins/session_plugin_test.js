'use strict';

// Dependencies
const { assert, test, helpers }	= require( './../../test_helper' );
const SessionPlugin				= require( './../../../server/plugins/session_plugin' );
const Router					= require( './../../../server/components/routing/router' );
const MemoryDataServer			= require( './../../../server/components/caching/memory/memory_data_server' );

class TestDataServer extends MemoryDataServer
{
	constructor( options )
	{
		super( options );
	}

	doCommand()
	{
		return new Promise(( resolve, reject )=>{
			resolve( true );
		})
	}

	sanitize( options ) {}
}

test({
	message		: 'SessionPlugin throws cause of missing cachingServer',
	test		: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		let router					= new Router();
		let sessionPlugin			= new SessionPlugin( 'id', {} );

		let middleware				= sessionPlugin.getPluginMiddleware();

		assert.equal( 1, middleware.length );

		router.add( middleware[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );

		assert.throws(()=>{
			eventRequest.next();
		});

		done();
	}
});

test({
	message		: 'Session plugin test does not throw if caching server is set',
	test		: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		let router					= new Router();
		let sessionPlugin			= new SessionPlugin( 'id', {} );

		let middleware				= sessionPlugin.getPluginMiddleware();

		assert.equal( 1, middleware.length );

		eventRequest.cachingServer	= new TestDataServer();
		router.add( middleware[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock( { method : 'on' } );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );

		eventRequest.next();

		done();
	}
});
