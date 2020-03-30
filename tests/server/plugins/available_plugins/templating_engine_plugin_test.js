'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const TemplatingEnginePlugin	= require( '../../../../server/plugins/available_plugins/templating_engine_plugin' );
const Router					= require( '../../../../server/components/routing/router' );
const path						= require( 'path' );

class TestTemplatingEngine
{
	render( html, variables )
	{
		return 'rendered';
	}
}

test({
	message		: 'TemplatingEnginePlugin calls the render function of the engine and sends the rendered html successfully and attaches a render function',
	test		: ( done )=>{
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.css' );
		let templatingEnginePlugin	= new TemplatingEnginePlugin( 'id', { engine : new TestTemplatingEngine(), templateDir: path.join( __dirname, './fixture/templates' ) } );
		let router					= new Router();
		let called					= 0;
		let setHeaderCalled			= 0;

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: ()=>{
				called	++;
			},
			with			: [['rendered', 200]],
			called			: 1
		});

		eventRequest._mock({
			method			: 'setHeader',
			shouldReturn	: ()=>{
				setHeaderCalled	++;
			},
			called			: 1
		});

		let pluginMiddlewares	= templatingEnginePlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );
		assert.equal( true, typeof eventRequest.render === 'undefined' );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();
		eventRequest.render( 'test', {}, done ).then(()=>{
			assert.equal( 1, called );
			assert.equal( 1, setHeaderCalled );
			assert.equal( false, typeof eventRequest.render === 'undefined' );
			assert.equal( false, typeof eventRequest.templateDir === 'undefined' );
			assert.equal( false, typeof eventRequest.templatingEngine === 'undefined' );

			done();
		});

	}
});
