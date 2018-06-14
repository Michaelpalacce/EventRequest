'use strict';

/**
 * @brief	Container that holds all the different loggers
 */
class Container
{
	/**
	 * @param	Object options
	 */
	constructor( options = {} )
	{
		this.options	= options;
	}

	/**
	 * @brief	Adds the given logger to the container
	 *
	 * @details	Will initialize the logger if needed
	 *
	 * @param	Object logConfig
	 *
	 * @return	void
	 */
	addLogger( logConfig )
	{
	}

	/**
	 * @brief	Logs the data
	 *
	 * @param	Object data
	 *
	 * @return	void
	 */
	log( data )
	{
	}
}

module.exports	= Container;