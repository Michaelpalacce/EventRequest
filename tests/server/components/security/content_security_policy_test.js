'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
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
