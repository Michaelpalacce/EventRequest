const data	= require( './mime_types_data' );

/**
 * @brief	Class that holds logic for different common mime types and their extensions as well as methods to fetch both.
 */
module.exports	= {
	/**
	 * @brief	Gets a mime type by the extension
	 *
	 * @details	If getFirst is passed, then the first mime type is returned ( in case where there may be more than
	 * 				one mime type per extension ),otherwise an array is returned
	 *
	 * @param	{String} extension
	 * @param	{Boolean} getFirst
	 *
	 * @return	{Array|String}
	 */
	findMimeType( extension, getFirst = true ) {
		return typeof data[extension] === 'undefined' ? '*/*' : getFirst ? data[extension][0] : data[extension];
	},

	/**
	 * @brief	Searches for an extension given the mimeType
	 *
	 * @param	{String} mimeType
	 *
	 * @return	{null|String}
	 */
	findExtension( mimeType ) {
		for ( const key in data ) {
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( data, key ) )
				continue;

			const value	= data[key];
			if ( value.includes( mimeType ) )
				return key;
		}

		return null;
	}
};
