'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const StaticResourcesPlugin		= require( '../../../../server/plugins/available_plugins/static_resources_plugin' );
const Router					= require( '../../../../server/components/routing/router' );

test({
	message		: 'StaticResourcesPlugin setsHeader for text/css in case of css',
	test		: ( done )=>{
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.css', { accept : 'text/css' } );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'] } );
		let router					= new Router();
		let called					= 0;

		let pluginMiddlewares		= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setHeader',
			shouldReturn	: ()=>{
				called	++;
			},
			with			: [
				['Content-Type', 'text/css']
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( 1, called );

		done();
	}
});

test({
	message		: 'StaticResourcesPlugin setsHeader to application/javascript in case of js',
	test		: ( done )=>{
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.js' );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'] } );
		let router					= new Router();
		let called					= 0;

		let pluginMiddlewares		= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setHeader',
			shouldReturn	: ()=>{
				called	++;
			},
			with			: [
				['Content-Type', 'application/javascript']
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( 1, called );

		done();
	}
});
