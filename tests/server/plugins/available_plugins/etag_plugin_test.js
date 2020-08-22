'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const crypto					= require( 'crypto' );
const fs						= require( 'fs' );
const path						= require( 'path' );
const EtagPlugin				= require( '../../../../server/plugins/available_plugins/etag_plugin' );

const fileStats					= fs.statSync( path.join( __dirname, './fixture/etag_test_file' ) );
// In linux hashes are calculated differently
const strongHash				= `"${crypto.createHash( 'sha1' ).update( `${fileStats.mtimeMs.toString()}-${fileStats.size.toString()}` ).digest( 'hex' )}"`;
const weakHash					= `W/"${crypto.createHash( 'md5' ).update( `${fileStats.mtimeMs.toString()}-${fileStats.size.toString()}` ).digest( 'hex' )}"`;

test({
	message	: 'EtagPlugin.constructor.on.defaults',
	test	: ( done ) => {
		const plugin	= new EtagPlugin();

		assert.deepStrictEqual( plugin.pluginId, undefined );
		assert.deepStrictEqual( plugin.options, {} );
		assert.deepStrictEqual( plugin.strong, true );

		done();
	}
});

test({
	message	: 'EtagPlugin.constructor.on.custom.params',
	test	: ( done ) => {
		const options	= { strong: false };
		const plugin	= new EtagPlugin( 'id', options );

		assert.deepStrictEqual( plugin.pluginId, 'id' );
		assert.deepStrictEqual( plugin.options, options );
		assert.deepStrictEqual( plugin.strong, false );

		done();
	}
});

test({
	message	: 'EtagPlugin.setOptions.on.custom.params',
	test	: ( done ) => {
		const options	= { strong: false };
		const plugin	= new EtagPlugin( 'id' );

		assert.deepStrictEqual( plugin.strong, true );
		plugin.setOptions( options )
		assert.deepStrictEqual( plugin.strong, false );

		done();
	}
});

test({
	message	: 'EtagPlugin.setOptions.on.defaults',
	test	: ( done ) => {
		const options	= { strong: false };
		const plugin	= new EtagPlugin( 'id', options );

		assert.deepStrictEqual( plugin.strong, false );
		plugin.setOptions()
		assert.deepStrictEqual( plugin.strong, true );

		done();
	}
});

test({
	message	: 'EtagPlugin.getPluginMiddleware.returns.one.middleware',
	test	: ( done ) => {
		const options	= { strong: false };
		const plugin	= new EtagPlugin( 'id', options );

		assert.deepStrictEqual( Array.isArray( plugin.getPluginMiddleware() ), true );
		assert.deepStrictEqual( plugin.getPluginMiddleware().length, 1 );

		done();
	}
});

const dataProvider	= [
	[undefined, undefined, undefined, {}, undefined, undefined, true],
	[{}, undefined, undefined, {}, undefined, undefined, true],
	[[], undefined, undefined, {}, undefined, undefined, true],
	[
		'TEST',
		200,
		'GET',
		{},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-None-Match': '"not-matching"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-None-Match': '"984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-None-Match': '"not-matching", "984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-None-Match': '"not-matching","984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-None-Match': '*'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-None-Match': '"not-matching"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-None-Match': '"984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-None-Match': '"not-matching", "984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-None-Match': '"not-matching","984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-None-Match': '*'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-None-Match': '"not-matching"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-None-Match': '"984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 412,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-None-Match': '"not-matching", "984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 412,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-None-Match': '"not-matching","984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 412,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-None-Match': '*'},
		undefined,
		{
			code	: 412,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-Match': '"not-matching"'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-Match': '"984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-Match': '"not-matching", "984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-Match': '"not-matching","984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-Match': '*'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-Match': '"not-matching"'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-Match': '"984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-Match': '"not-matching", "984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-Match': '"not-matching","984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'HEAD',
		{ 'If-Match': '*'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-Match': '"not-matching"'},
		undefined,
		{
			code	: 412,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-Match': '"984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-Match': '"not-matching", "984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-Match': '"not-matching","984816fd329622876e14907634264e6f332e9fb3"'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'POST',
		{ 'If-Match': '*'},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{ 'If-Match': '*', 'If-None-Match': '*'},
		undefined,
		{
			code	: 304,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: '',
			pass	: false
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		'TEST',
		200,
		'GET',
		{},
		false,
		{
			code	: 200,
			etag	: 'W/"033bd94b1168d7e4f0d644c3c95e35bf"',
			payload	: 'TEST',
			pass	: true
		},
		false
	],
	[
		Buffer.from( 'TEST' ),
		200,
		'GET',
		{},
		false,
		{
			code	: 200,
			etag	: 'W/"033bd94b1168d7e4f0d644c3c95e35bf"',
			payload	: Buffer.from( 'TEST' ),
			pass	: true
		},
		false
	],
	[
		Buffer.from( 'TEST' ),
		200,
		'GET',
		{},
		undefined,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: Buffer.from( 'TEST' ),
			pass	: true
		},
		false
	],
	[
		Buffer.from( 'TEST' ),
		200,
		'GET',
		{},
		true,
		{
			code	: 200,
			etag	: '"984816fd329622876e14907634264e6f332e9fb3"',
			payload	: Buffer.from( 'TEST' ),
			pass	: true
		},
		false
	],
	[
		'',
		200,
		'GET',
		{},
		undefined,
		{
			code	: 200,
			etag	: '"da39a3ee5e6b4b0d3255bfef95601890afd80709"',
			payload	: '',
			pass	: true
		},
		false
	],
	[
		'',
		200,
		'GET',
		{},
		true,
		{
			code	: 200,
			etag	: '"da39a3ee5e6b4b0d3255bfef95601890afd80709"',
			payload	: '',
			pass	: true
		},
		false
	],
	[
		'',
		200,
		'GET',
		{},
		false,
		{
			code	: 200,
			etag	: 'W/"d41d8cd98f00b204e9800998ecf8427e"',
			payload	: '',
			pass	: true
		},
		false
	],
	[
		fs.statSync( path.join( __dirname, './fixture/etag_test_file' ) ),
		200,
		'GET',
		{},
		undefined,
		{
			shouldSend	: false,
			code		: 200,
			etag		: strongHash,
			payload		: '',
			pass		: true
		},
		false
	],
	[
		fs.statSync( path.join( __dirname, './fixture/etag_test_file' ) ),
		200,
		'GET',
		{},
		true,
		{
			shouldSend	: false,
			code		: 200,
			etag		: strongHash,
			payload		: '',
			pass		: true
		},
		false
	],
	[
		fs.statSync( path.join( __dirname, './fixture/etag_test_file' ) ),
		200,
		'GET',
		{},
		false,
		{
			shouldSend	: false,
			code		: 200,
			etag		: weakHash,
			payload		: '',
			pass		: true
		},
		false
	]
]

test({
	message	: 'EtagPlugin.etag',
	dataProvider,
	test	: ( done, payload, code, reqMethod, reqHeaders, strong, expected, shouldThrow ) => {
		const plugin	= new EtagPlugin( 'id' );

		if ( shouldThrow )
			assert.throws( () => { plugin.etag( payload, strong ); } );
		else
			assert.deepStrictEqual( plugin.etag( payload, strong ), expected.etag );

		done();
	}
});

test({
	message	: 'EtagPlugin.getConditionalResult',
	dataProvider,
	test	: ( done, payload, code, reqMethod, reqHeaders, strong, expected, shouldThrow ) => {
		const eventRequest	= helpers.getEventRequest( reqMethod, undefined, reqHeaders );
		const plugin		= new EtagPlugin( 'id' );

		if ( shouldThrow )
			assert.throws( () => { plugin.getConditionalResult( eventRequest, payload, strong ); } );
		else
		{
			const result	= plugin.getConditionalResult( eventRequest, payload, strong );

			assert.deepStrictEqual( result.pass, expected.pass );
			assert.deepStrictEqual( result.etag, expected.etag );
		}

		done();
	}
});

test({
	message	: 'EtagPlugin.conditionalSend',
	dataProvider,
	test	: ( done, payload, code, reqMethod, reqHeaders, strong, expected, shouldThrow ) => {
		const eventRequest	= helpers.getEventRequest( reqMethod, undefined, reqHeaders );
		const plugin		= new EtagPlugin( 'id' );
		let called			= false;

		if ( typeof expected === 'object' && expected.shouldSend === false )
		{
			done();
			return;
		}

		eventRequest._mock({
			method			: 'send',
			called			: 1,
			shouldReturn	: ( sentPayload, sentCode ) => {
				if ( typeof expected === 'object' )
				{
					assert.deepStrictEqual( sentPayload, expected.payload );
					assert.deepStrictEqual( sentCode, expected.code );
				}

				called	= true;
			}
		})

		plugin.conditionalSend( eventRequest, payload, code, strong );

		assert.deepStrictEqual( called, true );
		done();
	}
});
