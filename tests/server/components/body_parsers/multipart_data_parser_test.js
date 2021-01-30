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
	message	: 'MultipartDataParser.setUpTempDirIfDirDoesNotExist',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/unexisting${Math.random()}` );
		const parser	= new MultipartDataParser( { tempDir } );

		assert.deepStrictEqual( fs.existsSync( parser.tempDir ), true );

		fs.rmdirSync( tempDir );

		done();
	}
});

test({
	message	: 'MultipartDataParser.setUpTempDirIfDirExists',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );

		assert.deepStrictEqual( fs.existsSync( parser.tempDir ), true );

		done();
	}
});

test({
	message	: 'MultipartDataParser.clearUpLastPart',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );

		const part		= parser.getPartData();
		part.state		= 7;

		parser.parts	= [part]

		assert.deepStrictEqual( parser.parts, [{
			buffer		: Buffer.from( '' ),
			contentType	: '',
			name		: '',
			size		: 0,
			state		: 7
		}]);

		parser.clearUpLastPart();
		assert.deepStrictEqual( parser.parts, [{
			buffer		: Buffer.from( '' ),
			contentType	: '',
			name		: '',
			size		: 0,
			state		: 7
		}] );

		done();
	}
});

test({
	message	: 'MultipartDataParser.cleanUpItems.when.part.path.not.exists',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );

		const part		= parser.formPart();
		part.type		= 'file';

		parser.parts.$files	= [part]

		parser.cleanUpItems();

		setTimeout(()=>{
			done();
		}, 200 );
	}
});

test({
	message	: 'MultipartDataParser.cleanUpItems.when.file.does.not.exist',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );

		const part		= parser.formPart();
		part.type		= 'file';
		part.path		= 'wrong';

		parser.parts.$files	= [part]
		parser.cleanUpItems();

		setTimeout(()=>{
			done();
		}, 200 );
	}
});

test({
	message	: 'MultipartDataParser.cleanUpItems.when.parts.are.not.$files.yet.and.file.does.not.exist',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );

		const part		= parser.formPart();
		part.type		= 'file';
		part.path		= 'wrong';

		parser.parts	= [part]
		parser.cleanUpItems();

		setTimeout(()=>{
			done();
		}, 200 );
	}
});

test({
	message	: 'MultipartDataParser.cleanUpItems.when.parts.are.not.$files.yet.and.path.not.defined',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );

		const part		= parser.formPart();
		part.type		= 'file';

		parser.parts	= [part]
		parser.cleanUpItems();

		setTimeout(()=>{
			done();
		}, 200 );
	}
});

test({
	message	: 'MultipartDataParser.cleanUpItems.when.parts.are.not.$files.yet.and.type.is.not.file',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );

		const fileToDelete	= path.join( tempDir, 'fileToDelete' );

		fs.writeFileSync( fileToDelete, 'test' );

		const part		= parser.formPart();
		part.type		= 'file';
		part.path		= fileToDelete;

		parser.parts	= [part]
		parser.cleanUpItems();

		setTimeout(()=>{
			assert.deepStrictEqual( fs.existsSync( fileToDelete ), false );
			done();
		}, 250 );
	}
});

test({
	message	: 'MultipartDataParser.cleanUpItems.when.everything.was.successful.with.no.files',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );
		const part		= parser.formPart();

		parser.parts	= [part]
		parser.cleanUpItems();

		setTimeout(()=>{
			assert.deepStrictEqual( parser.parts, null );

			done();
		}, 250 );
	}
});

test({
	message	: 'MultipartDataParser.formatParts.does.not.work.with.unknown.types',
	test	: ( done ) => {
		const tempDir	= path.join( __dirname, `./fixture/testUploads` );
		const parser	= new MultipartDataParser( { tempDir } );

		const part		= parser.formPart();
		part.type		= 'unknown';

		parser.parts	= [part]

		assert.deepStrictEqual( parser.parts, [
			{
				buffer		: Buffer.from( '' ),
				contentType	: '',
				size		: 0,
				type		: 'unknown',
				name		: '',
				state		: 0
			}
		]);

		assert.deepStrictEqual( parser.formatParts(), {} );

		assert.deepStrictEqual( parser.parts, [
			{
				buffer		: Buffer.from( '' ),
				contentType	: '',
				size		: 0,
				type		: 'unknown',
				name		: '',
				state		: 0
			}
		]);

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
	message		: 'MultipartDataParser.parse.parses.multipart.data.when.cut.abruptly',
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
					let placeToSplit	= 700;
					let firstPart		= data.substr( 0, placeToSplit );
					callback( Buffer.from( firstPart ) );

					setTimeout(()=>{
						eventRequest.emit( 'cleanUp' );
					}, 10 );
				}
			}
		});

		multipartParser.parse( eventRequest ).then( ()=>{
			done( 'Should have never happened!' );
		}).catch( done );

		const files	= [];

		for ( const part of multipartParser.parts )
		{
			if ( part.type === 'file' )
				files.push( part );
		}

		setTimeout(() => {
			assert.deepStrictEqual( multipartParser.parts, null );

			for ( const file of files )
				assert.deepStrictEqual( fs.existsSync( file.path ), false );

			done();
		}, 210 );
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
			assert.deepStrictEqual( error, 'app.er.bodyParser.multipart.invalidMetadata' );
			done();
		});
	}
});

test({
	message		: 'MultipartDataParser.parse.parses.multipart.data.with.invalid.filename',
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
			'Content-Disposition: form-data; name="test"\r\n' +
			'\r\n' +
			'text default\r\n' +
			'-----------------------------9051914041544843365972754266\r\n' +
			'Content-Disposition: form-data; name="file1"; filename=\r\n' +
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
			assert.deepStrictEqual( parsedData.rawBody, {} );
			assert.deepStrictEqual( parsedData.body.$files.length, 1 );
			assert.deepStrictEqual( parsedData.body.$files[0].name, 'a.html' );
			assert.deepStrictEqual( parsedData.body.test, 'text default' );

			assert.deepStrictEqual( parsedData.body.file1, 'Content of a.txt.' );

			done();
		}).catch( done );
	}
});

test({
	message		: 'MultipartDataParser.parse.parses.multipart.data.with.invalid.amount.of.lines',
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
			assert.deepStrictEqual( error, 'app.er.bodyParser.multipart.invalidMetadata' );
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
			'Content-Disposition: form-data; name="test"\r\n' +
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
				assert.deepStrictEqual( parsedData.body.test, 'text default' );
				assert.deepStrictEqual( parsedData.body.file1, 'Content of a.txt.' );

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
		let multipartParser	= new MockMultipartDataParser( { tempDir, cleanUpItemsTimeoutMS: 50 } );
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

			if ( fs.existsSync( body.$files[0].path ) )

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
			}, 20 );
		}).catch( done );
	}
});
