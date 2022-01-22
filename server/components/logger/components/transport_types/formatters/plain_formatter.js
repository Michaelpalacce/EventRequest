'use strict';

/**
 * @brief	If noRaw is set to false, then regardless if the log isRaw, this will prevent the rawMessage from being logged
 *
 * @details	noRaw is by default false, which allows raw logs
 *
 * @return	{Function}
 */
module.exports	= ( { noRaw = false } = {} ) => {
	/**
	 * @brief	Formats the given log to a simple non standard format
	 *
	 * @details	This will return an array of all the data that needs to be logged
	 *
	 * @param	{Object} context
	 *
	 * @return	{Array}
	 */
	return ( context = {} ) => {
		const propertiesToTest = ['uniqueId', 'timestamp', 'isRaw', 'rawMessage', 'message'];

		if ( propertiesToTest.every( ( value ) => { return value in context; } ) ) {
			const uniqueId	= context.uniqueId;
			const timestamp	= context.timestamp;

			if ( context.isRaw && noRaw === false )
				return [`${uniqueId} - ${timestamp} :`, context.rawMessage];

			return [`${uniqueId} - ${timestamp} : ${context.message}`];
		}
		else
			return [];
	};
};
