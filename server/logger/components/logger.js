'use strict';

// Dependencies
const Transport				= require( './transport_types/transport' );
const { Log, LOG_LEVELS }	= require( './log' );

/**
 * @brief	Logger class used to hold transports
 */
class Logger
{
	constructor( options = {} )
	{
		this.options			= options;
		this.transports			= [];
		this.supportedLevels	= LOG_LEVELS;

		this.sanitizeConfig();
	}

	/**
	 * @brief	Sanitize the loggers config
	 *
	 * @return	void
	 */
	sanitizeConfig()
	{
	}

	/**
	 * @brief	Add a transport to the logger
	 *
	 * @return	Boolean
	 */
	addTransport( transport )
	{
		if ( ! ( transport instanceof Transport ) )
		{
			this.transports.push( transport );
			return true;
		}

		return false;
	}

	/**
	 * @brief	Checks whether the given log's level matches the supported log levels by this transport
	 *
	 * @breief	Object log
	 *
	 * @return	Boolean
	 */
	supports( log )
	{
		if ( ( log instanceof Log ) === false )
		{
			return false;
		}

		return log.getLevel() in this.supportedLevels;
	}

	/**
	 * @brief	Formats the log according to the specified format
	 *
	 * @return	mixed
	 */
	format()
	{
	}

	/**
	 * @brief	Logs the given data
	 *
	 * @return	void
	 */
	log()
	{
	}
}

module.exports	= Logger;