'use strict';

const ImageFileStream			= require( '../../../../server/components/file_streams/image_file_stream' );
const { assert, test, helpers }	= require( '../../../test_helper' );
const path						= require( 'path' );
const fs						= require( 'fs' );

const formats					= {
	'.apng'	: 'image/apng',		'.avif'	: 'image/avif',		'.gif'		: 'image/gif',		'.jpg'	: 'image/jpeg',
	'.jpeg'	: 'image/jpeg',		'.jfif'	: 'image/jpeg',		'.pjpeg'	: 'image/jpeg',		'.pjp'	: 'image/jpeg',
	'.png'	: 'image/png',		'.svg'	: 'image/svg+xml',	'.webp'		: 'image/webp',		'.ico'	: 'image/x-icon',
	'.bmp'	: 'image/bmp',
};

test({
	message			: 'ImageFileStream.getFileStream with different types',
	dataProvider:	[
		[path.join( __dirname, './fixtures/testFile.png' ), 'image/png'],
		[path.join( __dirname, './fixtures/testFile.apng' ), 'image/apng'],
		[path.join( __dirname, './fixtures/testFile.avif' ), 'image/avif'],
		[path.join( __dirname, './fixtures/testFile.gif' ), 'image/gif'],
		[path.join( __dirname, './fixtures/testFile.jpg' ), 'image/jpeg'],
		[path.join( __dirname, './fixtures/testFile.jpeg' ), 'image/jpeg'],
		[path.join( __dirname, './fixtures/testFile.jfif' ), 'image/jpeg'],
		[path.join( __dirname, './fixtures/testFile.pjpeg' ), 'image/jpeg'],
		[path.join( __dirname, './fixtures/testFile.pjp' ), 'image/jpeg'],
		[path.join( __dirname, './fixtures/testFile.svg' ), 'image/svg+xml'],
		[path.join( __dirname, './fixtures/testFile.webp' ), 'image/webp'],
		[path.join( __dirname, './fixtures/testFile.ico' ), 'image/x-icon'],
		[path.join( __dirname, './fixtures/testFile.bmp' ), 'image/bmp']
	],
	test			: ( done, filePath, expectedMimeType ) => {
		const eventRequest	= helpers.getEventRequest( undefined, undefined, undefined );
		const fileStream	= new ImageFileStream();
		let mimeType		= '';

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
