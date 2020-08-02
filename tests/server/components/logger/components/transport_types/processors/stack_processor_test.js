'use strict';

// Dependencies
const { assert, test }	= require( '../../../../../../test_helper' );
const stackProcessor	= require( './../../../../../../../server/components/logger/components/transport_types/processors/stack_processor' );

test({
	message	: 'stackProcessor.returns.a.function',
	test	: ( done ) => {
		assert.deepStrictEqual( typeof stackProcessor(), 'function' );

		done();
	}
});