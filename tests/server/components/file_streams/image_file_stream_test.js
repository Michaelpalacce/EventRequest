'use strict';

const ImageFileStream			= require( '../../../../server/components/file_streams/image_file_stream' );
const { assert, test, helpers }	= require( '../../../test_helper' );
const path						= require( 'path' );
const fs						= require( 'fs' );

test({
	message			: 'ImageFileStream.getFileStream with different types',
	dataProvider:	[
		[path.join( __dirname, './fixtures/testFile.png' ), 'image/png'],
		[path.join( __dirname, './fixtures/testFile.gif' ), 'image/gif'],
		[path.join( __dirname, './fixtures/testFile.jpg' ), 'image/jpeg'],
		[path.join( __dirname, './fixtures/testFile.jpeg' ), 'image/jpeg'],
		[path.join( __dirname, './fixtures/testFile.svg' ), 'image/svg+xml'],
		[path.join( __dirname, './fixtures/testFile.webp' ), 'image/webp'],
		[path.join( __dirname, './fixtures/testFile.ico' ), 'image/x-icon'],
		[path.join( __dirname, './fixtures/testFile.bmp' ), 'image/bmp'],
		[path.join( __dirname, './fixtures/testFile.unknown' ), "*/*"],
	],
	test			: ( done, filePath, expectedMimeType ) => {
		const eventRequest	= helpers.getEventRequest( undefined, undefined, undefined );
		const fileStream	= new ImageFileStream();
		let mimeType		= null;

		eventRequest._mock({
			method			: 'setResponseHeader',
			shouldReturn	: ( key, value ) => {
				mimeType	= value;
			}
		});

		const stream		= fileStream.getFileStream( eventRequest, filePath );

		assert.deepStrictEqual( stream instanceof fs.ReadStream, true );

		const data	= [];

		stream.on( 'data', ( chunk ) => {
			data.push( chunk );
		});

		stream.on( 'end', () => {
			assert.deepStrictEqual( Buffer.concat( data ).toString(), 'This is a test file. It has a bit of data.' );
			assert.deepStrictEqual( mimeType, expectedMimeType );
			done();
		});
	}
});
