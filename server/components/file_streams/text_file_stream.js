'use strict';

// Dependencies
const fs					= require( 'fs' );
const AbstractFileStream	= require( './abstract_file_stream' );

/**
 * @brief	Used to stream text files
 */
class TextFileStream extends AbstractFileStream
{
	//@TODO ADD MIME TYPES
	constructor()
	{
		super(
			[
				'.txt', '.js', '.php', '.html', '.json', '.cpp', '.h',
				'.md', '.bat', '.log', '.yml', '.ini', '.ts', '.ejs', '.twig',
				'', '.rtf', '.apt', '.fodt', '.rft', '.apkg', '.fpt', '.lst',
				'.doc', '.docx', '.man', '.plain', '.text', '.odm', '.readme',
				'.cmd', '.ps1', '.conf', '.default', '.config'
			],
			'text'
		);
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
		return fs.createReadStream( file, options );
	}
}

module.exports	= TextFileStream;
