'use strict';

// Dependencies
const { Mock, assert, test, helpers }	= require( '../../../test_helper' );
const CorsPlugin						= require( '../../../../server/plugins/available_plugins/cors_plugin' );
const Server							= require( '../../../../server/server' );

test({
	message	: 'CorsPlugin.constructor.on.defaults.does.not.throw',
	test	: ( done )=>{
		assert.doesNotThrow(()=>{
			const plugin	= new CorsPlugin();

			assert.equal( plugin.getPluginId(), undefined );
		});

		done();
	}
});

test({
	message	: 'CorsPlugin.getPluginMiddleware',
	test	: ( done )=>{
		const plugin	= new CorsPlugin();

		const middleware	= plugin.getPluginMiddleware();
		assert.equal( Array.isArray( middleware ), true );
		assert.equal( middleware.length, 1 );

		done();
	}
});

test({
	message	: 'CorsPlugin.getPluginMiddleware',
	test	: ( done )=>{
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CorsPlugin();

		const middleware	= plugin.getPluginMiddleware();
		assert.equal( Array.isArray( middleware ), true );
		assert.equal( middleware.length, 1 );

		const funcToCall	= middleware[0].handler;
		let called			= 0;

		eventRequest._mock({
			method			: 'setResponseHeader',
			called			: 2,
			with			: [
				[ 'Access-Control-Allow-Origin', '*' ],
				[ 'Access-Control-Allow-Headers', '*' ],
			],
			shouldReturn	: ()=>{
				called++;
			}
		});

		eventRequest._mock({
			method			: 'next',
			shouldReturn	: ()=>{
				called === 2 ? done() : done( 'The setResponseHeader was not called enough times' );
			}
		});

		funcToCall( eventRequest );
	}
});

test({
	message	: 'CorsPlugin.getPluginMiddleware.with.non.default.settings',
	test	: ( done )=>{
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CorsPlugin( '', {
			origin			: 'http://example.com',
			maxAge			: 500,
			credentials		: true,
			exposedHeaders	: ['HeaderOne', 'HeaderTwo'],
			headers			: ['HeaderOne', 'HeaderTwo']
		});

		const middleware	= plugin.getPluginMiddleware();
		assert.equal( Array.isArray( middleware ), true );
		assert.equal( middleware.length, 1 );

		const funcToCall	= middleware[0].handler;
		let called			= 0;

		eventRequest._mock({
			method			: 'setResponseHeader',
			called			: 5,
			with			: [
				[ 'Access-Control-Allow-Origin', 'http://example.com' ],
				[ 'Access-Control-Allow-Headers', 'HeaderOne, HeaderTwo' ],
				[ 'Access-Control-Expose-Headers', 'HeaderOne, HeaderTwo' ],
				[ 'Access-Control-Max-Age', 500 ],
				[ 'Access-Control-Allow-Credentials', 'true' ],
			],
			shouldReturn	: ()=>{
				called++;
			}
		});

		eventRequest._mock({
			method			: 'next',
			shouldReturn	: ()=>{
				called === 5 ? done() : done( 'The setResponseHeader was not called enough times' );
			}
		});

		funcToCall( eventRequest );
	}
});


test({
	message	: 'CorsPlugin.getPluginMiddleware.with.non.default.settings.and.preflight.request',
	test	: ( done )=>{
		const eventRequest	= helpers.getEventRequest( 'options' );
		const plugin		= new CorsPlugin( '', {
			origin			: 'http://example.com',
			maxAge			: 500,
			status			: 201,
			methods			: ['POST', 'PUT', 'GET'],
			credentials		: true,
			exposedHeaders	: ['HeaderOne', 'HeaderTwo'],
			headers			: ['HeaderOne', 'HeaderTwo']
		});

		const middleware	= plugin.getPluginMiddleware();
		assert.equal( Array.isArray( middleware ), true );
		assert.equal( middleware.length, 1 );

		const funcToCall	= middleware[0].handler;
		let called			= 0;

		eventRequest._mock({
			method			: 'setResponseHeader',
			called			: 6,
			with			: [
				[ 'Access-Control-Allow-Origin', 'http://example.com' ],
				[ 'Access-Control-Allow-Headers', 'HeaderOne, HeaderTwo' ],
				[ 'Access-Control-Expose-Headers', 'HeaderOne, HeaderTwo' ],
				[ 'Access-Control-Max-Age', 500 ],
				[ 'Access-Control-Allow-Credentials', 'true' ],
				[ 'Access-Control-Allow-Methods', 'POST, PUT, GET' ],
			],
			shouldReturn	: ()=>{
				called++;
			}
		});

		eventRequest._mock({
			method			: 'next',
			shouldReturn	: ()=>{
				done( 'eventRequest next should not have been called' );
			}
		});

		eventRequest._mock({
			method			: 'send',
			called			: 1,
			with			: [
				[undefined, 201]
			],
			shouldReturn	: ()=>{
				called === 6 ? done() : done( 'The setResponseHeader was not called enough times' );
			}
		});

		funcToCall( eventRequest );
	}
});
