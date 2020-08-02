'use strict';

// Dependencies
const { assert, test }	= require( '../../../../../../test_helper' );
const newLineProcessor	= require( './../../../../../../../server/components/logger/components/transport_types/processors/new_line_processor' );
const os				= require( 'os' );

test({
	message	: 'newLineProcessor.returns.a.function',
	test	: ( done ) => {
		assert.deepStrictEqual( typeof newLineProcessor(), 'function' );

		done();
	}
});

test({
	message	: 'newLineProcessor.returns.a.function.that.modifies.context.when.not.string',
	test	: ( done ) => {

		const context			= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: { error: new Error() },
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: { error: new Error() },
			rawMessage	: 'testRawMessage'
		};

		newLineProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'newLineProcessor.returns.a.function.that.modifies.context.when.string',
	test	: ( done ) => {
		const error				= new Error();

		const context			= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: error.stack,
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: error.stack.replace( /\r\n|\r|\n|\\r\\n|\\n|\\r/g, os.EOL ),
			rawMessage	: 'testRawMessage'
		};

		newLineProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'newLineProcessor.returns.a.function.that.modifies.context.when.context.is.empty',
	test	: ( done ) => {
		const context			= {};
		const expectedContext	= {};

		newLineProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'newLineProcessor.returns.a.function.that.modifies.context.when.context.is.missing',
	test	: ( done ) => {
		newLineProcessor()();

		done();
	}
});
