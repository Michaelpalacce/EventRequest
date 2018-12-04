'use strict';

const { Mock, Mocker, assert, test, helpers }	= require( './../../../testing_suite' );
const { MultipartFormParser }					= require( './../../../../server/components/body_parser_handler' );
const os										= require( 'os' );
const fs										= require( 'fs' );
const path										= require( 'path' );

let multipartData								= fs.readFileSync( path.join( __dirname, './fixture/multipart_data' ) );

let MockMultipartFormParser						= Mocker( Mock( MultipartFormParser ), {
	method	: 'setUpTempDir'
} );

test({
	message	: 'MultipartFormParser.constructor does not throw on defaults',
	test	: ( done )=>{
		new MockMultipartFormParser();

		done();
	}
});

test({
	message	: 'MultipartFormParser.constructor on correct arguments',
	test	: ( done )=>{
		let tempDir			= '/test';
		let maxPayload		= 100;
		let multipartParser	= new MockMultipartFormParser({
			tempDir,
			maxPayload
		});

		assert.equal( multipartParser.tempDir, tempDir );
		assert.equal( multipartParser.maxPayload, maxPayload );

		done();
	}
});

test({
	message	: 'MultipartFormParser.constructor on incorrect arguments',
	test	: ( done )=>{
		let tempDir			= [];
		let maxPayload		= [];
		let multipartParser	= new MockMultipartFormParser({
			tempDir,
			maxPayload
		});

		assert.equal( multipartParser.tempDir, os.tmpdir() );
		assert.equal( multipartParser.maxPayload, 0 );

		done();
	}
});

test({
	message	: 'MultipartFormParser.terminate terminates the parser',
	incomplete : true,
	test	: ( done )=>{
		let tempDir			= '/test';
		let maxPayload		= 10;
		let multipartParser	= new MockMultipartFormParser({
			tempDir,
			maxPayload
		});

		multipartParser.parts			= [];
		multipartParser.parsingError	= true;
		multipartParser.ended			= true;

		multipartParser.event			= helpers.getEventRequest();
		multipartParser.callback		= ()=>{};
		multipartParser.headerData		= {};
		multipartParser.boundary		= 'test';
		multipartParser.on( 'test', ()=>{} );
-
		multipartParser.terminate();

		assert.equal( multipartParser.parts, null );
		assert.equal( multipartParser.parsingError, false );
		assert.equal( multipartParser.ended, false );
		assert.equal( multipartParser.headerData, null );
		assert.equal( multipartParser.boundary, null );
		assert.equal( multipartParser.listeners( 'test' ).length, 0 );

		done();
	}
});

test({
	message		: 'MultipartFormParser.parse parses multipart data',
	incomplete : true,
	test		: ( done )=>{
		let tempDir			= path.join( __dirname, './fixture/testUploads');
		console.log( tempDir );
		let multipartParser	= new MockMultipartFormParser( { tempDir } );
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
			shouldReturn	: ( event, callback )=>{
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

		multipartParser.parse( eventRequest, ( err, body )=>{
			// Sync delay
			setTimeout(()=>{
				assert.equal( err, false );
				assert.equal( fs.readFileSync( body.files[0].path ).toString(), 'Content of a.txt.\r\n' );
				assert.equal( body.files[0].name, 'a.txt' );
				assert.equal( body.files[0].contentType, 'text/plain' );
				assert.equal( fs.readFileSync( body.files[1].path ).toString(), '<!DOCTYPE html><title>Content of a.html.</title>\r\n' );
				assert.equal( body.files[1].name, 'a.html' );
				assert.equal( body.files[1].contentType, 'text/html' );

				multipartParser.terminate();
				done();
			}, 1000 );
		});
	}
});
