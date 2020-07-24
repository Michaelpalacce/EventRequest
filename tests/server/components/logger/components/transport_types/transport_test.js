'use strict';

// Dependencies
const { assert, test }					= require( '../../../../../test_helper' );
const { LOG_LEVELS, Transport, Log }	= require( './../../../../../../server/components/logger/loggur' );

/**
 * @brief	Constants
 */
const TRANSPORT_DEFAULT_LOG_LEVEL	= LOG_LEVELS.info;

test({
	message	: 'Transport.constructor on defaults',
	test	: ( done ) => {
		new Transport();

		done();
	}
});

test({
	message	: 'Transport.constructor on invalid configuration',
	test	: ( done ) => {
		let transport	= new Transport({
			logLevel	: 'test',
			logLevels	: 'test'
		});

		assert.deepStrictEqual( transport.logLevel, TRANSPORT_DEFAULT_LOG_LEVEL );
		assert.deepStrictEqual( transport.logLevels, LOG_LEVELS );
		assert.deepStrictEqual( transport.supportedLevels, Object.values( LOG_LEVELS ) );

		done();
	}
});

test({
	message	: 'Transport.constructor on valid configuration',
	test	: ( done ) => {
		let logLevel	= 500;
		let logLevels	= { warning : 500, error : 100 };
		let transport	= new Transport({
			logLevel	: logLevel,
			logLevels	: logLevels
		});

		assert.deepStrictEqual( transport.logLevel, logLevel );
		assert.deepStrictEqual( transport.logLevels, logLevels );
		assert.deepStrictEqual( transport.supportedLevels, Object.values( logLevels ) );

		done();
	}
});

test({
	message	: 'Transport.getInstance returns an instance of Transport',
	test	: ( done ) => {
		let transportBase	= new Transport();
		let transportTest	= Transport.getInstance();

		assert.deepStrictEqual( transportBase, transportTest );

		done();
	}
});

test({
	message	: 'Transport.supports supports only instances of Log',
	test	: ( done ) => {
		let transport	= new Transport();

		assert.equal( transport.supports( new Error( 'test' ) ), false );
		assert.equal( transport.supports( '' ), false );
		assert.equal( transport.supports( [] ), false );
		assert.equal( transport.supports( {} ), false );
		assert.equal( transport.supports( 0 ), false );
		assert.equal( transport.supports( false ), false );
		assert.equal( transport.supports( undefined ), false );
		assert.equal( transport.supports( null ), false );
		assert.equal( transport.supports( Log.getInstance( '' ) ), true );

		done();
	}
});

test({
	message	: 'Transport.supports supports logLevels that are present',
	test	: ( done ) => {
		let transport	= new Transport({
			logLevel	: LOG_LEVELS.info,
			logLevels	: { error : 100, notice : 300, verbose : 500 }
		});

		assert.equal( transport.supports( Log.getInstance( '', LOG_LEVELS.error ) ), true );
		assert.equal( transport.supports( Log.getInstance( '', LOG_LEVELS.warning ) ), false );
		assert.equal( transport.supports( Log.getInstance( '', LOG_LEVELS.notice ) ), true );
		assert.equal( transport.supports( Log.getInstance( '', LOG_LEVELS.info ) ), false );
		assert.equal( transport.supports( Log.getInstance( '', LOG_LEVELS.verbose ) ), false );
		assert.equal( transport.supports( Log.getInstance( '', LOG_LEVELS.debug ) ), false );

		done();
	}
});

test({
	message	: 'Transport.format does nothing',
	test	: ( done ) => {
		let transport	= new Transport();
		let log			= Log.getInstance( 'test' );

		assert.equal( transport.format( log ), log );

		done();
	}
});

test({
	message	: 'Transport.log returns a promise',
	test	: ( done ) => {
		let transport	= new Transport();
		let log			= Log.getInstance( 'test' );

		assert.equal( transport.log( log ) instanceof Promise, true );

		done();
	}
});
