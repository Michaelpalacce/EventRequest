'use strict';

// Dependencies
const { assert, test }	= require( '../../../test_helper' );
const HSTS				= require( './../../../../server/components/security/http_strict_transport_security' );

const HEADER_NAME		= 'Strict-Transport-Security';

test({
	message	: 'HSTS.constructorOnDefaults',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000;' );

		done();
	}
});

test({
	message	: 'HSTS.setMaxAge',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.setMaxAge( 300 );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=300;' );

		done();
	}
});

test({
	message	: 'HSTS.setMaxAgeTwice',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.setMaxAge( 300 );
		hsts.setMaxAge( 300 );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=300;' );

		done();
	}
});

test({
	message	: 'HSTS.setMaxAgeTwiceWithDifferentValues',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.setMaxAge( 300 );
		hsts.setMaxAge( 600 );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=600;' );

		done();
	}
});

test({
	message	: 'HSTS.setMaxAgeWithInvalidData',
	dataProvider	: [
		[false],
		[null],
		['123'],
		[{}],
		[[]],
		[[1]],
		[undefined],
	],
	test	: ( done, data ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.setMaxAge( data );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000;' );

		done();
	}
});

test({
	message	: 'HSTS.preload',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.preload();

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000; preload;' );

		done();
	}
});

test({
	message	: 'HSTS.preloadTwice',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.preload();
		hsts.preload();

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000; preload;' );

		done();
	}
});

test({
	message	: 'HSTS.preloadTwiceWithDifferentValues',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.preload();
		hsts.preload( false );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000;' );

		done();
	}
});

test({
	message	: 'HSTS.preloadWithInvalidData',
	dataProvider	: [
		[123],
		[null],
		['123'],
		[{}],
		[[]],
		[[1]],
	],
	test	: ( done, data ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.preload( data );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000;' );

		done();
	}
});

test({
	message	: 'HSTS.includeSubDomains',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.includeSubDomains();

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000; includeSubDomains;' );

		done();
	}
});

test({
	message	: 'HSTS.includeSubDomainsTwice',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.includeSubDomains();
		hsts.includeSubDomains();

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000; includeSubDomains;' );

		done();
	}
});

test({
	message	: 'HSTS.includeSubDomainsTwiceWithDifferentValues',
	test	: ( done ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.includeSubDomains();
		hsts.includeSubDomains( false );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000;' );

		done();
	}
});

test({
	message	: 'HSTS.includeSubDomainsWithInvalidData',
	dataProvider	: [
		[123],
		[null],
		['123'],
		[{}],
		[[]],
		[[1]],
	],
	test	: ( done, data ) => {
		const hsts	= new HSTS();

		assert.equal( hsts.enabled, true );
		assert.equal( hsts.maxAge, 31536000 );
		assert.equal( hsts.doPreload, false );
		assert.equal( hsts.doIncludeSubDomains, false );

		hsts.includeSubDomains( data );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), 'max-age=31536000;' );

		done();
	}
});

test({
	message	: 'HSTS.constructorWithDifferentArguments',
	dataProvider	: [
		[
			{ enabled: true },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ enabled: false },
			false,
			31536000,
			false,
			false,
			''
		],
		[
			{ enabled: false, maxAge: 300, preload: true, includeSubDomains: true },
			false,
			300,
			true,
			true,
			''
		],
		[
			{ maxAge: 300, preload: true, includeSubDomains: true },
			true,
			300,
			true,
			true,
			'max-age=300; includeSubDomains; preload;'
		],
		[
			{ maxAge: 300, preload: true, includeSubDomains: false },
			true,
			300,
			true,
			false,
			'max-age=300; preload;'
		],
		[
			{ maxAge: null },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ maxAge: undefined },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ maxAge: [] },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ maxAge: {} },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ maxAge: '123' },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ preload: '123' },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ preload: null },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ preload: 1 },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ preload: {} },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ preload: [] },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ preload: [true] },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ includeSubDomains: [true] },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ includeSubDomains: [] },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ includeSubDomains: {} },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ includeSubDomains: null },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ includeSubDomains: undefined },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ includeSubDomains: 'string' },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		],
		[
			{ includeSubDomains: 1 },
			true,
			31536000,
			false,
			false,
			'max-age=31536000;'
		]
	],
	test	: ( done, options, expectedEnabled, expectedMaxAge, expectedDoPreload, expectedDoIncludeSubDomains, expectedResult ) => {
		const hsts	= new HSTS( options );

		assert.equal( hsts.enabled, expectedEnabled );
		assert.equal( hsts.maxAge, expectedMaxAge );
		assert.equal( hsts.doPreload, expectedDoPreload );
		assert.equal( hsts.doIncludeSubDomains, expectedDoIncludeSubDomains );

		assert.equal( hsts.getHeader(), HEADER_NAME );
		assert.equal( hsts.build(), expectedResult );

		done();
	}
});
