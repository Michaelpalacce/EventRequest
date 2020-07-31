'use strict';

const AudioFileStream			= require( '../../../../server/components/file_streams/audio_file_stream' );
const { assert, test, helpers }	= require( '../../../test_helper' );
const path						= require( 'path' );
const fs						= require( 'fs' );

const DEFAULT_TEST_FILE			= path.join( __dirname, './fixtures/testFile.mp3' );

test({
	message	: 'AudioFileStream.getFileStream',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest( undefined, undefined, undefined );
		const fileStream	= new AudioFileStream();

		eventRequest._mock({
			method			: 'setResponseHeader',
			called			: 2,
			with			: [
				['Content-Type', 'audio/mp3'],
				['Content-Length', 42],
			],
		});

		const stream	= fileStream.getFileStream( eventRequest, DEFAULT_TEST_FILE );

		assert.deepStrictEqual( stream instanceof fs.ReadStream, true );

		const data	= [];

		stream.on( 'data', ( chunk ) => {
			data.push( chunk );
		});

		stream.on( 'end', () => {
			assert.deepStrictEqual( Buffer.concat( data ).toString(), 'This is a test file. It has a bit of data.' );
			done();
		});
	}
});

test({
	message	: 'AudioFileStream.getFileStream.with.range',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest( undefined, undefined, { range: '0-5' } );
		const fileStream	= new AudioFileStream();

		eventRequest._mock({
			method			: 'setResponseHeader',
			called			: 4,
			with			: [
				['Content-Type', 'audio/mp3'],
				['Content-Range', 'bytes 0-5/42'],
				['Accept-Ranges', 'bytes'],
				['Content-Length', 6],
			],
		});

		const stream	= fileStream.getFileStream( eventRequest, DEFAULT_TEST_FILE );

		assert.deepStrictEqual( stream instanceof fs.ReadStream, true );

		const data	= [];

		stream.on( 'data', ( chunk ) => {
			data.push( chunk );
		});

		stream.on( 'end', () => {
			assert.deepStrictEqual( Buffer.concat( data ).toString(), 'This i' );
			done();
		});
	}
});

test({
	message	: 'AudioFileStream.getFileStream.with.range.with.no.end',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest( undefined, undefined, { range: '2' } );
		const fileStream	= new AudioFileStream();

		eventRequest._mock({
			method			: 'setResponseHeader',
			called			: 4,
			with			: [
				['Content-Type', 'audio/mp3'],
				['Content-Range', 'bytes 2-41/42'],
				['Accept-Ranges', 'bytes'],
				['Content-Length', 40],
			],
		});

		const stream	= fileStream.getFileStream( eventRequest, DEFAULT_TEST_FILE );

		assert.deepStrictEqual( stream instanceof fs.ReadStream, true );

		const data	= [];

		stream.on( 'data', ( chunk ) => {
			data.push( chunk );
		});

		stream.on( 'end', () => {
			assert.deepStrictEqual( Buffer.concat( data ).toString(), 'is is a test file. It has a bit of data.' );
			done();
		});
	}
});
