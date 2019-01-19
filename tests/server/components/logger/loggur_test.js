'use strict';

const { Mock, assert, test, helpers }	= require( '../../../test_helper' );
const { Loggur, Logger, LOG_LEVELS }	= require( './../../../../server/components/logger/loggur' );
const MockLoggur						= Mock( Loggur.constructor );

test({
	message	: 'Loggur constructor does not crash',
	test	: ( done )=>{
		new MockLoggur();

		done();
	}
});

test({
	message	: 'Loggur constructor defaults',
	test	: ( done )=>{
		let loggur	= helpers.getMockedLoggur();
		assert.deepStrictEqual( loggur.loggers, {} );
		assert.deepStrictEqual( loggur.defaultLogger, null );
		assert.deepStrictEqual( loggur.uniqueId, 'Master' );

		done();
	}
});

test({
	message	: 'Loggur createLogger creates a logger',
	test	: ( done )=>{
		let loggur		= helpers.getMockedLoggur();
		assert.equal( loggur.createLogger() instanceof Logger, true );

		done();
	}
});

test({
	message	: 'Loggur addLogger adds a logger with correct configuration',
	test	: ( done )=>{
		let loggur	= helpers.getMockedLoggur();
		assert.equal( Object.keys( loggur.loggers ).length === 0, true );
		assert.equal( loggur.addLogger( 'testLogger' ), true );
		assert.equal( Object.keys( loggur.loggers ).length === 1, true );

		done();
	}
});

test({
	message	: 'Loggur addLogger adds a logger with incorrect configuration ( ignores object and creates a default one )',
	test	: ( done )=>{
		let loggur	= helpers.getMockedLoggur();
		assert.equal( Object.keys( loggur.loggers ).length === 0, true );
		assert.equal( loggur.addLogger( 'testLogger', new Date() ), true );
		assert.equal( Object.keys( loggur.loggers ).length === 1, true );

		done();
	}
});

test({
	message	: 'Loggur addLogger does not add a logger if logger already exists',
	test	: ( done )=>{
		let loggur	= helpers.getMockedLoggur();
		assert.equal( Object.keys( loggur.loggers ).length === 0, true );
		assert.equal( loggur.addLogger( 'testLogger' ), true );
		assert.equal( Object.keys( loggur.loggers ).length === 1, true );
		assert.equal( loggur.addLogger( 'testLogger' ), false );
		assert.equal( Object.keys( loggur.loggers ).length === 1, true );

		done();
	}
});

test({
	message	: 'Loggur getLogger returns the logger',
	test	: ( done )=>{
		let loggur		= helpers.getMockedLoggur();
		let loggerName	= 'testLogger';
		let testLogger	= loggur.createLogger({});
		loggur.addLogger( loggerName, testLogger );
		assert.equal( loggur.getLogger( loggerName ), testLogger );
		assert.equal( loggur.getLogger( loggerName ) !== false, true );

		done();
	}
});

test({
	message	: 'Loggur getLogger returns false if no logger is found',
	test	: ( done )=>{
		let loggur		= helpers.getMockedLoggur();
		let loggerName	= 'testLogger';
		assert.equal( loggur.getLogger( loggerName ), false );

		done();
	}
});

test({
	message	: 'Loggur getDefaultLogger Singleton pattern',
	test	: ( done )=>{
		let loggur	= helpers.getMockedLoggur();
		assert.equal( loggur.defaultLogger, null );
		let defaultLogger	= loggur.getDefaultLogger();

		assert.equal( defaultLogger instanceof Logger, true );
		assert.deepStrictEqual( loggur.getDefaultLogger(), defaultLogger );

		done();
	}
});

test({
	message	: 'Loggur getDefaultLogger configuration',
	test	: ( done )=>{
		let loggur			= helpers.getMockedLoggur();
		let defaultLogger	= loggur.getDefaultLogger();

		assert.equal( defaultLogger.serverName, 'DefaultLogger' );
		assert.equal( defaultLogger.logLevel, LOG_LEVELS.warning );

		done();
	}
});

test({
	message	: 'Loggur log returns a Promise',
	test	: ( done )=>{
		let loggur	= helpers.getMockedLoggur();
		loggur.addLogger( 'nullLogger', { logLevel: 0 } );
		assert.equal( loggur.log( 'test' ) instanceof Promise, true );

		done();
	}
});

test({
	message	: 'Loggur log logs to default logger if none are added',
	test	: ( done )=>{
		let loggur		= helpers.getMockedLoggur();
		let MockLogger	= Mock( Logger );
		let logger		= new MockLogger( {}, 'id' );
		let logged		= 0;

		logger._mock({
			method			: 'log',
			shouldReturn	: ()=>{
				++ logged;
				return new Promise(( resolve, reject )=>{
					resolve();
				});
			}
		});

		loggur._mock({
			method			: 'getDefaultLogger',
			shouldReturn	: logger
		});

		loggur.log( 'Test' );
		loggur.addLogger( 'testLogger', { logLevel: 0 } );
		loggur.log( 'Test' );

		assert.equal( logged, 1 );

		done();
	}
});
