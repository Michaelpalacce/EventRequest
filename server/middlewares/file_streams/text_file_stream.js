'use strict';

// Dependencies
const FileStream	= require( './file_stream' );
const path			= require( 'path' );
const fs			= require( 'fs' );

/**
 * @brief	Used to stream text files
 */
class TextFileStream extends FileStream
{
	/**
	 * @see	FileStream::constructor()
	 */
	constructor( event, options )
	{
		super( event, options );
		// @TODO ADD MORE FORMATS
		this.SUPPORTED_FORMATS	= [
			'.txt', '.js', '.php', '.html', '.json', '.cpp', '.h', '.md', '.bat', '.log', '.yml', '.ini'
		];

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
	 * @see	FileStream::stream()
	 */
	stream( file )
	{
		if ( ! fs.existsSync( file ) )
		{
			this.event.setError( 'File not found' );
			return;
		}

		this.event.clearTimeout();

		file	= fs.createReadStream( file );

		file.pipe( this.event.response );
	}
}

module.exports	= TextFileStream;
