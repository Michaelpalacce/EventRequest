'use strict';

// Dependencies
const { assert, test }	= require( '../../../../../../test_helper' );
const jsonFormatter		= require( './../../../../../../../server/components/logger/components/transport_types/formatters/json_formatter' );

test({
	message	: 'jsonFormatter.returns.a.function',
	test	: ( done ) => {
		assert.deepStrictEqual( typeof jsonFormatter(), 'function' );

		done();
	}
});

test({
	message	: 'jsonFormatter.returns.a.function.that.formats.context',
	test	: ( done ) => {
		const context	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		assert.deepStrictEqual( jsonFormatter()( context ), [JSON.stringify( context )]);

		done();
	}
});

test({
	message	: 'jsonFormatter.returns.a.function.that.formats.context.with.nothing',
	test	: ( done ) => {
		assert.deepStrictEqual( jsonFormatter()(), ['{}']);

		done();
	}
});

test({
	message	: 'jsonFormatter.returns.a.function.that.formats.context.when.raw',
	test	: ( done ) => {
		const context	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: true,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		assert.deepStrictEqual( jsonFormatter()( context ), [JSON.stringify( context )]);

		done();
	}
});

test({
	message	: 'jsonFormatter.returns.a.function.that.formats.context.replacer.is.given',
	test	: ( done ) => {
		const replacer	= function( key, value )
		{
			if ( key === 'message' )
				return 'REPLACED MESSAGE';

			return value
		};

		const context	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: true,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		const expected	= JSON.stringify({
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: true,
			message		: 'REPLACED MESSAGE',
		});

		assert.deepStrictEqual( jsonFormatter( { replacer } )( context ), [expected]);

		done();
	}
});

test({
	message	: 'jsonFormatter.returns.a.function.that.formats.context.with.nothing.and.replacer',
	test	: ( done ) => {
		const replacer	= function( key, value )
		{
			if ( key === 'message' )
				return 'REPLACED MESSAGE';

			return value
		};

		assert.deepStrictEqual( jsonFormatter( { replacer } )(), ['{}']);

		done();
	}
});