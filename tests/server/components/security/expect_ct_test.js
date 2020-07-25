'use strict';

// Dependencies
const { assert, test }	= require( '../../../test_helper' );
const ECT				= require( './../../../../server/components/security/expect_ct' );

const HEADER_NAME		= 'Expect-CT';

test({
	message	: 'ECT.constructorOnDefaults',
	test	: ( done ) => {
		const ect	= new ECT();

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.parseOptions.without.argument.sets.defaults',
	test	: ( done ) => {
		const ect	= new ECT( { maxAge: 100, reportUri: 'some-uri', isEnforce: false } );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=100, enforce, report-uri="some-uri"' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		ect.parseOptions();

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.enforceOnDefault',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.enforce();

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.enforceWithFalse',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.enforce( false );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.enforceWithFalseThenTrue',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.enforce( false );
		ect.enforce( true );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setEnabled',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.setEnabled();

		assert.deepStrictEqual( ect.enabled, true );

		ect.setEnabled( false );

		assert.deepStrictEqual( ect.enabled, false );

		ect.setEnabled();

		assert.deepStrictEqual( ect.enabled, true );

		ect.setEnabled( false );
		ect.setEnabled( 'string' );

		assert.deepStrictEqual( ect.enabled, true );

		done();
	}
});

test({
	message	: 'ECT.enforceTwice',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.enforce();
		ect.enforce();

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.enforceWithWrongData',
	dataProvider	: [
		[false],
		[null],
		['string'],
		[{}],
		[[]]
	],
	test	: ( done, data ) => {
		const ect	= new ECT();

		ect.enforce( false );
		ect.enforce( data );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setReportUriWithString',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.setReportUri( '/test' );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce, report-uri="/test"' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setReportUriWithStringTwice',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.setReportUri( '/test' );
		ect.setReportUri( '/test' );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce, report-uri="/test"' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setReportUriWithStringTwiceWithDifferentData',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.setReportUri( '/test' );
		ect.setReportUri( '/test2' );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce, report-uri="/test2"' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setReportUriWithInvalidData',
	dataProvider	: [
		[null],
		[undefined],
		[123],
		[true],
		[{}],
		[[]],
	],
	test	: ( done, data ) => {
		const ect	= new ECT();

		ect.setReportUri( '/test' );
		ect.setReportUri( data );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=86400, enforce, report-uri="/test"' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setMaxAgeWithNumber',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.setMaxAge( 300 );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=300, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setMaxAgeTwice',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.setMaxAge( 300 );
		ect.setMaxAge( 300 );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=300, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setMaxAgeTwiceWithDifferentValue',
	test	: ( done ) => {
		const ect	= new ECT();

		ect.setMaxAge( 300 );
		ect.setMaxAge( 600 );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=600, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'ECT.setMaxAgeWithInvalidData',
	dataProvider	: [
		[false],
		[null],
		[undefined],
		['test'],
		['123'],
		[{}],
		[[]],
	],
	test	: ( done, data ) => {
		const ect	= new ECT();

		ect.setMaxAge( 300 );
		ect.setMaxAge( data );

		assert.equal( ect.enabled, true );
		assert.equal( ect.build(), 'max-age=300, enforce' );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message			: 'ECT.constructorWithOptions',
	dataProvider	: [
		[
			{ enabled: false },
			false,
			''
		],
		[
			{ enabled: true },
			true,
			'max-age=86400, enforce'
		],
		[
			{},
			true,
			'max-age=86400, enforce'
		],
		[
			{ maxAge: 300 },
			true,
			'max-age=300, enforce'
		],
		[
			{ maxAge: 300, enforce: false },
			true,
			'max-age=300'
		],
		[
			{ maxAge: 300, reportUri: '/test' },
			true,
			'max-age=300, enforce, report-uri="/test"'
		],
		[
			{ reportUri: '/test' },
			true,
			'max-age=86400, enforce, report-uri="/test"'
		],
		[
			{ reportUri: 123 },
			true,
			'max-age=86400, enforce'
		],
		[
			{ enforce: 123 },
			true,
			'max-age=86400, enforce'
		],
		[
			{ maxAge: '123' },
			true,
			'max-age=86400, enforce'
		],
		[
			{ enabled: false, maxAge: 300, enforce: false, reportUri: '/test' },
			false,
			''
		],
	],
	test			: ( done, options, expectedEnabled, expectedBuild ) => {
		const ect	= new ECT( options );

		assert.equal( ect.enabled, expectedEnabled );
		assert.equal( ect.build(), expectedBuild );
		assert.equal( ect.getHeader(), HEADER_NAME );

		done();
	}
});
