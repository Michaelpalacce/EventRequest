'use strict';

const ImageFileStream					= require( '../../../../server/components/file_streams/image_file_stream' );
const { assert, test, Mock, helpers }	= require( '../../../test_helper' );
const path								= require( 'path' );
const fs								= require( 'fs' );

const DEFAULT_TEST_FILE			= path.join( __dirname, './fixtures/testFile.png' );

test({
	message	: 'ImageFileStream.getFileStream',
	test	: ( done ) => {
		const eventRequest	= helpers.getEventRequest( undefined, undefined, undefined );
		const fileStream	= new ImageFileStream();

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
