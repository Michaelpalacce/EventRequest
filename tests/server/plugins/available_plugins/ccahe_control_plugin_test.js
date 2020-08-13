'use strict';

// Dependencies
const { Mock, assert, test, helpers }	= require( '../../../test_helper' );
const CorsPlugin						= require( '../../../../server/plugins/available_plugins/cors_plugin' );
const Server							= require( '../../../../server/server' );
const CacheControl						= require( '../../../../server/components/cache-control/cache_control' );
const CacheControlPlugin				= require( '../../../../server/plugins/available_plugins/cache_control_plugin' );

test({
	message	: 'CacheControlPlugin.constructor.on.defaults',
	test	: ( done ) => {
		const plugin	= new CacheControlPlugin();

		assert.deepStrictEqual( plugin.builder, new CacheControl() );

		done();
	}
});

test({
	message	: 'CacheControlPlugin.constructor.with.options',
	test	: ( done ) => {
		const options	= {
			cacheControl			: 'private',
			expirationDirectives	: {
				'max-age'	: 1231,
				's-maxage'	: 'wrong'
			}
		}
		const plugin	= new CacheControlPlugin( 'pluginId', options );

		assert.deepStrictEqual( plugin.builder, new CacheControl() );
		assert.deepStrictEqual( plugin.options, options );

		done();
	}
});

test({
	message	: 'CacheControlPlugin.getPluginMiddleware',
	test	: ( done ) => {
		const plugin	= new CacheControlPlugin();

		assert.deepStrictEqual( plugin.getPluginMiddleware().length, 1 );

		done();
	}
});

test({
	message	: 'CacheControlPlugin.getPluginMiddleware.middleware.adds.cache.control.header',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin( 'test', { cacheControl : 'public', revalidation: 'must-revalidate' } );

		const middleware	= plugin.getPluginMiddleware();

		eventRequest._mock({
			method			: 'setResponseHeader',
			called			: 1,
			shouldReturn	: ( name, value ) => {
				assert.deepStrictEqual( name, 'Cache-control' );
				assert.deepStrictEqual( value, 'public, must-revalidate' );

				done();
			}
		});

		eventRequest._setBlock( middleware );

		eventRequest.next();
	}
});

test({
	message	: 'CacheControlPlugin.getPluginMiddleware.middleware.does.not.add.cache.header.if.empty',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin( 'test', {} );

		const middleware	= plugin.getPluginMiddleware();

		eventRequest._mock( { method : 'setResponseHeader',  called : 0 } );

		eventRequest._setBlock( middleware );

		eventRequest.next();

		done();
	}
});

test({
	message	: 'CacheControlPlugin.cache.middleware.adds.cache.control.header',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin();

		eventRequest._mock({
			method			: 'setResponseHeader',
			called			: 1,
			shouldReturn	: ( name, value ) => {
				assert.deepStrictEqual( name, 'Cache-control' );
				assert.deepStrictEqual( value, 'public, must-revalidate' );

				done();
			}
		});

		plugin.cache( { cacheControl : 'public', revalidation: 'must-revalidate' } )( eventRequest );
	}
});

test({
	message	: 'CacheControlPlugin.cache.middleware.does.not.add.cache.header.if.empty',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin();

		eventRequest._mock( { method : 'setResponseHeader',  called : 0 } );

		plugin.cache( {} )( eventRequest );

		done();
	}
});

test({
	message	: 'CacheControlPlugin.cache.middleware.does.not.add.cache.header.if.nothing.given',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin();

		eventRequest._mock( { method : 'setResponseHeader',  called : 0 } );

		plugin.cache()( eventRequest );

		done();
	}
});
