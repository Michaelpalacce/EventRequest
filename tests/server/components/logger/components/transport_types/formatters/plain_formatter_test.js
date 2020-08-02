'use strict';

// Dependencies
const { assert, test }	= require( '../../../../../../test_helper' );
const plainFormatter	= require( './../../../../../../../server/components/logger/components/transport_types/formatters/plain_formatter' );

test({
	message	: 'plainFormatter.returns.a.function',
	test	: ( done ) => {
		assert.deepStrictEqual( typeof plainFormatter(), 'function' );

		done();
	}
});

test({
	message	: 'plainFormatter.returns.a.function.that.formats.context',
	test	: ( done ) => {
		const context	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		assert.deepStrictEqual( plainFormatter()( context ), ['uniqueId - timestamp : testMessage']);

		done();
	}
});

test({
	message	: 'plainFormatter.returns.a.function.that.formats.context.when.raw',
	test	: ( done ) => {
		const context	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: true,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		assert.deepStrictEqual( plainFormatter()( context ), ['uniqueId - timestamp :', 'testRawMessage']);

		done();
	}
});

test({
	message	: 'plainFormatter.returns.a.function.that.formats.context.when.raw.but.noRaw.is.true',
	test	: ( done ) => {
		const context	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: true,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		assert.deepStrictEqual( plainFormatter( { noRaw: true } )( context ), ['uniqueId - timestamp : testMessage']);

		done();
	}
});
