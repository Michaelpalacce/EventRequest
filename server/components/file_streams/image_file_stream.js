'use strict';

// Dependencies
const fs					= require( 'fs' );
const path					= require( 'path' );
const AbstractFileStream	= require( './abstract_file_stream' );

/**
 * @brief	Used to stream text files
 */
class ImageFileStream extends AbstractFileStream
{
	constructor()
	{
		super( [], 'image' );
		this.formats	= {
			'.apng'	: 'image/apng',		'.avif'	: 'image/avif',		'.gif'		: 'image/gif',		'.jpg'	: 'image/jpeg',
			'.jpeg'	: 'image/jpeg',		'.jfif'	: 'image/jpeg',		'.pjpeg'	: 'image/jpeg',		'.pjp'	: 'image/jpeg',
			'.png'	: 'image/png',		'.svg'	: 'image/svg+xml',	'.webp'		: 'image/webp',		'.ico'	: 'image/x-icon',
			'.bmp'	: 'image/bmp',
		};

		this.SUPPORTED_FORMATS	= Object.keys( this.formats );
	}

	/**
	 * @brief	Gets the file stream for the file
	 *
	 * @param	{EventRequest} event
	 * @param	{String} file
	 * @param	{Object} [options={}]
	 *
	 * @return	ReadStream
	 */
	getFileStream( event, file, options = {} )
	{
		const stream		= fs.createReadStream( file, options );
		const parsedPath	= path.parse( file );
		const mimeType		= this.formats[parsedPath.ext.toLowerCase()];

		if ( typeof mimeType === 'string' )
			event.setResponseHeader( 'Content-Type', mimeType );

		return stream;
	}
}

module.exports	= ImageFileStream;
