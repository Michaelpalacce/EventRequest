'use strict';

// Dependencies
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
class TextFileStream
{
	/**
	 * @param	options Object
	 */
	constructor( options )
	{
		this.options			= options;
		this.SUPPORTED_FORMATS	= [
			'.txt', '.js', '.php', '.html', '.json', '.cpp', '.h',
			'.md', '.bat', '.log', '.yml', '.ini', '.ts', '.ejs', '.twig',
			'', '.rtf', '.apt', '.fodt', '.rft', '.apkg', '.fpt', '.lst',
			'.doc', '.docx', '.man', '.plain', '.text', '.odm', '.readme',
			'.cmd', '.ps1', '.conf', '.default', '.config'
		];
		this._streamType		= STREAM_TYPE;
	}

	/**
	 * @brief	Check whether the given file is supported by the file stream
	 *
	 * @param	file String
	 *
	 * @return	Boolean
	 */
	supports( file )
	{
		file	= path.parse( file );
		return this.SUPPORTED_FORMATS.indexOf( file.ext.toLowerCase() ) !== -1;
	}

	/**
	 * @brief	Gets an instance of file stream
	 *
	 * @return	AudioFileStream
	 */
	static getInstance( options )
	{
		return new this( options );
	}

	/**
	 * @brief	Gets the file stream for the file
	 *
	 * @param	event EventRequest
	 * @param	file String
	 * @param	options Object
	 *
	 * @return	ReadableStream
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
	 * @brief	Gets the type of file this stream supports
	 *
	 * @return	String
	 */
	getType()
	{
		return this._streamType;
	}
}

module.exports	= TextFileStream;
