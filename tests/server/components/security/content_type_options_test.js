'use strict';

// Dependencies
const { assert, test }	= require( '../../../test_helper' );
const CTO				= require( './../../../../server/components/security/content_type_options' );

const HEADER_NAME		= 'X-Content-Type-Options';

test({
	message	: 'CTO.constructorOnDefaults',
	test	: ( done ) => {
		const cto	= new CTO();

		assert.equal( cto.enabled, true );
		assert.equal( cto.build(), 'nosniff' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'CTO.parseOptionsWithoutArgument',
	test	: ( done ) => {
		const cto	= new CTO();

		assert.equal( cto.enabled, true );
		assert.equal( cto.build(), 'nosniff' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		cto.setEnabled( false );

		cto.parseOptions();

		assert.deepStrictEqual( cto.enabled, true );

		done();
	}
});

test({
	message	: 'CTO.constructorOnDisable',
	test	: ( done ) => {
		const cto	= new CTO( { enabled: false } );

		assert.equal( cto.enabled, false );
		assert.equal( cto.build(), '' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'CTO.setEnabledEnablesThePlugin',
	test	: ( done ) => {
		const cto	= new CTO( { enabled: false } );

		assert.equal( cto.enabled, false );
		assert.equal( cto.build(), '' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		cto.setEnabled();

		assert.equal( cto.enabled, true );
		assert.equal( cto.build(), 'nosniff' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'CTO.setEnabled.with.not.a.boolean.defaults.to.true',
	test	: ( done ) => {
		const cto	= new CTO( { enabled: false } );

		assert.equal( cto.enabled, false );
		assert.equal( cto.build(), '' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		cto.setEnabled( 'string' );

		assert.equal( cto.enabled, true );
		assert.equal( cto.build(), 'nosniff' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'CTO.setEnabledTwiceDoesNothing',
	test	: ( done ) => {
		const cto	= new CTO( { enabled: false } );

		assert.equal( cto.enabled, false );
		assert.equal( cto.build(), '' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		cto.setEnabled();
		cto.setEnabled();

		assert.equal( cto.enabled, true );
		assert.equal( cto.build(), 'nosniff' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		done();
	}
});

test({
	message	: 'CTO.setEnabledDisablesIfFalse',
	test	: ( done ) => {
		const cto	= new CTO();

		assert.equal( cto.enabled, true );
		assert.equal( cto.build(), 'nosniff' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		cto.setEnabled( false );

		assert.equal( cto.enabled, false );
		assert.equal( cto.build(), '' );
		assert.equal( cto.getHeader(), HEADER_NAME );

		done();
	}
});
