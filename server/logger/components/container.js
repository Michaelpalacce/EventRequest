'use strict';

// Dependencies
const Logger	= require( './logger' );


/**
 * @brief	Container that holds all the different loggers
 */
class Container
{
	constructor()
	{
		this.loggers	= {};
	}

	/**
	 * @brief	Adds the given logger to the container
	 *
	 * @param	String loggerId
	 * @param	Logger logger
	 *
	 * @return	Boolean
	 */
	addLogger( loggerId, logger )
	{
		if ( logger instanceof Logger && typeof this.loggers[loggerId] === 'undefined')
		{
			this.loggers[loggerId]	= logger;
			return true;
		}

		return false;
	}

	/**
	 * @brief	Get the desired logger
	 *
	 * @param	String loggerId
	 *
	 * @return	Logger
	 */
	getLogger( loggerId )
	{
		return this.loggers[loggerId];
	}

	/**
	 * @brief	Create a new logger
	 *
	 * @param	Object loggerConfig
	 *
	 * @return	Logger
	 */
	static createLogger( loggerConfig )
	{
		return new Logger( loggerConfig );
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