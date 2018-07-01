'use strict';

// Dependencies
const { assert, test, Mock, Mocker, helpers }	= require( './../../../../../testing_suite' );
const { LOG_LEVELS, File, Log }					= require( './../../../../../../server/components/logger/loggur' );
const { Writable }								= require( 'stream' );
const fs										= require( 'fs' );
const path										= require( 'path' );

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
		let called			= 0;
		let filePath		= helpers.getTestFile();
		let expectedPath	= helpers.getTestFilePath();
		let MockedFile		= Mock( File );
		Mocker( MockedFile, {
			method			: 'getWriteStream',
			shouldReturn	: ()=>{
				++ called;
				return new Writable();
			},
			called			: 1
		} );

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
		assert.deepStrictEqual( called, 1 );

		helpers.clearUpTestFile();

		done();
	}
});

test({
	message	: 'File.format returns a string',
	test	: ( done )=>{
		let logLevel	= LOG_LEVELS.error;
		let logLevels	= LOG_LEVELS;
		let filePath	= helpers.getTestFile();
		let MockedFile	= Mock( File );

		Mocker( MockedFile, {
			method			: 'getWriteStream',
			shouldReturn	: ()=>{},
			called			: 1
		} );

		let file	= new MockedFile({
			logLevel,
			logLevels,
			filePath
		});

		assert.equal( typeof file.format( Log.getInstance( 'test' ) ), 'string' );

		helpers.clearUpTestFile();

		done();
	}
});

test({
	message	: 'File.log returns a Promise',
	test	: ( done )=>{
		let logLevel	= LOG_LEVELS.error;
		let logLevels	= LOG_LEVELS;
		let filePath	= helpers.getTestFile();
		let MockedFile	= Mock( File );

		Mocker( MockedFile, {
			method			: 'getWriteStream',
			shouldReturn	: ()=>{
				return fs.createWriteStream( path.join( __dirname, './fixtures/testfile' ), {
					flags		: 'w',
					autoClose	: true
				});
			},
			called			: 1
		} );

		let file	= new MockedFile({
			logLevel,
			logLevels,
			filePath
		});

		assert.equal( file.log( Log.getInstance( 'test' ) ) instanceof Promise, true );

		helpers.clearUpTestFile();

		done();
	}
});
