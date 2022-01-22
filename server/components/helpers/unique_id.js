'use strict';

module.exports	= {
	/**
	 * @brief	Helper method that generates a random string
	 *
	 * @param	{Number} length
	 *
	 * @return	{String}
	 */
	makeId	: ( length = 32 ) => {
		let text		= "";
		const possible	= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for ( let i = 0; i < length; ++ i )
			text	+= possible.charAt( Math.floor( Math.random() * possible.length ) );

		return text;
	}
};
