'use strict';

// Dependencies

/**
 * @brief	Templating Engine class to be implemented by all Templating Engines
 *
 * @return	void
 */
class TemplatingEngine
{
	constructor( options = {} )
	{
		this.options	= options;
	}

	/**
	 * @brief	Renders the given template
	 *
	 * @param	String templateName
	 * @param	Object variables
	 * @param	Function callback
	 *
	 * @return	void
	 */
	render( templateName, variables, callback )
	{
		throw new Error( 'Implement render function' );
	}
}

module.exports	= TemplatingEngine;
