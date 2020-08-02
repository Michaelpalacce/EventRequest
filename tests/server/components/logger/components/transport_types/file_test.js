
'use strict';

// Dependencies
const { assert, test, Mock, Mocker, helpers, tester }	= require( '../../../../../test_helper' );
const { LOG_LEVELS, File, Log, Transport }				= require( './../../../../../../server/components/logger/loggur' );
const { Writable }										= require( 'stream' );
const fs												= require( 'fs' );
const path												= require( 'path' );

helpers.clearUpTestFile();

test({
	message	: 'File.constructor on defaults',
	test	: ( done ) => {
		assert.throws(() => {
			new File();
		});

		try
		{
			new File();
		}
		catch ( e )
		{
			assert.deepStrictEqual( e.message, 'app.er.logging.transport.file.fileLogPathNotProvided' );
		}

		done();
	}
});

test({
	message	: 'File.constructor.with.valid.config',
	test	: ( done ) => {
		const file	= new File( { filePath: 'test' } );

		assert.deepStrictEqual( file.filePath, 'test' );
		assert.deepStrictEqual( file.formatter.toString(), File.formatters.plain( { noRaw : true } ).toString() );
		assert.deepStrictEqual( file.processors.length, 3 );

		done();
	}
});

test({
	message	: 'File.constructor.with.custom.config',
	test	: ( done ) => {
		const file	= new File( { filePath: 'test', processors: [File.processors.stack()], formatter: File.formatters.json() } );

		assert.deepStrictEqual( file.formatter.toString(), File.formatters.json().toString() );
		assert.deepStrictEqual( file.processors.length, 1 );

		done();
	}
});

test({
	message	: 'File.getWriteStream.when.directory.does.not.exist',
	test	: ( done ) => {
		const dir			= `./tests/server/components/logger/components/transport_types/fixtures/unexisting_dir${Math.random()}/` ;
		const fileName		= 'file.log';

		const fileTransport	= new File( { filePath: dir + fileName } );

		fileTransport.getWriteStream();

		setTimeout(() => {
			assert.deepStrictEqual( fs.existsSync( dir ), true );

			fs.unlinkSync( fileTransport.getFileName() );

			fs.unlink( dir, () => {
				done();
			});
		}, 250 );
	}
});

test({
	message	: 'File.log.if.rejected',
	test	: ( done ) => {
		const filePath			= './tests/server/components/logger/components/transport_types/fixtures/file.log';

		const MockedFile		= Mock( File );
		const MockedWritable	= Mock( Writable );
		const writable			= new MockedWritable();
		const expectedError		= 'someError';

		const fileTransport		= new MockedFile( { filePath } );

		fileTransport._mock({
			method			: 'getWriteStream',
			shouldReturn	: () => {
				writable._mock({
					method			: 'write',
					shouldReturn	: ( text, type, callback ) => {
						callback( expectedError );
					}
				});

				return writable;
			},
			called			: 1
		});
		fileTransport.log( Log.getInstance( 'test' ) ).then(() => {
			done( 'Should have rejected!' )
		}).catch( ( err ) => {
			assert.deepStrictEqual( err, expectedError );
			helpers.clearUpTestFile();
			done();
		});
	}
});

test({
	message	: 'File.log.if.fileStream.on.exception',
	test	: ( done ) => {
		const filePath			= './tests/server/components/logger/components/transport_types/fixtures/file.log';

		const MockedFile		= Mock( File );
		const MockedWritable	= Mock( Writable );
		const writable			= new MockedWritable();
		const expectedError		= 'someError';

		const fileTransport		= new MockedFile( { filePath } );

		fileTransport._mock({
			method			: 'getWriteStream',
			shouldReturn	: () => {
				writable._mock({
					method			: 'write',
					shouldReturn	: ( text, type, callback ) => {
						throw new Error( expectedError );
					}
				});

				return writable;
			},
			called			: 1
		});
		fileTransport.log( Log.getInstance( 'test' ) ).then(() => {
			done( 'Should have rejected!' )
		}).catch( ( err ) => {
			assert.deepStrictEqual( err, new Error( expectedError ) );
			helpers.clearUpTestFile();
			done();
		});
	}
});

test({
	message	: 'File.constructor on invalid configuration',
	test	: ( done ) => {
		let file	= new File({
			logLevel		: 'test',
			logLevels		: 'test',
			filePath		: './path'
		});

		assert.deepStrictEqual( file.logLevel, LOG_LEVELS.info );
		assert.deepStrictEqual( file.logLevels, LOG_LEVELS );
		assert.deepStrictEqual( file.supportedLevels, Object.values( LOG_LEVELS ) );
		assert.deepStrictEqual( file.filePath, './path' );
		assert.deepStrictEqual( file.fileStream, null );

		done();
	}
});

test({
	message	: 'File.constructor.on.valid.configuration',
	test	: ( done ) => {
		let logLevel		= LOG_LEVELS.error;
		let logLevels		= LOG_LEVELS;
		let called			= 0;
		let filePath		= helpers.getTestFile();
		let expectedPath	= helpers.getTestFilePath();
		let MockedFile		= Mock( File );
		Mocker( MockedFile, {
			method			: 'getWriteStream',
			shouldReturn	: () => {
				++ called;
			},
			called			: 0
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
		assert.deepStrictEqual( file.fileStream === null, true );
		assert.deepStrictEqual( called, 0 );

		helpers.clearUpTestFile();

		done();
	}
});

test({
	message	: 'File.getFileName adds timestamp',
	test	: ( done ) => {
		let logLevel		= LOG_LEVELS.error;
		let logLevels		= LOG_LEVELS;
		let filePath		= './server/components/logger/components/transport_types/fixtures/error.log';
		let MockedFile		= Mock( File );

		let file			= new MockedFile({
			logLevel,
			logLevels,
			filePath
		});

		let now				= new Date();
		let startOfDay		= new Date( now.getFullYear(), now.getMonth(), now.getDate() );
		let timestamp		= startOfDay / 1000;

		let expectedPath	= path.join(
			path.dirname( require.main.filename ),
			filePath
		);

		expectedPath	= path.parse( expectedPath );
		expectedPath	= expectedPath.name + timestamp + expectedPath.ext;

		assert.equal( file.getFileName().indexOf( expectedPath ) !== -1, true );

		helpers.clearUpTestFile();

		done();
	}
});

test({
	message	: 'File.getCurrentData gives the beginning of the day',
	test	: ( done ) => {
		let logLevel	= LOG_LEVELS.error;
		let logLevels	= LOG_LEVELS;
		let filePath	= './server/components/logger/components/transport_types/fixtures/error.log';
		let MockedFile	= Mock( File );

		let file	= new MockedFile({
			logLevel,
			logLevels,
			filePath
		});

		let now			= new Date();
		let startOfDay	= new Date( now.getFullYear(), now.getMonth(), now.getDate() );
		let timestamp	= startOfDay / 1000;

		assert.equal( file.getCurrentDayTimestamp(), timestamp );

		helpers.clearUpTestFile();

		done();
	}
});

test({
	message	: 'File.log.returns.a.Promise',
	test	: ( done ) => {
		let filePath	= path.join( __dirname, './fixtures/testfile' );
		let file		= new File( { logLevel: 600, filePath } );

		let logData	= 'This is a test log';
		let promise	= file.log( Log.getInstance( logData ) );

		assert.equal( promise instanceof Promise, true );

		setTimeout(() => {
			promise.then(() => {
					let data	= fs.readFileSync( file.getFileName() );
					assert.equal( data.toString().indexOf( logData ) !== -1, true );

					helpers.clearUpTestFile();

					done();
				}
			).catch(() => { done( 'An error ocurred' ); });
		}, 100 );
	}
});


test({
	message	: 'File.formatters.is.same.as.Transport.formatters',
	test	: ( done ) => {
		assert.deepStrictEqual( File.formatters, Transport.formatters );

		done();
	}
});

test({
	message	: 'File.processors.is.same.as.Transport.processors',
	test	: ( done ) => {
		assert.deepStrictEqual( File.processors, Transport.processors );

		done();
	}
});