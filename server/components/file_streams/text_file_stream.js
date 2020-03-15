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
const STREAM_TYPE	= 'text';

/**
 * @brief	Used to stream text files
 */
class TextFileStream extends FileStream
{
	/**
	 * @see	FileStream::constructor()
	 */
	constructor( options )
	{
		super( options );
		this.SUPPORTED_FORMATS	= [
			'.txt', '.js', '.php', '.html', '.json', '.cpp', '.h',
			'.md', '.bat', '.log', '.yml', '.ini', '.ts', '.ejs', '.twig',
			'', '.rtf', '.apt', '.fodt', '.rft', '.apkg', '.fpt', '.lst',
			'.doc', '.docx', '.man', '.plain', '.text', '.odm', '.readme',
			'.cmd', '.ps1'
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
		return this.SUPPORTED_FORMATS.indexOf( file.ext.toLowerCase() ) !== -1;
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

		event.emit( 'stream_start' );

		return fs.createReadStream( file );
	}

	/**
	 * @see	FileStream::stream()
	 */
	getType()
	{
		return this._streamType;
	}
}

module.exports	= TextFileStream;
