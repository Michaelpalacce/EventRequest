'use strict';

// Dependencies
const path					= require( 'path' );
const fs					= require( 'fs' );
const AbstractFileStream	= require( './abstract_file_stream' );

/**
 * @brief	Used to stream mp4 and webm files
 */
class VideoFileStream extends AbstractFileStream {
	constructor() {
		super( ['.mp4', '.webm'], 'video' );
	}

	/**
	 * @brief	Gets the file stream for the file
	 *
	 * @property	{EventRequest} event
	 * @property	{String} file
	 * @property	{Object} [options={}]
	 *
	 * @return	ReadStream
	 */
	getFileStream( event, file, options = {} ) {
		let stream		= null;
		const stat		= fs.statSync( file );
		const fileSize	= stat.size;
		const range		= event.getRequestHeader( 'range' );

		event.setResponseHeader( 'Content-Type', `video/${path.parse( file ).ext.substring( 1 )}` );
		if ( range ) {
			const parts	= range.replace( /bytes=/, "" ).split( "-" );
			const start	= parseInt( parts[0], 10 );
			const end	= parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

			event.setResponseHeader( 'Content-Range', `bytes ${start}-${end}/${fileSize}` );
			event.setResponseHeader( 'Accept-Ranges', 'bytes' );
			event.setStatusCode( 206 );

			stream	= fs.createReadStream( file, { start, end } );
		}
		else {
			event.setStatusCode( 200 );

			stream	= fs.createReadStream( file );
		}

		return stream;
	}
}

module.exports	= VideoFileStream;
