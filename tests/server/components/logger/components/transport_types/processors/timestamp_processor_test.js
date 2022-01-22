'use strict';

// Dependencies
const { assert, test }		= require( '../../../../../../test_helper' );
const timestampProcessor	= require( './../../../../../../../server/components/logger/components/transport_types/processors/timestamp_processor' );

/**
 * @brief	Gets the timestamp from the Log
 *
 * @property	{Number} timestamp
 *
 * @return	{String}
 */
function getTimestamp( timestamp )
{
	return Intl.DateTimeFormat( 'en-GB',
		{
			hour12	: false,
			year	: '2-digit',
			month	: '2-digit',
			day		: '2-digit',
			hour	: '2-digit',
			minute	: '2-digit',
			second	: '2-digit'
		}
	).format( new Date( timestamp * 1000 ) );
}

test({
	message	: 'timestampProcessor.returns.a.function',
	test	: ( done ) => {
		assert.deepStrictEqual( typeof timestampProcessor(), 'function' );

		done();
	}
});

test({
	message	: 'timestampProcessor.returns.a.function.that.modifies.context.when.not.string',
	test	: ( done ) => {

		const context			= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'message',
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: 'uniqueId',
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'message',
			rawMessage	: 'testRawMessage'
		};

		timestampProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'timestampProcessor.returns.a.function.that.modifies.context',
	test	: ( done ) => {

		const context			= {
			uniqueId	: 'uniqueId',
			timestamp	: 100,
			isRaw		: false,
			message		: 'message',
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: 'uniqueId',
			timestamp	: getTimestamp( 100 ),
			isRaw		: false,
			message		: 'message',
			rawMessage	: 'testRawMessage'
		};

		timestampProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'timestampProcessor.returns.a.function.that.modifies.context.with.empty',
	test	: ( done ) => {
		const context			= {};
		const expectedContext	= {};

		timestampProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});


test({
	message	: 'timestampProcessor.returns.a.function.that.modifies.context.with.nothing',
	test	: ( done ) => {
		timestampProcessor()();

		done();
	}
});
