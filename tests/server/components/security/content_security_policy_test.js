'use strict';

// Dependencies
const { assert, test }			= require( '../../../test_helper' );
const CSP						= require( './../../../../server/components/security/content_security_policy' );

const HEADER_NAME				= 'Content-Security-Policy';
const REPORT_ONLY_HEADER_NAME	= 'Content-Security-Policy-Report-Only';

const XSS_EXPECTED_HEADER		= "default-src 'none'; script-src 'self'; img-src 'self'; font-src 'self'; style-src 'self'; connect-src 'self'; child-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests;";
const XSS_EXPECTED_DIRECTIVES	= {
	'default-src': ["'none'"],
	'script-src': ["'self'"],
	'img-src': ["'self'"],
	'font-src': ["'self'"],
	'style-src': ["'self'"],
	'connect-src': ["'self'"],
	'child-src': ["'self'"],
	'media-src': ["'self'"],
	'manifest-src': ["'self'"],
	'object-src': ["'self'"],
	'frame-ancestors': ["'self'"],
	'base-uri': ["'self'"],
	'upgrade-insecure-requests': [],
};

test({
	message	: 'CSP.constructorOnDefault',
	test	: ( done )=>{
		const csp					= new CSP();

		assert.deepStrictEqual( csp.directives, XSS_EXPECTED_DIRECTIVES );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		done();
	}
});

test({
	message			: 'CSP.constructorOnDifferentOptions',
	dataProvider	: [
		[
			{ xss: true },
			XSS_EXPECTED_DIRECTIVES,
			false,
			true,
			HEADER_NAME,
			XSS_EXPECTED_HEADER
		],
		[
			{ xss: false, self: true },
			{ 'default-src': ["'self'"] },
			false,
			true,
			HEADER_NAME,
			"default-src 'self';"
		],
		[
			{ xss: false, sandbox: true },
			{ 'sandbox': [] },
			false,
			true,
			HEADER_NAME,
			'sandbox;'
		],
		[
			{ xss: true, sandbox: true },
			{ ...XSS_EXPECTED_DIRECTIVES, ...{ sandbox: [] } },
			false,
			true,
			HEADER_NAME,
			`${XSS_EXPECTED_HEADER} sandbox;`
		],
		[
			{ xss: false, reportUri: '/someUrl' },
			{ 'report-uri': ['/someUrl'] },
			true,
			true,
			REPORT_ONLY_HEADER_NAME,
			`report-uri /someUrl;`
		],
		[
			{ xss: false, reportUri: 'someGroup', useReportTo: true },
			{ 'report-to': ['someGroup'] },
			true,
			true,
			REPORT_ONLY_HEADER_NAME,
			`report-to someGroup;`
		],
		[
			{ xss: false, useReportTo: true },
			{},
			false,
			true,
			HEADER_NAME,
			``
		],
		[
			{ xss: false, self: true },
			{ 'default-src': ["'self'"]},
			false,
			true,
			HEADER_NAME,
			`default-src 'self';`
		],
		[
			{ xss: true, self: true, sandbox: true, reportUri: '/uri', useReportTo: true },
			{ ...XSS_EXPECTED_DIRECTIVES, ...{ sandbox: [], 'default-src': ["'none'", "'self'"], 'report-to': ['/uri'] } },
			true,
			true,
			REPORT_ONLY_HEADER_NAME,
			`report-to /uri; default-src 'none' 'self'; script-src 'self'; img-src 'self'; font-src 'self'; style-src 'self'; connect-src 'self'; child-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests; sandbox;`
		],
		[
			{ enabled: false, xss: true, self: true, sandbox: true, reportUri: '/uri', useReportTo: true },
			{ ...XSS_EXPECTED_DIRECTIVES, ...{ sandbox: [], 'default-src': ["'none'", "'self'"], 'report-to': ['/uri'] } },
			true,
			false,
			REPORT_ONLY_HEADER_NAME,
			``
		],
		[
			{ enabled: true, xss: true, self: true, sandbox: true, reportUri: '/uri', useReportTo: true },
			{ ...XSS_EXPECTED_DIRECTIVES, ...{ sandbox: [], 'default-src': ["'none'", "'self'"], 'report-to': ['/uri'] } },
			true,
			true,
			REPORT_ONLY_HEADER_NAME,
			`report-to /uri; default-src 'none' 'self'; script-src 'self'; img-src 'self'; font-src 'self'; style-src 'self'; connect-src 'self'; child-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests; sandbox;`
		],
		[
			{ enabled: false },
			XSS_EXPECTED_DIRECTIVES,
			false,
			false,
			HEADER_NAME,
			``
		],
		[
			{ xss: true, directives: { sandbox: [], 'script-src': ['example.com'], 'base-uri':['example.com'] } },
			{ ...XSS_EXPECTED_DIRECTIVES, ...{ 'base-uri': ["example.com", "'self'"], 'script-src': ["example.com", "'self'"], sandbox: [] } },
			false,
			true,
			HEADER_NAME,
			`sandbox; script-src example.com 'self'; base-uri example.com 'self'; default-src 'none'; img-src 'self'; font-src 'self'; style-src 'self'; connect-src 'self'; child-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'self'; frame-ancestors 'self'; upgrade-insecure-requests;`
		],
		[
			{ enabled: false, xss: true, directives: { sandbox: [], 'script-src': ['example.com'], 'base-uri':['example.com'] } },
			{ ...XSS_EXPECTED_DIRECTIVES, ...{ 'base-uri': ["example.com", "'self'"], 'script-src': ["example.com", "'self'"], sandbox: [] } },
			false,
			false,
			HEADER_NAME,
			``
		],
	],
	test			: ( done, options, expectedDirectives, expectedReportOnly, expectedEnabled, expectedHeaderName, expectedHeader )=>{
		const csp	= new CSP( options );

		assert.deepStrictEqual( csp.directives, expectedDirectives );
		assert.equal( csp.reportOnly, expectedReportOnly );
		assert.equal( csp.enabled, expectedEnabled );

		assert.equal( csp.getHeader(), expectedHeaderName );
		assert.equal( csp.build(), expectedHeader );

		done();
	}
});

test({
	message	: 'CSP.xssEnablesXssIfInitiallyItWasOff',
	test	: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= XSS_EXPECTED_HEADER;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.xss();

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message	: 'CSP.xssEnablesXssIfInitiallyItWasOffTwice',
	test	: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= XSS_EXPECTED_HEADER;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.xss();
		csp.xss();

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message	: 'CSP.xssDoesNothingIfInitiallyItWasOn',
	test	: ( done )=>{
		const csp					= new CSP( { xss: true } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= XSS_EXPECTED_HEADER;

		assert.deepStrictEqual( csp.directives, XSS_EXPECTED_DIRECTIVES );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.xss();

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message	: 'CSP.xssDoesNothingIfInitiallyItWasOnTwice',
	test	: ( done )=>{
		const csp					= new CSP( { xss: true } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= XSS_EXPECTED_HEADER;

		assert.deepStrictEqual( csp.directives, XSS_EXPECTED_DIRECTIVES );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.xss();
		csp.xss();

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.allowPluginTypeWithValidMimeType',
	dataProvider	: [
		['application/json'],
		['application/*'],
		['text/html'],
		['text/css']
	],
	test			: ( done, mimeType )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `plugin-types ${mimeType};`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.allowPluginType( mimeType );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.allowPluginTypeWithValidMimeTypeTwice',
	dataProvider	: [
		['application/json'],
		['application/*'],
		['text/html'],
		['text/css']
	],
	test			: ( done, mimeType )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `plugin-types ${mimeType};`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.allowPluginType( mimeType );
		csp.allowPluginType( mimeType );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.allowPluginTypeWithInvalidMimeType',
	dataProvider	: [
		['application'],
		['json'],
		['/'],
		['application/json+text'],
		['application/json!'],
		['application/json#']
	],
	test			: ( done, mimeType )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= '';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.allowPluginType( mimeType );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setEnabledEnablesIfDisabled',
	test			: ( done )=>{
		const csp					= new CSP( { enabled: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= XSS_EXPECTED_HEADER;

		assert.deepStrictEqual( csp.directives, XSS_EXPECTED_DIRECTIVES );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, false );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.setEnabled( true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setEnabledDoesNothingIfAlreadyEnabled',
	test			: ( done )=>{
		const csp					= new CSP( { enabled: true } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= XSS_EXPECTED_HEADER;

		assert.deepStrictEqual( csp.directives, XSS_EXPECTED_DIRECTIVES );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.setEnabled( true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setEnabledDoesNothingIfAlreadyEnabledTwice',
	test			: ( done )=>{
		const csp					= new CSP( { enabled: true } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= XSS_EXPECTED_HEADER;

		assert.deepStrictEqual( csp.directives, XSS_EXPECTED_DIRECTIVES );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.setEnabled( true );
		csp.setEnabled( true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setReportOnly',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= REPORT_ONLY_HEADER_NAME;
		const expectedHeader		= 'report-uri /testUri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.setReportOnly( '/testUri' );

		assert.equal( csp.reportOnly, true );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setReportOnlyTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= REPORT_ONLY_HEADER_NAME;
		const expectedHeader		= 'report-uri /testUri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.setReportOnly( '/testUri' );
		csp.setReportOnly( '/testUri' );

		assert.equal( csp.reportOnly, true );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setReportOnlyWithItAlreadyEnabled',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false, reportUri: '/someUri' } );
		const expectedHeaderName	= REPORT_ONLY_HEADER_NAME;
		const expectedHeader		= 'report-uri /someUri /testUri;';

		assert.deepStrictEqual( csp.directives, { 'report-uri': ['/someUri'] } );
		assert.equal( csp.reportOnly, true );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), 'report-uri /someUri;' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.setReportOnly( '/testUri' );

		assert.equal( csp.reportOnly, true );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setReportOnlyWithInvalidUri',
	dataProvider	: [
		[123],
		[[]],
		[null],
		[undefined],
		[{}],
		[false],
		[''],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= '';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.setReportOnly( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setReportOnlyWithReportTo',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= REPORT_ONLY_HEADER_NAME;
		const expectedHeader		= 'report-to /testUri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.setReportOnlyWithReportTo( '/testUri' );

		assert.equal( csp.reportOnly, true );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setReportOnlyWithReportToTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= REPORT_ONLY_HEADER_NAME;
		const expectedHeader		= 'report-to /testUri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.setReportOnlyWithReportTo( '/testUri' );
		csp.setReportOnlyWithReportTo( '/testUri' );

		assert.equal( csp.reportOnly, true );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setReportOnlyWithReportToWithAlreadyEnabled',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false, reportUri: '/someUri', useReportTo: true } );
		const expectedHeaderName	= REPORT_ONLY_HEADER_NAME;
		const expectedHeader		= 'report-to /someUri /testUri;';

		assert.deepStrictEqual( csp.directives, { 'report-to': ['/someUri'] } );
		assert.equal( csp.reportOnly, true );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), 'report-to /someUri;' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.setReportOnlyWithReportTo( '/testUri' );

		assert.equal( csp.reportOnly, true );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.setReportOnlyWithReportToWithInvalidUri',
	dataProvider	: [
		[123],
		[[]],
		[null],
		[undefined],
		[{}],
		[false],
		[''],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= '';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.setReportOnlyWithReportTo( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.enableSandbox',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'sandbox;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.enableSandbox();

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.enableSandboxTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'sandbox;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.enableSandbox();
		csp.enableSandbox();

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.enableSandboxWhenAlreadyEnabled',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false, sandbox: true } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'sandbox;';

		assert.deepStrictEqual( csp.directives, { sandbox: [] } );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.enableSandbox();

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.upgradeInsecureRequests',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'upgrade-insecure-requests;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.upgradeInsecureRequests();

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.upgradeInsecureRequestsTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'upgrade-insecure-requests;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.upgradeInsecureRequests();
		csp.upgradeInsecureRequests();

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.allowSandboxValue',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'sandbox allow-scripts allow-same-origin;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.allowSandboxValue( 'allow-scripts' );
		csp.allowSandboxValue( 'allow-same-origin' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.allowSandboxValueTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'sandbox allow-scripts allow-same-origin;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.allowSandboxValue( 'allow-scripts' );
		csp.allowSandboxValue( 'allow-scripts' );
		csp.allowSandboxValue( 'allow-same-origin' );
		csp.allowSandboxValue( 'allow-same-origin' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addBaseUri',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'base-uri /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addBaseUri( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addBaseUriWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, baseUri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `base-uri '${baseUri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addBaseUri( baseUri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addBaseUriWithSpecialCasesTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, baseUri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `base-uri '${baseUri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addBaseUri( baseUri );
		csp.addBaseUri( baseUri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addBaseUriTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'base-uri /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addBaseUri( '/some/uri' );
		csp.addBaseUri( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.restrictFormActionUrl',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'form-action /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.restrictFormActionUrl( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.restrictFormActionUrlWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, baseUri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `form-action '${baseUri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.restrictFormActionUrl( baseUri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.restrictFormActionUrlTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, baseUri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `form-action '${baseUri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.restrictFormActionUrl( baseUri );
		csp.restrictFormActionUrl( baseUri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.restrictFormActionUrlTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'form-action /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.restrictFormActionUrl( '/some/uri' );
		csp.restrictFormActionUrl( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFrameAncestors',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'frame-ancestors /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFrameAncestors( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFrameAncestorsWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `frame-ancestors '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFrameAncestors( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFrameAncestorsWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `frame-ancestors '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFrameAncestors( uri );
		csp.addFrameAncestors( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFrameAncestorsTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'frame-ancestors /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFrameAncestors( '/some/uri' );
		csp.addFrameAncestors( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addScriptSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'script-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addScriptSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addScriptSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `script-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addScriptSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addScriptSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `script-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addScriptSrc( uri );
		csp.addScriptSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addScriptSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'script-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addScriptSrc( '/some/uri' );
		csp.addScriptSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addImgSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'img-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addImgSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addImgSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `img-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addImgSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addImgSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `img-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addImgSrc( uri );
		csp.addImgSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addImgSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'img-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addImgSrc( '/some/uri' );
		csp.addImgSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addChildSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'child-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addChildSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addChildSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `child-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addChildSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addChildSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `child-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addChildSrc( uri );
		csp.addChildSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addChildSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'child-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addChildSrc( '/some/uri' );
		csp.addChildSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addConnectSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'connect-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addConnectSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addConnectSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `connect-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addConnectSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addConnectSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `connect-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addConnectSrc( uri );
		csp.addConnectSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addConnectSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'connect-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addConnectSrc( '/some/uri' );
		csp.addConnectSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addDefaultSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'default-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addDefaultSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addDefaultSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `default-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addDefaultSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addDefaultSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `default-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addDefaultSrc( uri );
		csp.addDefaultSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addDefaultSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'default-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addDefaultSrc( '/some/uri' );
		csp.addDefaultSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFontSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'font-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFontSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFontSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `font-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFontSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFontSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `font-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFontSrc( uri );
		csp.addFontSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFontSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'font-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFontSrc( '/some/uri' );
		csp.addFontSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFrameSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'frame-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFrameSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFrameSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `frame-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFrameSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFrameSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `frame-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFrameSrc( uri );
		csp.addFrameSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addFrameSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'frame-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addFrameSrc( '/some/uri' );
		csp.addFrameSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addManifestSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'manifest-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addManifestSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addManifestSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `manifest-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addManifestSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addManifestSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `manifest-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addManifestSrc( uri );
		csp.addManifestSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addManifestSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'manifest-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addManifestSrc( '/some/uri' );
		csp.addManifestSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addMediaSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'media-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addMediaSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addMediaSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `media-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addMediaSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addMediaSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `media-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addMediaSrc( uri );
		csp.addMediaSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addMediaSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'media-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addMediaSrc( '/some/uri' );
		csp.addMediaSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addObjectSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'object-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addObjectSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addObjectSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `object-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addObjectSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addObjectSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `object-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addObjectSrc( uri );
		csp.addObjectSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addObjectSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'object-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addObjectSrc( '/some/uri' );
		csp.addObjectSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addStyleSrc',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'style-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addStyleSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addStyleSrcWithSpecialCases',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `style-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addStyleSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addStyleSrcWithSpecialCaseTwice',
	dataProvider	: [
		['self'],
		['unsafe-eval'],
		['unsafe-hashes'],
		['unsafe-inline'],
		['none'],
	],
	test			: ( done, uri )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= `style-src '${uri}';`;

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addStyleSrc( uri );
		csp.addStyleSrc( uri );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.addStyleSrcTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= 'style-src /some/uri;';

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.addStyleSrc( '/some/uri' );
		csp.addStyleSrc( '/some/uri' );

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.enableSelf',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= "default-src 'self';";

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.enableSelf();

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.enableSelfTwice',
	test			: ( done )=>{
		const csp					= new CSP( { xss: false } );
		const expectedHeaderName	= HEADER_NAME;
		const expectedHeader		= "default-src 'self';";

		assert.deepStrictEqual( csp.directives, {} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), '' );
		assert.equal( csp.getHeader(), expectedHeaderName );

		csp.enableSelf();

		assert.equal( csp.reportOnly, false );
		assert.equal( csp.build(), expectedHeader );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});

test({
	message			: 'CSP.buildWithComplexDirectives',
	test			: ( done )=>{
		const csp					= new CSP( { xss: true, self: true } );
		const expectedHeaderName	= REPORT_ONLY_HEADER_NAME;

		assert.deepStrictEqual( csp.directives, { ...XSS_EXPECTED_DIRECTIVES, ...{'default-src': ["'none'", "'self'"]}} );
		assert.equal( csp.reportOnly, false );
		assert.equal( csp.enabled, true );

		assert.equal( csp.build(), "default-src 'none' 'self'; script-src 'self'; img-src 'self'; font-src 'self'; style-src 'self'; connect-src 'self'; child-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests;" );
		assert.equal( csp.getHeader(), HEADER_NAME );

		csp.addFontSrc( 'https://example.com' );
		csp.addFontSrc( 'https://example.com' );
		csp.addFontSrc( "'sha256-aba268bb8a52ab6c8cba258cba251254'" );

		csp.addScriptSrc( 'https://example.com' );
		csp.addScriptSrc( 'none' );
		csp.addScriptSrc( 'unsafe-eval' );

		csp.xss();

		csp.enableSelf();
		csp.enableSandbox();
		csp.allowSandboxValue( 'allow-forms' );

		csp.setReportOnlyWithReportTo( '/URI' );
		csp.setReportOnlyWithReportTo( '/URI' );

		assert.equal( csp.reportOnly, true );
		assert.equal( csp.build(), "default-src 'none' 'self'; script-src 'self' https://example.com 'none' 'unsafe-eval'; img-src 'self'; font-src 'self' https://example.com 'sha256-aba268bb8a52ab6c8cba258cba251254'; style-src 'self'; connect-src 'self'; child-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests; sandbox allow-forms; report-to /URI;" );
		assert.equal( csp.getHeader(), expectedHeaderName );

		done();
	}
});
