'use strict';

const { Mock, Mocker, assert, test, helpers }	= require( '../../../test_helper' );
const MultipartDataParser						= require( '../../../../server/components/body_parsers/multipart_data_parser' );
const os										= require( 'os' );
const fs										= require( 'fs' );
const path										= require( 'path' );

const multipartData								= fs.readFileSync( path.join( __dirname, './fixture/multipart_data' ) );
const MockMultipartDataParser					= Mocker( Mock( MultipartDataParser ), {
	method	: 'setUpTempDir'
} );

test({
	message	: 'MultipartDataParser.constructor does not throw on defaults',
	test	: ( done ) => {
		new MockMultipartDataParser();

		done();
	}
});

test({
	message	: 'MultipartDataParser.determineEOL.with.different.lines',
	test	: ( done ) => {
		const multipartDataParser		= new MultipartDataParser();
		const boundry					= '---------------------------9051914041544843365972754266';
		multipartDataParser.boundary	= boundry;

		multipartDataParser.determineEOL( Buffer.from( boundry + '\r\n' ) )
		assert.deepStrictEqual( multipartDataParser.EOL, '\r\n' );
		assert.deepStrictEqual( multipartDataParser.EOL_LENGTH, 2 );

		multipartDataParser.determineEOL( Buffer.from( boundry + '\r' ) )
		assert.deepStrictEqual( multipartDataParser.EOL, '\r' );
		assert.deepStrictEqual( multipartDataParser.EOL_LENGTH, 1 );

		multipartDataParser.determineEOL( Buffer.from( boundry + '\n' ) )
		assert.deepStrictEqual( multipartDataParser.EOL, '\n' );
		assert.deepStrictEqual( multipartDataParser.EOL_LENGTH, 1 );

		// Default
		multipartDataParser.determineEOL( Buffer.from( boundry ) )
		assert.deepStrictEqual( multipartDataParser.EOL, '\r\n' );
		assert.deepStrictEqual( multipartDataParser.EOL_LENGTH, 2 );

		done();
	}
});

test({
	message	: 'MultipartDataParser.onDataReceivedCallback.in.case.of.exception.during.extraction',
	test	: ( done ) => {
		const MockDataParser			= Mock( MultipartDataParser );
		const multipartDataParser		= new MockDataParser();
		multipartDataParser._mock({
			method			: 'extractChunkData',
			shouldReturn	: () => {
				throw new Error( 'error' );
			}
		});

		multipartDataParser.on( 'onError', () => {
			done();
		});

		multipartDataParser.onDataReceivedCallback( Buffer.from( 'test' ) );
	}
});

test({
	message	: 'MultipartDataParser.flush.buffer.when.part.is.invalid',
	test	: ( done ) => {
		const MockDataParser			= Mock( MultipartDataParser );
		const multipartDataParser		= new MockDataParser();

		assert.throws(() => {
			multipartDataParser.flushBuffer( { type: 'wrong' }, Buffer.from( 'test' ) );
		});

		done();
	}
});

test({
	message	: 'MultipartDataParser.handleError.throws',
	test	: ( done ) => {
		const MockDataParser		= Mock( MultipartDataParser );
		const multipartDataParser	= new MockDataParser();

		assert.throws(() => {
			multipartDataParser.handleError( 'error' );
		});

		done();
	}
});

test({
	message	: 'MultipartDataParser.getHeaderData.when.headers.not.set',
	test	: ( done ) => {
		assert.deepStrictEqual( MultipartDataParser.getHeaderData( { 'content-type' : '' } ), false );
		assert.deepStrictEqual( MultipartDataParser.getHeaderData( { 'content-length' : '' } ), false );
		assert.deepStrictEqual( MultipartDataParser.getHeaderData( {} ), false );

		done();
	}
});

test({
	message	: 'MultipartDataParser.constructor on correct arguments',
	test	: ( done ) => {
		let tempDir					= '/test';
		let maxPayload				= 100;
		let cleanUpItemsTimeoutMS	= 100;
		let multipartParser	= new MockMultipartDataParser({
			tempDir,
			maxPayload,
			cleanUpItemsTimeoutMS
		});

		assert.equal( multipartParser.tempDir, tempDir );
		assert.equal( multipartParser.maxPayload, maxPayload );
		assert.equal( multipartParser.cleanUpItemsTimeoutMS, 100 );

		done();
	}
});

test({
	message	: 'MultipartDataParser.terminate terminates the parser',
	test	: ( done ) => {
		let tempDir			= '/test';
		let maxPayload		= 10;
		let multipartParser	= new MockMultipartDataParser({
			tempDir,
			maxPayload
		});

		multipartParser.parts			= [];
		multipartParser.parsingError	= true;
		multipartParser.ended			= true;

		multipartParser.event			= helpers.getEventRequest();
		multipartParser.callback		= () => {};
		multipartParser.headerData		= {};
		multipartParser.boundary		= 'test';
		multipartParser.on( 'test', () => {} );
-
		multipartParser.terminate();

		assert.deepEqual( multipartParser.parts, [] );
		assert.equal( multipartParser.parsingError, false );
		assert.equal( multipartParser.ended, false );
		assert.equal( multipartParser.headerData, null );
		assert.equal( multipartParser.boundary, null );
		assert.equal( multipartParser.listeners( 'test' ).length, 0 );

		done();
	}
});

test({
	message		: 'MultipartDataParser.parse.parses.multipart.data',
	test		: ( done ) => {
		let tempDir			= path.join( __dirname, './fixture/testUploads' );
		let multipartParser	= new MockMultipartDataParser( { tempDir } );
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'multipart/form-data; boundary=---------------------------9051914041544843365972754266',
				'content-length'	: '10000',
			}
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback ) => {
				if ( event === 'data' )
				{
					let data			= multipartData.toString();
					let placeToSplit	= data.length / 2;
					let firstPart		= data.substr( 0, placeToSplit );
					let secondPart		= data.substr( placeToSplit );
					callback( Buffer.from( firstPart ) );
					callback( Buffer.from( secondPart ) );
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});

		multipartParser.parse( eventRequest ).then(( parsedData ) => {
			const body	= parsedData.body;

			// Sync delay
			setTimeout(() => {
				assert.deepStrictEqual( parsedData.rawBody, {} );
				assert.equal( fs.readFileSync( body.$files[0].path ).toString().includes( 'Content of a.txt.' ), true );
				assert.equal( body.text, 'text default' );
				assert.equal( body.$files[0].name, 'a.txt' );
				assert.equal( body.$files[0].contentType, 'text/plain' );
				assert.equal( fs.readFileSync( body.$files[1].path ).toString().includes( '<!DOCTYPE html><title>Content of a.html.</title>' ), true );
				assert.equal( body.$files[1].name, 'a.html' );
				assert.equal( body.$files[1].contentType, 'text/html' );

				multipartParser.terminate();
				done();
			}, 50 );

		}).catch( done );
	}
});

test({
	message		: 'MultipartDataParser.parse.parses.multipart.data.with.invalid.name',
	test		: ( done ) => {
		let tempDir			= path.join( __dirname, './fixture/testUploads' );
		let multipartParser	= new MockMultipartDataParser( { tempDir } );
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'multipart/form-data; boundary=---------------------------9051914041544843365972754266',
				'content-length'	: '10000',
			}
		);

		const multipartData	= 'Content-Type: multipart/form-data; boundary=---------------------------9051914041544843365972754266\r\n' +
			'Content-Length: 554\r\n' +
			'\r\n' +
			'-----------------------------9051914041544843365972754266\r\n' +
			'Content-Disposition: form-data; name=""\r\n' +
			'\r\n' +
			'text default\r\n' +
			'-----------------------------9051914041544843365972754266\r\n' +
			'Content-Disposition: form-data; name="file1"; filename="a.txt"\r\n' +
			'Content-Type: text/plain\r\n' +
			'\r\n' +
			'Content of a.txt.\r\n' +
			'-----------------------------9051914041544843365972754266\r\n' +
			'Content-Disposition: form-data; name="file2"; filename="a.html"\r\n' +
			'Content-Type: text/html\r\n' +
			'\r\n' +
			'<!DOCTYPE html><title>Content of a.html.</title>\r\n' +
			'-----------------------------9051914041544843365972754266--';

		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback ) => {
				if ( event === 'data' )
				{
					let data			= multipartData;
					let placeToSplit	= data.length / 2;
					let firstPart		= data.substr( 0, placeToSplit );
					let secondPart		= data.substr( placeToSplit );
					callback( Buffer.from( firstPart ) );
					callback( Buffer.from( secondPart ) );
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});

		multipartParser.parse( eventRequest ).then( () => {
			done( 'Should not have parsed' );
		}).catch( ( error ) => {
			assert.deepStrictEqual( error, '104' );
			done();
		});
	}
});

test({
	message		: 'MultipartDataParser.parse.parses.multipart.data.with.invalid.filename.skips.the.file',
	test		: ( done ) => {
		let tempDir			= path.join( __dirname, './fixture/testUploads' );
		let multipartParser	= new MockMultipartDataParser( { tempDir } );
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'multipart/form-data; boundary=---------------------------9051914041544843365972754266',
				'content-length'	: '10000',
			}
		);

		const multipartData	= 'Content-Type: multipart/form-data; boundary=---------------------------9051914041544843365972754266\r\n' +
			'Content-Length: 554\r\n' +
			'\r\n' +
			'-----------------------------9051914041544843365972754266\r\n' +
			'Content-Disposition: form-data; name="text"\r\n' +
			'\r\n' +
			'text default\r\n' +
			'-----------------------------9051914041544843365972754266\r\n' +
			'Content-Disposition: form-data; name="file1"; filename=""\r\n' +
			'Content-Type: text/plain\r\n' +
			'\r\n' +
			'Content of a.txt.\r\n' +
			'-----------------------------9051914041544843365972754266\r\n' +
			'Content-Disposition: form-data; name="file2"; filename="a.html"\r\n' +
			'Content-Type: text/html\r\n' +
			'\r\n' +
			'<!DOCTYPE html><title>Content of a.html.</title>\r\n' +
			'-----------------------------9051914041544843365972754266--';

		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback ) => {
				if ( event === 'data' )
				{
					let data			= multipartData;
					let placeToSplit	= data.length / 2;
					let firstPart		= data.substr( 0, placeToSplit );
					let secondPart		= data.substr( placeToSplit );
					callback( Buffer.from( firstPart ) );
					callback( Buffer.from( secondPart ) );
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});

		multipartParser.parse( eventRequest ).then( ( parsedData ) => {
			setTimeout(() => {
				assert.deepStrictEqual( parsedData.rawBody, {} );
				assert.deepStrictEqual( parsedData.body.$files.length, 1 );
				assert.deepStrictEqual( parsedData.body.$files[0].name, 'a.html' );
				assert.deepStrictEqual( parsedData.body.text, 'text default' );
				assert.deepStrictEqual( parsedData.body.file1, 'Content of a.txt.' );

				done();
			}, 75 );
		}).catch( done );
	}
});

const placesToSplitProvider	= [];
const dataLength			= multipartData.toString().length;

for ( let i = 0; i < dataLength; i ++ )
{
	placesToSplitProvider.push( [i] );
}

test({
	message			: 'MultipartDataParser.parse.parses.multipart.data.with.different.cuts',
	dataProvider	: placesToSplitProvider,
	test			: ( done, placeToSplit ) => {
		let tempDir			= path.join( __dirname, './fixture/testUploads' );
		let multipartParser	= new MockMultipartDataParser( { tempDir } );
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'multipart/form-data; boundary=---------------------------9051914041544843365972754266',
				'content-length'	: '10000',
			}
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback ) => {
				if ( event === 'data' )
				{
					let data			= multipartData.toString();
					let firstPart		= data.substr( 0, placeToSplit );
					let secondPart		= data.substr( placeToSplit );
					callback( Buffer.from( firstPart ) );
					callback( Buffer.from( secondPart ) );
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});

		multipartParser.parse( eventRequest ).then(( parsedData ) => {
			const body	= parsedData.body;

			// Sync delay
			setTimeout(() => {
				assert.deepStrictEqual( parsedData.rawBody, {} );
				assert.equal( fs.readFileSync( body.$files[0].path ).toString().includes( 'Content of a.txt.' ), true );
				assert.equal( body.text, 'text default' );
				assert.equal( body.$files[0].name, 'a.txt' );
				assert.equal( body.$files[0].contentType, 'text/plain' );
				assert.equal( fs.readFileSync( body.$files[1].path ).toString().includes( '<!DOCTYPE html><title>Content of a.html.</title>' ), true );
				assert.equal( body.$files[1].name, 'a.html' );
				assert.equal( body.$files[1].contentType, 'text/html' );

				multipartParser.terminate();
				done();
			}, 75 );
		}).catch( done );
	}
});


test({
	message			: 'MultipartDataParser.parse.parses.multipart.data.with.2.bytes.at.a.time',
	test			: ( done ) => {
		let tempDir			= path.join( __dirname, './fixture/testUploads' );
		let multipartParser	= new MockMultipartDataParser( { tempDir } );
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'multipart/form-data; boundary=---------------------------9051914041544843365972754266',
				'content-length'	: '10000',
			}
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback ) => {
				if ( event === 'data' )
				{
					let data			= multipartData.toString();
					let current	= 0;
					let step	= 2;

					while ( true )
					{
						const currentData	= data.substr( current, step );

						if ( currentData === '' )
							break;

						current	+= step;

						callback( Buffer.from( currentData ) );
					}
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});

		multipartParser.parse( eventRequest ).then(( parsedData ) => {
			const body	= parsedData.body;

			// Sync delay
			setTimeout(() => {
				assert.deepStrictEqual( parsedData.rawBody, {} );
				assert.equal( fs.readFileSync( body.$files[0].path ).toString().includes( 'Content of a.txt.' ), true );
				assert.equal( body.text, 'text default' );
				assert.equal( body.$files[0].name, 'a.txt' );
				assert.equal( body.$files[0].contentType, 'text/plain' );
				assert.equal( fs.readFileSync( body.$files[1].path ).toString().includes( '<!DOCTYPE html><title>Content of a.html.</title>' ), true );
				assert.equal( body.$files[1].name, 'a.html' );
				assert.equal( body.$files[1].contentType, 'text/html' );

				multipartParser.terminate();
				done();
			}, 50 );

		}).catch( done );
	}
});
