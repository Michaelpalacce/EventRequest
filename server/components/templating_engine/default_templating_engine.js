'use strict';

/**
 * @brief	Default templating engine that just returns the HTML directly
 */
class TemplatingEngine
{
	/**
	 * @brief	Return the HTML directly
	 *
	 * @param	html String
	 * @param	variables Object
	 *
	 * @returns	String
	 */
	render( html, variables )
	{
		return html;
	}
}

module.exports	= TemplatingEngine;