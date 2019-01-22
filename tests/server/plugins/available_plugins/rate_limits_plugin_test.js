'use strict';

// Dependencies
const { assert, test, helpers, Mock }	= require( '../../../test_helper' );
const RateLimitsPlugin					= require( '../../../../server/plugins/available_plugins/rate_limits_plugin' );
const path								= require( 'path' );
const fs								= require( 'fs' );

const PROJECT_ROOT						= path.parse( require.main.filename ).dir;
const FILE_LOCATION						= path.join( PROJECT_ROOT, 'rate_limits.json' );

test({
	message	: 'RateLimitsPlugin.constructor does not throw',
	test	: ( done )=>{
		new RateLimitsPlugin( 'id', {} );
		done();
	}
});

test({
	message	: 'RateLimitsPlugin.constructor defaults',
	test	: ( done )=>{
		let plugin	= new RateLimitsPlugin( 'id', {} );

		assert.deepStrictEqual( [], plugin.rules );
		assert.deepStrictEqual( 100, plugin.rateLimit );
		assert.deepStrictEqual( 60000, plugin.interval );
		assert.deepStrictEqual( 'Rate limit reached', plugin.limitReachedMessage );
		assert.deepStrictEqual( 403, plugin.limitReachedStatusCode );
		assert.deepStrictEqual( FILE_LOCATION, plugin.fileLocation );

		done();
	}
});

test({
	message	: 'RateLimitsPlugin.loadConfig creates the config if it does not exist',
	test	: ( done )=>{
		let plugin		= new RateLimitsPlugin( 'id', {} );
		let expected	= {
			'rate_limit'	: 100,
			'interval'		: 60000,
			'message'		: 'Rate limit reached',
			'status_code'	: 403,
			'rules'			: []
		};
		plugin.loadConfig();

		setTimeout(()=>{
			assert.equal( true, fs.existsSync( plugin.fileLocation ) );

			let readStream	= fs.createReadStream( plugin.fileLocation );
			let chunks		= [];

			readStream.on( 'error', ( err ) => {
				throw new Error( err );
			});

			readStream.on( 'data', ( chunk ) => {
				chunks.push( chunk );
			});

			readStream.on( 'close', () => {
				let config	= JSON.parse( Buffer.concat( chunks ).toString( 'utf-8' ) );

				assert.deepStrictEqual( expected, config );

				fs.unlink( plugin.fileLocation, ()=>{
					done();
				} );
			});
		}, 200 );
	}
});
test({
	message	: 'RateLimitsPlugin.loadConfig reads the config if it exists',
	test	: ( done )=>{
		let file		= path.resolve( __dirname, './fixture/rate_limits.json' );
		let plugin		= new RateLimitsPlugin( 'id', { file } );
		plugin.loadConfig();

		// Wait for the file to be read
		setTimeout(()=>{
			assert.equal( true, fs.existsSync( plugin.fileLocation ) );

			assert.deepStrictEqual( 50, plugin.rateLimit );
			assert.deepStrictEqual( 100, plugin.interval );
			assert.deepStrictEqual( 'test', plugin.limitReachedMessage );
			assert.deepStrictEqual( 200, plugin.limitReachedStatusCode );
			assert.deepStrictEqual( file, plugin.fileLocation );
			assert.deepStrictEqual( [{"path": "/" }], plugin.rules );

			done();
		}, 100 );
	}
});

test({
	message	: 'RateLimitsPlugin.setServerOnRuntime attaches an event for eventRequestResolved',
	test	: ( done )=>{
		let file		= path.resolve( __dirname, './fixture/rate_limits.json' );
		let plugin		= new RateLimitsPlugin( 'id', { file } );
		let MockServer	= Mock( helpers.getServer().constructor );
		let server		= new MockServer();
		let called		= false;

		server._mock({
			method			: 'on',
			shouldReturn	: ()=>{
				called	= true;
			},
			called			: 1,
			with			: [
				['eventRequestResolved', undefined]
			]
		});

		plugin.setServerOnRuntime( server );

		called === true ? done() : done( 'eventRequestResolved should have been attached to the server but was not' );
	}
});

test({
	message	: 'RateLimitsPlugin.setServerOnRuntime eventRequestResolved checks if it should be passed or not',
	test	: ( done )=>{
		let file			= path.resolve( __dirname, './fixture/default_rate_limits.json' );
		let plugin			= new RateLimitsPlugin( 'id', { file } );
		let MockServer		= Mock( helpers.getServer().constructor );
		let eventRequest	= helpers.getEventRequest( undefined, '/' );
		let request			= eventRequest.request;
		let response		= eventRequest.response;
		let server			= new MockServer();

		eventRequest.setBlock( [{}, {}, {}] );

		plugin.setServerOnRuntime( server );

		setTimeout(()=>{
			server.emit( 'eventRequestResolved', { eventRequest, request, response } );
			server.emit( 'eventRequestBlockSet', { eventRequest, block: [] } );

			assert.equal( 3, eventRequest.block.length );

			for ( let i = 0; i < 101; ++ i )
			{
				server.emit( 'eventRequestResolved', { eventRequest, request, response } );
				server.emit( 'eventRequestBlockSet', { eventRequest, block: [] } );

				if ( i < 99 )
				{
					assert.equal( 3, eventRequest.block.length );
				}
				else
				{
					assert.equal( 1, eventRequest.block.length );
				}
			}

			done();
		}, 250 );
	}
});

test({
	message	: 'RateLimitsPlugin.setServerOnRuntime eventRequestResolved checks if it should be passed or not with different methods',
	test	: ( done )=>{
		let file				= path.resolve( __dirname, './fixture/default_rate_limits.json' );
		let plugin				= new RateLimitsPlugin( 'id', { file } );
		let MockServer			= Mock( helpers.getServer().constructor );
		let eventRequest		= helpers.getEventRequest( 'GET', '/' );
		let eventRequestPost	= helpers.getEventRequest( 'POST', '/' );
		let request				= eventRequest.request;
		let response			= eventRequest.response;
		let server				= new MockServer();

		eventRequest.setBlock( [{}, {}, {}] );
		eventRequestPost.setBlock( [{}, {}, {}] );

		plugin.setServerOnRuntime( server );

		setTimeout(()=>{
			server.emit( 'eventRequestResolved', { eventRequest, request, response } );
			server.emit( 'eventRequestBlockSet', { eventRequest, block: [] } );

			server.emit( 'eventRequestResolved', { eventRequest : eventRequestPost, request, response } );
			server.emit( 'eventRequestBlockSet', { eventRequest : eventRequestPost, block: [] } );

			assert.equal( 3, eventRequest.block.length );

			for ( let i = 0; i < 100; ++ i )
			{
				server.emit( 'eventRequestResolved', { eventRequest, request, response } );
				server.emit( 'eventRequestBlockSet', { eventRequest, block: [] } );

				if ( i < 99 )
				{
					assert.equal( 3, eventRequest.block.length );
				}
				else
				{
					assert.equal( 1, eventRequest.block.length );
				}
			}

			for ( let i = 0; i < 1000; ++ i )
			{
				server.emit( 'eventRequestResolved', { eventRequest : eventRequestPost, request, response } );
				server.emit( 'eventRequestBlockSet', { eventRequest : eventRequestPost, block: [] } );

				if ( i < 99 )
				{
					assert.equal( 3, eventRequestPost.block.length );
				}
				else
				{
					assert.equal( 1, eventRequestPost.block.length );
				}
			}

			done();
		}, 250 );
	}
});

test({
	message			: 'RateLimitsPlugin getRequestRate',
	dataProvider	: [
		['GET', '/', [], 5, 10000, 4, true],
		['GET', '/', [], 0, 10000, 100, true],
		['GET', '/', [], 5, 10000, 5, false],
		['GET', '/test', [], 5, 10000, 5, false],
		['GET', '/', [{path:'/test','rate_limit':2,interval:1000}], 0, 10000, 10, true],
		['GET', '/test2', [{path:'/test','rate_limit':2,interval:1000},{path:'/test2','rate_limit':10,interval:10}], 0, 10000, 11, true],
	],
	test			: ( done, method, route, rules, rateLimit, interval, callRequest, expectedShouldLimit )=>{
		let file									= path.resolve( __dirname, './fixture/rate_limits.json' );
		let eventRequest							= helpers.getEventRequest( method, route );
		let rateLimitsPlugin						= new RateLimitsPlugin( 'id', { file } );
		let MockServer								= Mock( helpers.getServer().constructor );
		let request									= eventRequest.request;
		let response								= eventRequest.response;
		let server									= new MockServer();

		rateLimitsPlugin.setServerOnRuntime( server );

		setTimeout(()=>{
			rateLimitsPlugin.rules						= rules;
			rateLimitsPlugin.rateLimit					= rateLimit;
			rateLimitsPlugin.interval					= interval;

			for ( let i = 0; i < callRequest; ++ i )
			{
				server.emit( 'eventRequestResolved', { eventRequest, request, response } );
			}

			let shouldLimit			= rateLimitsPlugin.getRequestRate( eventRequest );

			assert.equal( expectedShouldLimit, shouldLimit );

			done();
		}, 100 );
	}
});
