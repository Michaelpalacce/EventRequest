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
