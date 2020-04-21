'use strict';

// Dependencies
const path			= require( 'path' );
const fs			= require( 'fs' );

/**
 * @brief	The type of file this stream supports
 *
 * @var		String
 */
const STREAM_TYPE	= 'audio';

/**
 * @brief	Used to stream audio files
 */
class AudioFileStream
{
	/**
	 * @param	options Object
	 */
	constructor( options )
	{
		this.options			= options;
		this.SUPPORTED_FORMATS	= ['.mp3', '.flac', '.wav', '.aiff', '.aac'];
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
		return this.SUPPORTED_FORMATS.indexOf( file.ext ) !== -1;
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

		let stream		= null;
		const stat		= fs.statSync( file );
		const fileSize	= stat.size;
		const range		= event.getHeader( 'range' );

		event.setHeader( 'Content-Type', `audio/${path.parse( file ).ext.substring( 1 )}` );
		if ( range )
		{
			const parts	= range.replace( /bytes=/, "" ).split( "-" );
			const start	= parseInt( parts[0], 10 );
			const end	= parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

			event.setHeader( 'Content-Range', `bytes ${start}-${end}/${fileSize}` );
			event.setHeader( 'Accept-Ranges', 'bytes' );
			event.setHeader( 'Content-Length', ( end - start ) + 1 );
			event.setStatusCode( 206 );

			stream	= fs.createReadStream( file, { start, end } );
		}
		else
		{
			event.setHeader( 'Content-Length', fileSize );
			event.setStatusCode( 200 );

			stream	= fs.createReadStream( file );
		}

		event.emit( 'stream_start', { stream } );

		return stream;
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

module.exports	= AudioFileStream;
