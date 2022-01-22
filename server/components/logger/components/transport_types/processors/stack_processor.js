/**
 * @return	{Function}
 */
module.exports	= () => {
	/**
	 * @brief	Replaces the message with the Error stack
	 */
	return ( context = {} ) => {
		const propertiesToTest = ['rawMessage', 'message'];

		if ( propertiesToTest.every( ( value ) => { return value in context; } ) )
			if ( context.rawMessage instanceof Error )
				context.message	= context.rawMessage.stack;
	};
};
