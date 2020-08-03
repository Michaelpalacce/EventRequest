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

test({
	message	: 'stackProcessor.returns.a.function.that.modifies.context',
	test	: ( done ) => {
		const context			= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		stackProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'stackProcessor.returns.a.function.that.modifies.context.with.error',
	test	: ( done ) => {
		const error				= new Error();
		const context			= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: error
		};

		const expectedContext	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: error.stack,
			rawMessage	: error
		};

		stackProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'stackProcessor.returns.a.function.that.modifies.context.with.error.but.no.message',
	test	: ( done ) => {
		const error				= new Error();
		const context			= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			rawMessage	: error
		};

		const expectedContext	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			rawMessage	: error
		};

		stackProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'stackProcessor.returns.a.function.that.modifies.context.with.empty',
	test	: ( done ) => {
		const context	= {};

		stackProcessor()( context );

		assert.deepStrictEqual( {}, context );

		done();
	}
});

test({
	message	: 'stackProcessor.returns.a.function.that.modifies.context.with.nothing',
	test	: ( done ) => {
		stackProcessor()();

		done();
	}
});