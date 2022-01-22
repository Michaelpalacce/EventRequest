'use strict';

// Dependencies
const path	= require( 'path' );

class AbstractFileStream {
	/**
	 * @param	{Array} [supportedFormats=[]]
	 * @param	{String} [streamType='unknown']
	 */
	constructor( supportedFormats = [], streamType = 'unknown' ) {
		this.SUPPORTED_FORMATS	= supportedFormats;
		this._streamType		= streamType;
	}

	/**
	 * @brief	Check whether the given file is supported by the file stream
	 *
	 * @param	{String} file - the file to check if it is supported
	 *
	 * @return	{Boolean}
	 */
	supports( file ) {
		const parsedPath	= path.parse( file );
		return this.SUPPORTED_FORMATS.indexOf( parsedPath.ext.toLowerCase() ) !== -1;
	}

	/**
	 * @brief	Gets the type of file this stream supports
	 *
	 * @return	{String}
	 */
	getType() {
		return this._streamType;
	}
}

module.exports	= AbstractFileStream;
