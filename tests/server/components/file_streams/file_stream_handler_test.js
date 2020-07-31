'use strict';

const FileStreamHandler	= require( '../../../../server/components/file_streams/file_stream_handler' );
const TextFileStream	= require( '../../../../server/components/file_streams/text_file_stream' );
const { assert, test }	= require( '../../../test_helper' );
const path				= require( 'path' );

const DEFAULT_TEST_FILE			= path.join( __dirname, './fixtures/testFile.txt' );
const UNSUPPORTED_TEST_FILE		= path.join( __dirname, './fixtures/testFile.unsupported' );

test({
	message	: 'FileStreamHandler.getFileStreamerForType',
	test	: ( done ) => {
		const fileStreamer	= FileStreamHandler.getFileStreamerForType( DEFAULT_TEST_FILE );

		assert.deepStrictEqual( fileStreamer instanceof TextFileStream, true );

		done();
	}
});

test({
	message	: 'FileStreamHandler.getFileStreamerForType.if.file.not.a.string',
	test	: ( done ) => {
		const fileStreamer	= FileStreamHandler.getFileStreamerForType( 123 );

		assert.deepStrictEqual( fileStreamer, null );

		done();
	}
});

test({
	message	: 'FileStreamHandler.getFileStreamerForType.if.file.does.not.exist',
	test	: ( done ) => {
		const fileStreamer	= FileStreamHandler.getFileStreamerForType( 'wrong' );

		assert.deepStrictEqual( fileStreamer, null );

		done();
	}
});

test({
	message	: 'FileStreamHandler.getFileStreamerForType.if.file.not.supported',
	test	: ( done ) => {
		const fileStreamer	= FileStreamHandler.getFileStreamerForType( UNSUPPORTED_TEST_FILE );

		assert.deepStrictEqual( fileStreamer, null );

		done();
	}
});
