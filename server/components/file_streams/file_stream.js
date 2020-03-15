'use strict';

/**
 * @brief	Base File Stream extended by other file streams
 */
class FileStream
{
	/**
	 * @param	EventRequest event
	 * @param	Object options
	 */
	constructor( event, options = {} )
	{
		this.options			= options;
		this.SUPPORTED_FORMATS	= [];
		this._streamType		= '';
	}

	/**
	 * @brief	Sanitizes the options
	 *
	 * @return	void
	 */
	sanitize()
	{
		throw new Error( 'Invalid Configuration provided' );
	}

	/**
	 * @brief	Gets an instance of file stream
	 *
	 * @return	FileStream
	 */
	static getInstance( options )
	{
		return new this( options );
	}

	/**
	 * @brief	Check whether the given file is supported by the file stream
	 *
	 * @param	String file
	 *
	 * @return	Boolean
	 */
	support( file )
	{
		return false;
	}

	/**
	 * @brief	Stream the file
	 *
	 * @param	EventRequest event
	 * @param	String file
	 * @param	Object options
	 *
	 * @return	ReadableStream
	 */
	getFileStream( event, file, options = {} )
	{
		return ;
	}

	/**
	 * @brief	Gets the type of file this stream supports
	 *
	 * @return	String
	 */
	getType()
	{
		return '';
	}
}

module.exports	= FileStream;
