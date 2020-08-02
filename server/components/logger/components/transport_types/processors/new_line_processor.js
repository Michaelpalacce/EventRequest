
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
	return ( context ) => {

		const lineEnds	= ['\r\n', '\\r\\n', '\n', '\\n', '\r', '\\r'];

		for ( const lineEnd of lineEnds )
			context.message	= context.message.replace( /\\n/g, os.EOL );
	}
};