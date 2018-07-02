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
		this.event				= event;
		this.options			= options;
		this.SUPPORTED_FORMATS	= [];
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
	static getInstance( event, options )
	{
		return new this( event, options );
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
	 * @param	String file
	 * @param	Object options
	 *
	 * @return	void
	 */
	stream( file, options = {} )
	{
		return ;
	}
}

module.exports  = FileStream;
