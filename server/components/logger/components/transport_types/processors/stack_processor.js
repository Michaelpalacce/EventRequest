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
		if ( context.rawMessage instanceof Error )
			context.message	= context.rawMessage.stack;
	}
};