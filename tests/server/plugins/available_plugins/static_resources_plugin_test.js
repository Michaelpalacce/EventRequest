'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const StaticResourcesPlugin		= require( '../../../../server/plugins/available_plugins/static_resources_plugin' );
const Router					= require( '../../../../server/components/routing/router' );
const { Server }				= require( '../../../../index' );

const crypto					= require( 'crypto' );
const fs						= require( 'fs' );
const path						= require( 'path' );

const fileStats					= fs.statSync( path.join( __dirname, '../../../fixture/test.svg' ) );
// In linux hashes are calculated differently
const strongHash				= `"${crypto.createHash( 'sha1' ).update( `${fileStats.mtimeMs.toString()}-${fileStats.size.toString()}` ).digest( 'hex' )}"`;
const weakHash					= `W/"${crypto.createHash( 'md5' ).update( `${fileStats.mtimeMs.toString()}-${fileStats.size.toString()}` ).digest( 'hex' )}"`;

test({
	message		: 'StaticResourcesPlugin.setsHeader.for.text/css.in.case.of.css',
	test		: ( done ) => {
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.css', { accept : 'text/css' } );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'] } );
		staticResourcesPlugin.setServerOnRuntime( new Server() );

		let router	= new Router();
		let called	= 0;

		let pluginMiddlewares		= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => {
				called++;

				return eventRequest;
			},
			with			: [
				['Cache-control', 'public, max-age=604800, immutable'],
				['Content-Type', 'text/css'],
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		setTimeout(() => {
			assert.equal( 2, called );

			done();
		}, 50 );
	}
});

test({
	message		: 'StaticResourcesPlugin.setsHeader.to.application/javascript.in.case.of.js',
	test		: ( done ) => {
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.js' );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'] } );
		staticResourcesPlugin.setServerOnRuntime( new Server() );

		let router	= new Router();
		let called	= 0;

		let pluginMiddlewares		= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => {
				called++;

				return eventRequest;
			},
			with			: [
				['Cache-control', 'public, max-age=604800, immutable'],
				['Content-Type', 'application/javascript'],
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		setTimeout(() => {
			assert.equal( 2, called );

			done();
		}, 50 );
	}
});

test({
	message		: 'StaticResourcesPlugin.setsHeader.to.image/svg+xml.in.case.of.svg',
	test		: ( done ) => {
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.svg' );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'] } );
		staticResourcesPlugin.setServerOnRuntime( new Server() );

		let router	= new Router();
		let called	= 0;

		let pluginMiddlewares		= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => {
				called	++;

				return eventRequest;
			},
			with			: [
				['Cache-control', 'public, max-age=604800, immutable'],
				['Content-Type', 'image/svg+xml'],
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		setTimeout(() => {
			assert.equal( 2, called );

			done();
		}, 50 );
	}
});

test({
	message		: 'StaticResourcesPlugin.with.cache.control.when.empty',
	test		: ( done ) => {
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.svg' );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'], cacheControl : {} } );
		staticResourcesPlugin.setServerOnRuntime( new Server() );

		let router	= new Router();
		let called	= 0;

		let pluginMiddlewares		= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: function(){
				called++;

				return eventRequest;
			},
			with			: [
				['Cache-control', 'public, max-age=604800, immutable'],
				['Content-Type', 'image/svg+xml'],
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		setTimeout(() => {
			assert.equal( 2, called );

			done();
		}, 50 );
	}
});

test({
	message		: 'StaticResourcesPlugin.with.cache.control.when.given',
	test		: ( done ) => {
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.svg' );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'], cache : { cacheControl: 'public', other: 'no-transform' } } );
		staticResourcesPlugin.setServerOnRuntime( new Server() );

		let router	= new Router();
		let called	= 0;

		let pluginMiddlewares		= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => {
				called	++;

				return eventRequest;
			},
			with			: [
				['Cache-control', 'public, no-transform'],
				['Content-Type', 'image/svg+xml'],
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.equal( 2, called );

		done();
	}
});

test({
	message		: 'StaticResourcesPlugin.with.useEtag.when.given',
	test		: ( done ) => {
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.svg' );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'], cache : {}, useEtag: true } );
		staticResourcesPlugin.setServerOnRuntime( new Server() );

		let router	= new Router();
		let called	= 0;

		let pluginMiddlewares		= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => {
				called	++;

				return eventRequest;
			},
			with			: [
				['ETag', strongHash],
				['Content-Type', 'image/svg+xml'],
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.deepStrictEqual( 2, called );

		done();
	}
});

test({
	message		: 'StaticResourcesPlugin.with.useEtag.when.given.with.if-none-match',
	test		: ( done ) => {
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.svg', { 'if-none-match': strongHash } );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'], cache : {}, useEtag: true } );
		staticResourcesPlugin.setServerOnRuntime( new Server() );

		let router				= new Router();
		let called				= 0;
		let sendCalled			= 0;

		let pluginMiddlewares	= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => {
				called	++;

				return eventRequest;
			},
			with			: [
				['ETag', strongHash],
			]
		});

		eventRequest._mock({
			method			: 'send',
			shouldReturn	: () => {
				sendCalled	++;

				return eventRequest;
			},
			with			: [
				['', 304],
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.deepStrictEqual( 1, called );
		assert.deepStrictEqual( 1, sendCalled );

		done();
	}
});

test({
	message		: 'StaticResourcesPlugin.with.useEtag.when.given.and.strong.is.false',
	test		: ( done ) => {
		let eventRequest			= helpers.getEventRequest( 'GET', '/tests/fixture/test.svg' );
		let staticResourcesPlugin	= new StaticResourcesPlugin( 'id', { paths : ['tests'], cache : {}, useEtag: true, strong: false } );
		staticResourcesPlugin.setServerOnRuntime( new Server() );

		let router				= new Router();
		let called				= 0;

		let pluginMiddlewares	= staticResourcesPlugin.getPluginMiddleware();

		assert.equal( 1, pluginMiddlewares.length );

		router.add( pluginMiddlewares[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: () => {
				called	++;

				return eventRequest;
			},
			with			: [
				['ETag', weakHash],
				['Content-Type', 'image/svg+xml'],
			]
		});

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		assert.deepStrictEqual( 2, called );

		done();
	}
});
