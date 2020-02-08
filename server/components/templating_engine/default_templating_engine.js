'use strict';

/**
 * @brief	Default templating engine that just returns the HTML directly
 */
class TemplatingEngine
{
	/**
	 * @brief	Return the HTML directly
	 *
	 * @param	String html
	 * @param	Object variables
	 *
	 * @returns	String
	 */
	render( html, variables )
	{
		return html;
	}
}
