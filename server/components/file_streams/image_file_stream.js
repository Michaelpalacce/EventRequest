'use strict';

// Dependencies
const FileStream	= require( './file_stream' );
const path			= require( 'path' );
const fs			= require( 'fs' );


/**
 * @brief	The type of file this stream supports
 *
 * @var		String
 */
const STREAM_TYPE	= 'image';

/**
 * @brief	Used to stream text files
 */
class ImageFileStream extends FileStream
{
	/**
	 * @see	FileStream::constructor()
	 */
	constructor( options )
	{
		super( options );
		this.SUPPORTED_FORMATS	= [
			'.apng', '.bmp', '.gif', '.ico', '.cur', '.jpeg', '.jpg', '.jfif', '.pjpeg', '.pjp', '.png', '.svg', '.tif', '.tiff', '.webp'
		];
		this._streamType		= STREAM_TYPE;

		this.sanitize();
	}

	/**
	 * @see	FileStream::sanitize()
	 */
	sanitize()
	{
	}

	/**
	 * @see	FileStream::supports()
	 */
	supports( file )
	{
		file	= path.parse( file );
		return this.SUPPORTED_FORMATS.indexOf( file.ext ) !== -1;
	}

	/**
	 * @see	FileStream::getFileStream()
	 */
	getFileStream( event, file, options = {} )
	{
		if ( ! fs.existsSync( file ) )
		{
			return null;
		}

		const stream	= fs.createReadStream( file, options );

		event.emit( 'stream_start', { stream } );

		return stream;
	}

	/**
	 * @see	FileStream::stream()
	 */
	getType()
	{
		return this._streamType;
	}
}

module.exports	= ImageFileStream;
