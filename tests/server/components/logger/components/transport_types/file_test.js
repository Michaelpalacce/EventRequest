'use strict';

// Dependencies
const { assert, test, Mock, helpers }	= require( './../../../../../testing_suite' );
const { LOG_LEVELS, File, Log }			= require( './../../../../../../server/components/logger/loggur' );

helpers.clearUpTestFile();

test({
	message	: 'File.constructor on defaults',
	test	: ( done )=>{
		new File();

		done();
	}
});

test({
	message	: 'File.constructor on invalid configuration',
	test	: ( done )=>{
		let file	= new File({
			logLevel	: 'test',
			logLevels	: 'test',
			filePath	: true
		});

		assert.deepStrictEqual( file.logLevel, LOG_LEVELS.info );
		assert.deepStrictEqual( file.logLevels, LOG_LEVELS );
		assert.deepStrictEqual( file.supportedLevels, Object.values( LOG_LEVELS ) );
		assert.deepStrictEqual( file.filePath, false );
		assert.deepStrictEqual( file.fileStream, null );

		done();
	}
});

test({
	message	: 'File.constructor on valid configuration',
	test	: ( done )=>{
		let logLevel		= LOG_LEVELS.error;
		let logLevels		= LOG_LEVELS;
		let filePath		= helpers.getTestFile();
		let expectedPath	= helpers.getTestFilePath();
		let MockedFile		= Mock( File );

		let file	= new MockedFile({
			logLevel,
			logLevels,
			filePath
		});

		assert.deepStrictEqual( file.logLevel, logLevel );
		assert.deepStrictEqual( file.logLevels, logLevels );
		assert.deepStrictEqual( file.supportedLevels, Object.values( logLevels ) );
		assert.deepStrictEqual( file.filePath, expectedPath );
		assert.deepStrictEqual( file.fileStream !== null, true );

		file.fileStream.end();
		helpers.clearUpTestFile();

		done();
	}
});
