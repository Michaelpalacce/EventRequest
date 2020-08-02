'use strict';

// Dependencies
const { assert, test, Mock }		= require( '../../../../../test_helper' );
const { LOG_LEVELS, Console, Log }	= require( './../../../../../../server/components/logger/loggur' );

test({
	message	: 'Console.constructor.on.default',
	test	: ( done ) => {
		let consoleTransport	= new Console();

		assert.deepStrictEqual( consoleTransport.logLevel, LOG_LEVELS.info );
		assert.deepStrictEqual( consoleTransport.logLevels, LOG_LEVELS );
		assert.deepStrictEqual( consoleTransport.supportedLevels, Object.values( LOG_LEVELS ) );
		assert.deepStrictEqual( consoleTransport.formatter.toString(), Console.formatters.plain().toString() );
		assert.deepStrictEqual( consoleTransport.processors.length, 3 );

		done();
	}
});

test({
	message	: 'Console.constructor.on.invalid.configuration',
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
		assert.deepStrictEqual( consoleTransport.formatter.toString(), Console.formatters.plain().toString() );
		assert.deepStrictEqual( consoleTransport.processors.length, 3 );

		done();
	}
});

test({
	message	: 'Console.constructor.on.valid.configuration',
	test	: ( done ) => {
		let logLevel	= LOG_LEVELS.error;
		let logLevels	= { error : 100, warning : 200 };

		let consoleTransport	= new Console(
			{
				logLevel,
				logLevels,
				formatter: Console.formatters.json(),
				processors:[Console.processors.color()]
			}
		);

		assert.deepStrictEqual( consoleTransport.logLevel, logLevel);
		assert.deepStrictEqual( consoleTransport.logLevels, logLevels );
		assert.deepStrictEqual( consoleTransport.supportedLevels, Object.values( logLevels ) );
		assert.deepStrictEqual( consoleTransport.formatter.toString(), Console.formatters.json().toString() );
		assert.deepStrictEqual( consoleTransport.processors.length, 1 );

		done();
	}
});

test({
	message	: 'Console.log.returns.a.Promise',
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
	message	: 'Console.log.does.not.log.if.the.transport.does.not.support.it',
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
