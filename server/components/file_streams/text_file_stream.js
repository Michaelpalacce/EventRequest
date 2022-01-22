'use strict';

// Dependencies
const fs					= require( 'fs' );
const AbstractFileStream	= require( './abstract_file_stream' );
const path					= require( 'path' );
const { findMimeType }		= require( '../mime_type/mime_type' );

/**
 * @brief	Used to stream text files
 */
class TextFileStream extends AbstractFileStream {
	constructor() {
		super([
			'.txt', '.js', '.php', '.html', '.json', '.cpp', '.h',
			'.md', '.bat', '.log', '.yml', '.ini', '.ts', '.ejs', '.twig',
			'', '.rtf', '.apt', '.fodt', '.rft', '.apkg', '.fpt', '.lst',
			'.doc', '.docx', '.man', '.plain', '.text', '.odm', '.readme',
			'.cmd', '.ps1', '.conf', '.default', '.config', '.csv'
		], 'text' );
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

module.exports	= TextFileStream;
