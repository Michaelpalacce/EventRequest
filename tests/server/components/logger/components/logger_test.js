'use strict';

// Dependencies
const { Mock, Mocker, assert, test }					= require( '../../../../test_helper' );
const { Logger, LOG_LEVELS, Console, Transport, Log }	= require( './../../../../../server/components/logger/loggur' );

/**
 * @brief	Constants
 */
const LOGGER_DEFAULT_LOG_LEVEL	= LOG_LEVELS.info;

test({
	message	: 'Logger.constructor on defaults',
	test	: ( done )=>{
		assert.throws(()=>{
			new Logger();
		});

		done();
	}
});

test({
	message	: 'Logger.constructor.on.valid.arguments',
	test	: ( done ) => {
		let serverName				= 'Test';
		let logLevel				= LOG_LEVELS.debug;
		let logLevels				= LOG_LEVELS;
		let capture					= false;
		let dieOnCapture			= true;
		let unhandledExceptionLevel	= LOG_LEVELS.warning;
		let transports				= [new Console( { logLevel : 0 } )];

		let logger	= new Logger({
			serverName,
			logLevel,
			logLevels,
			capture,
			dieOnCapture,
			unhandledExceptionLevel,
			transports
		}, 'id' );

		assert.deepStrictEqual( logger.serverName, serverName );
		assert.deepStrictEqual( logger.logLevel, logLevel );
		assert.deepStrictEqual( logger.logLevels, logLevels );
		assert.deepStrictEqual( logger.capture, capture );
		assert.deepStrictEqual( logger.dieOnCapture, dieOnCapture );
		assert.deepStrictEqual( logger.unhandledExceptionLevel, unhandledExceptionLevel );
		assert.deepStrictEqual( logger.transports, transports );
		assert.deepStrictEqual( logger.uniqueId, 'id' );
		assert.deepStrictEqual( typeof logger.error, 'function' );
		assert.deepStrictEqual( typeof logger.warning, 'function' );
		assert.deepStrictEqual( typeof logger.notice, 'function' );
		assert.deepStrictEqual( typeof logger.info, 'function' );
		assert.deepStrictEqual( typeof logger.verbose, 'function' );
		assert.deepStrictEqual( typeof logger.debug, 'function' );

		done();
	}
});

test({
	message	: 'Logger.constructor.on.invalid.arguments',
	test	: ( done ) => {
		let serverName				= new Error();
		let logLevel				= new Error();
		// These will be accepted and is currently the only flaw. No way around this since the logger accepts all objects
		let logLevels				= '';
		let capture					= new Error();
		let dieOnCapture			= new Error();
		let unhandledExceptionLevel	= new Error();
		let transports				= [new Error()];

		let logger	= new Logger({
			serverName,
			logLevel,
			logLevels,
			capture,
			dieOnCapture,
			unhandledExceptionLevel,
			transports
		}, 'id' );

		assert.deepStrictEqual( logger.serverName, false );
		assert.deepStrictEqual( logger.logLevel, LOGGER_DEFAULT_LOG_LEVEL );
		assert.deepStrictEqual( logger.logLevels, LOG_LEVELS );
		assert.deepStrictEqual( logger.capture, false );
		assert.deepStrictEqual( logger.dieOnCapture, true );
		assert.deepStrictEqual( logger.unhandledExceptionLevel, LOG_LEVELS.error );
		assert.deepStrictEqual( logger.transports.length, 1 );
		assert.deepEqual( logger.transports[0].logLevel, LOGGER_DEFAULT_LOG_LEVEL );
		assert.deepEqual( logger.uniqueId, 'id' );
		assert.deepStrictEqual( typeof logger.error, 'function' );
		assert.deepStrictEqual( typeof logger.warning, 'function' );
		assert.deepStrictEqual( typeof logger.notice, 'function' );
		assert.deepStrictEqual( typeof logger.info, 'function' );
		assert.deepStrictEqual( typeof logger.verbose, 'function' );
		assert.deepStrictEqual( typeof logger.debug, 'function' );

		done();
	}
});

test({
	message	: 'Logger.constructor.logLevels.attaches.only.given.properties',
	test	: ( done ) => {
		let logLevels	= { error : 100, warning : 200 };
		let logger		= new Logger( { logLevels }, 'id' );

		assert.deepStrictEqual( logger.logLevels, logLevels );
		assert.deepStrictEqual( typeof logger.error, 'function' );
		assert.deepStrictEqual( typeof logger.warning, 'function' );
		assert.deepStrictEqual( typeof logger.notice, 'undefined' );
		assert.deepStrictEqual( typeof logger.info, 'undefined' );
		assert.deepStrictEqual( typeof logger.verbose, 'undefined' );
		assert.deepStrictEqual( typeof logger.debug, 'undefined' );

		done();
	}
});

test({
	message	: 'Logger.constructor.logLevels.accepts.custom.levels',
	test	: ( done ) => {
		let logLevels	= { testOne : 100, testTwo : 200 };
		let logger		= new Logger( { logLevels }, 'id' );

		assert.deepStrictEqual( logger.logLevels, logLevels );
		assert.deepStrictEqual( typeof logger.testOne, 'function' );
		assert.deepStrictEqual( typeof logger.testTwo, 'function' );

		done();
	}
});

test({
	message	: 'Logger.log.logs.only.up.to.given.log.level.and.always.returns.a.promise',
	test	: ( done ) => {
		let TransportMock	= Mock( Transport );
		let logged			= 0;
		let transport		= new TransportMock({});

		transport._mock({
			method			: 'log',
			shouldReturn	: () => {
				++ logged;
				return new Promise(( resolve, reject ) => {
					resolve();
				});
			},
			called			: 2
		});

		let logger	= new Logger({
			logLevels	: { error : 100, warning : 200 },
			logLevel	: 100,
			transports	: [transport],
		}, 'id' );

		logger.log( 'Error', LOG_LEVELS.error ).then(() => {
			return logger.log( 'Warning', LOG_LEVELS.warning );
		}).then(() => {
			logged === 1 ? done() : done( 'Transport logged called more than once when it should have been called just once' );
		}).catch(( err ) => {
			done( err );
		});
	}
});

// SKIPPED CAUSE IT WILL CAUSE ERRORS TO NOT DISPLAY AND HANG THE TEST PROCESS
test({
	message	: 'Logger.attachUnhandledEventListener.on.uncaught.rejection',
	skipped	: true,
	test	: ( done ) => {
		const MockLogger	= Mock( Logger );
		let logger			= new MockLogger({
			logLevels		: { error : 100, warning : 200 },
			logLevel		: 100,
			dieOnCapture	: false,
			capture			: true
		}, 'id' );

		logger._mock({
			method			: 'log',
			shouldReturn	: async ( log ) => {
				assert.deepStrictEqual( log.getLevel(), 100 );
				done();
			}
		});

		new Promise(( resolve, reject )=>{
			reject();
		})
	}
});

test({
	message	: 'Logger.addTransport.adds.only.a.transport.that.is.an.instance.of.Transport',
	test	: ( done ) => {
		let logger	= new Logger( {}, 'id' );
		assert.equal( logger.addTransport( new Console( { logLevel : 0 } ) ), true );
		assert.equal( logger.addTransport( new Error() ), false );

		done();
	}
});

test({
	message	: 'Logger.attachLogLevelsToLogger.does.not.attach.if.already.exists',
	test	: ( done ) => {
		const logger	= new Logger( {
			logLevels:	{
				supports	: 5000
			}
		}, 'id' );

		assert.deepStrictEqual( logger.supports( Log.getInstance( 'test', 100 ) ), true );

		done();
	}
});

test({
	message	: 'Logger.supports',
	test	: ( done ) => {
		let logger	= new Logger( {}, 'id' );

		assert.equal( logger.supports( Log.getInstance( '',LOG_LEVELS.error ) ), true );
		assert.equal( logger.supports( Log.getInstance( '',LOG_LEVELS.warning ) ), true );
		assert.equal( logger.supports( Log.getInstance( '',LOG_LEVELS.notice ) ), true );
		assert.equal( logger.supports( Log.getInstance( '',LOG_LEVELS.info ) ), true );
		assert.equal( logger.supports( Log.getInstance( '',LOG_LEVELS.verbose ) ), false );
		assert.equal( logger.supports( Log.getInstance( '',LOG_LEVELS.debug ) ), false );
		assert.equal( logger.supports( 'Not an instance of Log' ), false );

		done();
	}
});

test({
	message	: 'Logger.getUniqueId',
	test	: ( done ) => {
		let uniqueId	= 'id';
		let serverName	= 'Test';
		let logger		= new Logger( {}, uniqueId );

		assert.equal( logger.getUniqueId(), uniqueId );
		logger.serverName	= serverName;
		assert.equal( logger.getUniqueId(), `${serverName}/${uniqueId}` );

		done();
	}
});
