'use strict';

const { Mock, Mocker, assert, test, helpers }	= require( './../../../testing_suite' );
const { MultipartFormParser }					= require( './../../../../server/components/body_parser_handler' );
const os										= require( 'os' );

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

		multipartParser.terminate();

		assert.equal( multipartParser.parts, null );
		assert.equal( multipartParser.parsingError, false );
		assert.equal( multipartParser.ended, false );
		assert.equal( multipartParser.callback, null );
		assert.equal( multipartParser.headerData, null );
		assert.equal( multipartParser.boundary, null );
		assert.equal( multipartParser.listeners( 'test' ).length, 0 );

		done();
	}
});
