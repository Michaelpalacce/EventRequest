'use strict';

// Dependencies
const fs					= require( 'fs' );
const AbstractFileStream	= require( './abstract_file_stream' );

/**
 * @brief	The type of file this stream supports
 *
 * @var		String
 */
const STREAM_TYPE		= 'image';

/**
 * @brief	The supported file extensions
 *
 * @var		Array
 */
const SUPPORTED_TYPES	= [
	'.apng', '.bmp', '.gif', '.ico', '.cur', '.jpeg', '.jpg', '.jfif', '.pjpeg', '.pjp', '.png', '.svg', '.tif', '.tiff', '.webp'
];

/**
 * @brief	Used to stream text files
 */
class ImageFileStream extends AbstractFileStream
{
	constructor()
	{
		super( SUPPORTED_TYPES, STREAM_TYPE );
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
		const stream	= fs.createReadStream( file, options );

		event.emit( 'stream_start', { stream } );

		return stream;
	}
}

module.exports	= ImageFileStream;
