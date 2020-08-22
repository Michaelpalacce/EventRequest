'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const CacheControl				= require( '../../../../server/components/cache-control/cache_control' );
const CacheControlPlugin		= require( '../../../../server/plugins/available_plugins/cache_control_plugin' );

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

		eventRequest._mock( {
			method	: 'setResponseHeader',
			called	: 3,
			with	: [
				['Cache-control', 'public, must-revalidate'],
				['Content-Length', 54],
				['X-Powered-By', 'event_request'],
			]
		});

		eventRequest._setBlock( middleware );

		eventRequest.next();

		setTimeout(() => {
			done();
		}, 50 );
	}
});

test({
	message	: 'CacheControlPlugin.getPluginMiddleware.middleware.does.not.add.cache.header.if.empty',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin( 'test', {} );

		const middleware	= plugin.getPluginMiddleware();

		eventRequest._mock( {
			method	: 'setResponseHeader',
			called	: 2,
			with	: [
				['Content-Length', 54],
				['X-Powered-By', 'event_request'],
			]
		});

		eventRequest._setBlock( middleware );

		eventRequest.next();

		setTimeout(() => {
			done();
		}, 50 );
	}
});

test({
	message	: 'CacheControlPlugin.cache.middleware.adds.cache.control.header',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin();

		eventRequest._mock( {
			method	: 'setResponseHeader',
			called	: 3,
			with	: [
				['Cache-control', 'public, must-revalidate'],
				['Content-Length', 54],
				['X-Powered-By', 'event_request']
			]
		});

		plugin.cache( { cacheControl : 'public', revalidation: 'must-revalidate' } )( eventRequest );

		setTimeout(() => {
			done();
		}, 50 );
	}
});

test({
	message	: 'CacheControlPlugin.cache.middleware.does.not.add.cache.header.if.empty',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin();

		eventRequest._mock( {
			method	: 'setResponseHeader',
			called	: 2,
			with	: [
				['Content-Length', 54],
				['X-Powered-By', 'event_request'],
			]
		});

		plugin.cache( {} )( eventRequest );

		setTimeout(() => {
			done();
		}, 50 );
	}
});

test({
	message	: 'CacheControlPlugin.cache.middleware.does.not.add.cache.header.if.nothing.given',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest();
		const plugin		= new CacheControlPlugin();

		eventRequest._mock( {
			method	: 'setResponseHeader',
			called	: 2,
			with	: [
				['Content-Length', 54],
				['X-Powered-By', 'event_request'],
			]
		});

		plugin.cache()( eventRequest );

		setTimeout(() => {
			done();
		}, 50 );
	}
});
