'use strict';

/**
 * @brief	You can pass your own JSON replacer
 *
 * @return	Function
 */
module.exports	= ( { replacer = null } = {} ) =>{
	/**
	 * @brief	Formats the given log to a JSON
	 *
	 * @param	{Object} context
	 *
	 * @return	Array
	 */
	return ( context = {} ) => {
		delete context.rawMessage;

		return [JSON.stringify( context, replacer )];
	}
};
