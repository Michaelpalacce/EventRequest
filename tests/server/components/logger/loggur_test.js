'use strict';

const { Mock, assert, test, helpers }	= require( './../../../testing_suite' );
const Loggur							= require( './../../../../server/components/logger/loggur' );
const MockLoggur						= Mock( Loggur.constructor );

test({
	message	: 'Loggur constructor does not crash',
	test	: ( done )=>{
		new MockLoggur();

		done();
	}
});

test({
	message	: 'Loggur constructor defaults',
	test	: ( done )=>{
		let loggur	= helpers.getMockedLoggur();
		assert.deepStrictEqual( loggur.loggers, {} );
		assert.deepStrictEqual( loggur.defaultLogger, null );
		assert.deepStrictEqual( loggur.uniqueId, 'Master' );

		done();
	}
});
