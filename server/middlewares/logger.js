'use strict';

/**
 * @brief	Logger class extended by all loggers
 */
class Logger
{
	/**
	 * @param	RequestEvent event
	 * @param	Object options
	 */
	constructor( event, options = {} )
	{
		this.event		= event;
		this.options	= options;
	}

	/**
	 * @brief	Sanitizes the options
	 *
	 * @return	void
	 */
	sanitize()
	{
		throw new Error( 'Invalid Configuration provided' );
	}

	/**
	 * @brief	Attaches logs to different events emitted from the RequestEvent
	 */
	attachToEvents()
	{
	}

	/**
	 * @brief	Logs data
	 *
	 * @param	mixed data
	 *
	 * @return	void
	 */
	log( data )
	{
	}
}

module.exports	= Logger;