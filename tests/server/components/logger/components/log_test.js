'use strict';

// Dependencies
const {  assert, test }	= require( '../../../../test_helper' );
const { Log }			= require( './../../../../../server/components/logger/loggur' );

/**
 * @brief	Constants
 */
const LOG_LEVELS	= {
	error	: 100,
	warning	: 200,
	notice	: 300,
	info	: 400,
	verbose	: 500,
	debug	: 600
};

const DEFAULT_LOG_LEVEL			= LOG_LEVELS.error;
const WRONG_LOG_DEFAULT_LEVEL	= LOG_LEVELS.error;
const WRONG_LOG_DEFAULT_MESSAGE	= '';

test({
	message	: 'Log.constructor on default',
	test	: ( done ) => {
		let log	= new Log();

		assert.equal( log.message, WRONG_LOG_DEFAULT_MESSAGE );
		assert.equal( log.level, WRONG_LOG_DEFAULT_LEVEL );
		assert.equal( log.isRaw, false );
		assert.equal( typeof log.timestamp === 'number' && log.timestamp > 0, true );
		assert.equal( log.uniqueId, '' );

		done();
	}
});

test({
	message	: 'Log.constructor on string',
	test	: ( done ) => {
		let logMessage	= 'test';
		let log			= new Log( logMessage );

		assert.equal( log.message, logMessage );
		assert.equal( log.level, DEFAULT_LOG_LEVEL );
		assert.equal( log.isRaw, false );
		assert.equal( typeof log.timestamp === 'number' && log.timestamp > 0, true );
		assert.equal( log.uniqueId, '' );

		done();
	}
});

test({
	message	: 'Log.constructor on object',
	test	: ( done ) => {
		let logMessage	= 'test';
		let isRaw		= true;
		let logLevel	= LOG_LEVELS.error;
		let log			= new Log( logMessage, logLevel, isRaw );

		assert.equal( log.message, logMessage );
		assert.equal( log.level, logLevel );
		assert.equal( log.isRaw, isRaw );
		assert.equal( typeof log.timestamp === 'number' && log.timestamp > 0, true );
		assert.equal( log.uniqueId, '' );

		done();
	}
});

test({
	message	: 'Log.constructor on invalid',
	test	: ( done ) => {
		let log			= new Log();

		assert.equal( log.message, WRONG_LOG_DEFAULT_MESSAGE );
		assert.equal( log.level, WRONG_LOG_DEFAULT_LEVEL );
		assert.equal( log.isRaw, false );
		assert.equal( typeof log.timestamp === 'number' && log.timestamp > 0, true );
		assert.equal( log.uniqueId, '' );

		done();
	}
});

test({
	message	: 'Log.constructor on object message',
	test	: ( done ) => {
		let logMessage	= { key	: 'value' };
		let log			= new Log( logMessage );

		assert.equal( log.message, JSON.stringify( logMessage ) );
		assert.equal( log.level, WRONG_LOG_DEFAULT_LEVEL );
		assert.equal( log.isRaw, false );
		assert.equal( typeof log.timestamp === 'number' && log.timestamp > 0, true );
		assert.equal( log.uniqueId, '' );

		done();
	}
});

test({
	message	: 'Log.getLevel returns the level',
	test	: ( done ) => {
		let log	= new Log();

		assert.equal( log.getLevel(), WRONG_LOG_DEFAULT_LEVEL );

		done();
	}
});

test({
	message	: 'Log.getIsRaw returns the boolean',
	test	: ( done ) => {
		let log	= new Log();

		assert.equal( log.getIsRaw(), false );

		done();
	}
});

test({
	message	: 'Log.getStackTrace returns string',
	test	: ( done ) => {
		assert.equal( 'string', typeof Log.getStackTrace() );

		done();
	}
});

test({
	message	: 'Log.getMessage returns the message',
	test	: ( done ) => {
		let log	= new Log();

		assert.equal( log.getMessage(), WRONG_LOG_DEFAULT_MESSAGE );

		done();
	}
});

test({
	message	: 'Log.getTimestamp returns a number',
	test	: ( done ) => {
		let log	= new Log();

		assert.equal( typeof log.getTimestamp(), 'number' );

		done();
	}
});

test({
	message	: 'Log.setUniqueId and geUniqueId',
	test	: ( done ) => {
		let log	= new Log();
		log.setUniqueId( 'testID' );
		assert.equal( log.getUniqueId(), 'testID' );

		done();
	}
});

test({
	message	: 'Log.toString returns a string',
	test	: ( done ) => {
		let log	= new Log();

		assert.equal( typeof log.toString(), 'string' );

		done();
	}
});

test({
	message	: 'Log.getInstance if an instance of Log is given returns it',
	test	: ( done ) => {
		let logOne	= new Log( 'test' );
		let logTwo	= Log.getInstance( logOne );

		assert.deepStrictEqual( logOne, logTwo );

		done();
	}
});

test({
	message	: 'Log.getInstance if an instance of Log is given returns it',
	test	: ( done ) => {
		let logOne	= new Log( 'test' );
		let logTwo	= Log.getInstance( logOne );

		assert.deepStrictEqual( logOne, logTwo );

		done();
	}
});

test({
	message	: 'Log.getUNIXTime returns a number',
	test	: ( done ) => {
		assert.deepStrictEqual( typeof Log.getUNIXTime(), 'number' );

		done();
	}
});

test({
	message	: 'Log.processLog.when.message.is.Error',
	test	: ( done ) => {
		const logMessage	= new Error( 'Test' );
		const log			= new Log( logMessage );

		assert.deepStrictEqual( log.getMessage(), logMessage.stack );

		done();
	}
});

test({
	message	: 'Log.processLog.when.message.null',
	test	: ( done ) => {
		const log			= new Log( null );

		assert.deepStrictEqual( log.getMessage(), '' );

		done();
	}
});

test({
	message	: 'Log.getRawMessage',
	test	: ( done ) => {
		const log			= new Log( null );

		assert.deepStrictEqual( log.getRawMessage(), null );

		done();
	}
});

test({
	message	: 'Log.getInstance.when.log.is.already.instance.of.log.and.number.is.provided.overwrites.log.number',
	test	: ( done ) => {
		const log	= new Log( 'test', 200 );

		assert.deepStrictEqual( log.getLevel(), 200 );

		const logTwo	= Log.getInstance( log, 300 );

		assert.deepStrictEqual( log.getLevel(), 300 );
		assert.deepStrictEqual( logTwo.getLevel(), 300 );

		done();
	}
});
