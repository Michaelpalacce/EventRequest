'use strict';

// Dependencies
const { assert, test }	= require( '../../../../../../test_helper' );
const colorProcessor	= require( './../../../../../../../server/components/logger/components/transport_types/processors/color_processor' );
const { LOG_LEVELS }	= require( './../../../../../../../server/components/logger/components/log' );

test({
	message	: 'colorProcessor.returns.a.function',
	test	: ( done ) => {
		assert.deepStrictEqual( typeof colorProcessor(), 'function' );

		done();
	}
});

test({
	message	: 'colorProcessor.returns.a.function.that.modifies.context',
	test	: ( done ) => {
		const context			= {
			uniqueId	: 'uniqueId',
			level		: 100,
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: '\u001b[0muniqueId\u001b[0m',
			level		: 100,
			timestamp	: '\u001b[34mtimestamp\u001b[0m',
			isRaw		: false,
			message		: '\u001b[31mtestMessage\u001b[0m\u001b[0m\u001b[0m',
			rawMessage	: 'testRawMessage'
		};

		colorProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'colorProcessor.returns.a.function.that.modifies.context.with.empty.custom',
	test	: ( done ) => {
		const context			= {
			uniqueId	: 'uniqueId',
			level		: 100,
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: '\u001b[0muniqueId\u001b[0m',
			level		: 100,
			timestamp	: '\u001b[34mtimestamp\u001b[0m',
			isRaw		: false,
			message		: '\u001b[31mtestMessage\u001b[0m\u001b[0m\u001b[0m',
			rawMessage	: 'testRawMessage'
		};

		colorProcessor( {} )( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'colorProcessor.returns.a.function.that.modifies.context.when.log.colors.are.custom',
	test	: ( done ) => {
		const context			= {
			uniqueId	: 'uniqueId',
			level		: 100,
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: '\u001b[0muniqueId\u001b[0m',
			level		: 100,
			timestamp	: '\u001b[34mtimestamp\u001b[0m',
			isRaw		: false,
			message		: '\u001b[33mtestMessage\u001b[0m\u001b[0m\u001b[0m',
			rawMessage	: 'testRawMessage'
		};

		const logColors	= {
			[LOG_LEVELS.error]		: 'yellow',
			[LOG_LEVELS.warning]	: 'yellow',
			[LOG_LEVELS.notice]		: 'yellow',
			[LOG_LEVELS.info]		: 'yellow',
			[LOG_LEVELS.verbose]	: 'yellow',
			[LOG_LEVELS.debug]		: 'yellow'
		};

		colorProcessor( { logColors } )( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'colorProcessor.returns.a.function.that.modifies.context.when.log.colors.has.a.missing.log.color',
	test	: ( done ) => {
		const context			= {
			uniqueId	: 'uniqueId',
			level		: 100,
			timestamp	: 'timestamp',
			isRaw		: false,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: '\u001b[0muniqueId\u001b[0m',
			level		: 100,
			timestamp	: '\u001b[34mtimestamp\u001b[0m',
			isRaw		: false,
			message		: '\u001b[31mtestMessage\u001b[0m\u001b[0m\u001b[0m',
			rawMessage	: 'testRawMessage'
		};

		const logColors	= {
			[LOG_LEVELS.warning]	: 'yellow',
			[LOG_LEVELS.notice]		: 'yellow',
			[LOG_LEVELS.info]		: 'yellow',
			[LOG_LEVELS.verbose]	: 'yellow',
			[LOG_LEVELS.debug]		: 'yellow'
		};

		colorProcessor( { logColors } )( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'colorProcessor.returns.a.function.that.modifies.context.when.isRaw.is.true',
	test	: ( done ) => {
		const context			= {
			uniqueId	: 'uniqueId',
			level		: 100,
			timestamp	: 'timestamp',
			isRaw		: true,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: '\u001b[0muniqueId\u001b[0m',
			level		: 100,
			timestamp	: '\u001b[34mtimestamp\u001b[0m',
			isRaw		: true,
			message		: 'testMessage',
			rawMessage	: 'testRawMessage'
		};

		colorProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'colorProcessor.returns.a.function.that.modifies.context.with.missing.required.property',
	test	: ( done ) => {
		const context			= {
			uniqueId	: 'uniqueId',
			level		: 100,
			timestamp	: 'timestamp',
			isRaw		: false,
			rawMessage	: 'testRawMessage'
		};

		const expectedContext	= {
			uniqueId	: 'uniqueId',
			level		: 100,
			timestamp	: 'timestamp',
			isRaw		: false,
			rawMessage	: 'testRawMessage'
		};

		colorProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'colorProcessor.returns.a.function.that.modifies.context.with.empty',
	test	: ( done ) => {
		const context			= {};
		const expectedContext	= {};

		colorProcessor()( context );

		assert.deepStrictEqual( context, expectedContext );

		done();
	}
});

test({
	message	: 'colorProcessor.returns.a.function.that.modifies.context.with.empty',
	test	: ( done ) => {
		colorProcessor()();

		done();
	}
});
