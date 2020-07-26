'use strict';

// Dependencies
const { assert, test, Mock }		= require( '../../../../../test_helper' );
const { LOG_LEVELS, Console, Log }	= require( './../../../../../../server/components/logger/loggur' );

/**
 * @brief	Constants
 */
const TRANSPORT_DEFAULT_SHOULD_COLOR	= true;
const TRANSPORT_DEFAULT_COLORS			= {
	[LOG_LEVELS.error]		: 'red',
	[LOG_LEVELS.warning]	: 'yellow',
	[LOG_LEVELS.notice]		: 'green',
	[LOG_LEVELS.info]		: 'blue',
	[LOG_LEVELS.verbose]	: 'cyan',
	[LOG_LEVELS.debug]		: 'white'
};

test({
	message	: 'Console.constructor on default',
	test	: ( done ) => {
		let consoleTransport	= new Console();

		assert.deepStrictEqual( consoleTransport.logLevel, LOG_LEVELS.info );
		assert.deepStrictEqual( consoleTransport.logLevels, LOG_LEVELS );
		assert.deepStrictEqual( consoleTransport.supportedLevels, Object.values( LOG_LEVELS ) );
		assert.deepStrictEqual( consoleTransport.color, TRANSPORT_DEFAULT_SHOULD_COLOR );
		assert.deepStrictEqual( consoleTransport.logColors, TRANSPORT_DEFAULT_COLORS );

		done();
	}
});

test({
	message	: 'Console._getTimestamp.when.log.is.not.an.instance.of.log',
	test	: ( done ) => {
		let consoleTransport	= new Console();

		assert.deepStrictEqual( consoleTransport._getTimestamp( new Log() ), consoleTransport._getTimestamp() );

		done();
	}
});

test({
	message	: 'Console.constructor on invalid configuration',
	test	: ( done ) => {
		let consoleTransport	= new Console({
			logLevel	: 'test',
			logLevels	: 'test',
			color		: 'test',
			logColors	: 'test',
		});

		assert.deepStrictEqual( consoleTransport.logLevel, LOG_LEVELS.info );
		assert.deepStrictEqual( consoleTransport.logLevels, LOG_LEVELS );
		assert.deepStrictEqual( consoleTransport.supportedLevels, Object.values( LOG_LEVELS ) );
		assert.deepStrictEqual( consoleTransport.color, TRANSPORT_DEFAULT_SHOULD_COLOR );
		assert.deepStrictEqual( consoleTransport.logColors, TRANSPORT_DEFAULT_COLORS );

		done();
	}
});

test({
	message	: 'Console.constructor on valid configuration',
	test	: ( done ) => {
		let logLevel	= LOG_LEVELS.error;
		let logLevels	= { error : 100, warning : 200 };
		let color		= false;
		let logColors	= { error : 'yellow', warning : 'red' };

		let consoleTransport	= new Console( { logLevel, logLevels, color, logColors } );

		assert.deepStrictEqual( consoleTransport.logLevel, logLevel);
		assert.deepStrictEqual( consoleTransport.logLevels, logLevels );
		assert.deepStrictEqual( consoleTransport.supportedLevels, Object.values( logLevels ) );
		assert.deepStrictEqual( consoleTransport.color, color );
		assert.deepStrictEqual( consoleTransport.logColors, logColors );

		done();
	}
});

test({
	message	: 'Console.format returns Array',
	test	: ( done ) => {

		let consoleTransport	= new Console();

		assert.equal( Array.isArray( consoleTransport.format( Log.getInstance( 'test' ) ) ), true );

		done();
	}
});

test({
	message	: 'Console.format checks if is raw with not raw',
	test	: ( done ) => {
		let LogMock				= Mock( Log );
		let consoleTransport	= new Console();
		let log					= new LogMock( 'test', 100, false );

		log._mock({
			method			: 'getIsRaw',
			shouldReturn	: log.isRaw,
			called			: 1
		});

		log._mock({
			method			: 'getMessage',
			shouldReturn	: 'message',
			called			: 1
		});

		log._mock({
			method			: 'getRawMessage',
			shouldReturn	: 'RawMessage',
			called			: 0
		});

		assert.equal( Array.isArray( consoleTransport.format( log ) ), true );

		done();
	}
});

test({
	message	: 'Console.format checks if is raw with raw',
	test	: ( done ) => {
		let LogMock				= Mock( Log );
		let consoleTransport	= new Console();
		let log					= new LogMock( 'test', 100, true );

		log._mock({
			method			: 'getIsRaw',
			shouldReturn	: log.isRaw,
			called			: 1
		});

		log._mock({
			method			: 'getMessage',
			shouldReturn	: '',
			called			: 0
		});

		log._mock({
			method			: 'getRawMessage',
			shouldReturn	: 'RawMessage',
			called			: 1
		});

		assert.equal( Array.isArray( consoleTransport.format( log ) ), true );

		done();
	}
});

test({
	message	: 'Console.log returns a Promise',
	test	: ( done ) => {
		let ConsoleMock			= Mock( Console );
		let consoleTransport	= new ConsoleMock();
		consoleTransport._mock({
			method			: '_log',
			shouldReturn	: ( log, resolve, reject ) => {
				resolve();
			}
		});

		assert.equal( consoleTransport.log( Log.getInstance( 'test' ) ) instanceof Promise, true );

		done();
	}
});

test({
	message	: 'Console.format.when.the.log.color.is.not.defined',
	test	: ( done ) => {
		let ConsoleMock			= Mock( Console );
		let consoleTransport	= new ConsoleMock();

		const formattedData		= consoleTransport.format( Log.getInstance( 'testLog', 1111 ) );

		assert.deepStrictEqual( formattedData.length, 1 );
		assert.deepStrictEqual( formattedData[0].includes( '\u001b[31mtestLog' ), true );

		done();
	}
});

test({
	message	: 'Console.format.when.the.log.color.is.defined.but.colorize.does.not.have.that.color',
	test	: ( done ) => {
		const ConsoleMock		= Mock( Console );
		const consoleTransport	= new ConsoleMock( { logColors: {
				100: 'wrong'
			}
		});

		const formattedData		= consoleTransport.format( Log.getInstance( 'testLog', 100 ) );

		assert.deepStrictEqual( formattedData.length, 1 );
		assert.deepStrictEqual( formattedData[0].includes( '\u001b[31mtestLog' ), true );

		done();
	}
});

test({
	message	: 'Console.format.when.color.is.disabled',
	test	: ( done ) => {
		const ConsoleMock		= Mock( Console );
		const consoleTransport	= new ConsoleMock( { color: false } );

		const formattedData		= consoleTransport.format( Log.getInstance( 'testLog', 100 ) );

		assert.deepStrictEqual( formattedData.length, 1 );
		assert.deepStrictEqual( formattedData[0].includes( '\u001b[3' ), false );

		done();
	}
});

test({
	message	: 'Console.log does not log if the transport does not support it',
	test	: ( done ) => {
		let called				= 0;
		let ConsoleMock			= Mock( Console );
		let consoleTransport	= new ConsoleMock();
		consoleTransport._mock({
			method			: '_log',
			shouldReturn	: ( log, resolve, reject ) => {
				++ called;
			},
			called			: 0
		});

		assert.equal( consoleTransport.log( Log.getInstance( '', LOG_LEVELS.debug ) ) instanceof Promise, true );

		called === 0 ? done() : done( 'Log should not have been called but it did' );
	}
});
