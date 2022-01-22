'use strict';

// Dependencies
const fs					= require( 'fs' );
const path					= require( 'path' );
const AbstractFileStream	= require( './abstract_file_stream' );
const { findMimeType }		= require( '../mime_type/mime_type' );

/**
 * @brief	Used to stream text files
 */
class ImageFileStream extends AbstractFileStream {
	constructor() {
		super( [
			'.gif', '.jpg', '.jpeg', '.bmp',
			'.png', '.svg', '.webp', '.ico'
		], 'image' );
	}

	/**
	 * @brief	Gets the file stream for the file
	 *
	 * @param	{EventRequest} event
	 * @param	{String} file
	 * @param	{Object} [options={}]
	 *
	 * @return	{ReadStream}
	 */
	getFileStream( event, file, options = {} ) {
		const stream		= fs.createReadStream( file, options );
		const parsedPath	= path.parse( file );
		const mimeType		= findMimeType( parsedPath.ext.toLowerCase() );

		event.setResponseHeader( 'Content-Type', mimeType );

		return stream;
	}
}

module.exports	= ImageFileStream;
