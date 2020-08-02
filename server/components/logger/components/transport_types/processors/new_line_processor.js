
const os	= require( 'os' );

/**
 * @return	Function
 */
module.exports	= () => {
	/**
	 * @brief	Replaces the message with the Error stack
	 *
	 * @return	void
	 */
	return ( context = {} ) => {
		if ( typeof context.message === 'string' )
			context.message	= context.message.replace( /\r\n|\r|\n/g, os.EOL );
	}
};
