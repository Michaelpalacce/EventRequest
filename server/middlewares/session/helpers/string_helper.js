'use strict';

let helperContainer	= {};

/**
 * @brief	Helper method that generates a random string id
 *
 * @param	Number length
 *
 * @return	String
 */
helperContainer.makeId	= ( length ) => {
	let text		= "";
	let possible	= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	length			= typeof length === 'number' ? length : 10;

	for ( let i = 0; i < length; ++ i )
	{
		text	+= possible.charAt( Math.floor( Math.random() * possible.length ) );
	}

	return text;
};

// Export the module
module.exports	= helperContainer;
