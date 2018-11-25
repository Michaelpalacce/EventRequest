'use strict';

/**
 * @brief	Base Pre processor that serves as an interface to other pre processors
 */
class BasePreProcessor
{
	/**
	 * @param	Object options
	 */
	constructor( options )
	{
		this.sanitizeConfig();

		this.options	= options;
	}

	/**
	 * @brief	Sanitizes the config given to fit the params expected
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		throw new Error( "Implement this function" );
	}

	/**
	 * @brief	Processes the given template
	 *
	 * @param	String template
	 * @param	Object variable
	 *
	 * @return	String
	 */
	process( template, variables )
	{
		return	template;
	}
}
