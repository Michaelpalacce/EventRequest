'use strict';

// Dependencies
const { Log, LOG_LEVELS }	= require( './../log' );

/**
 * @brief	Constants
 */
const LOGGER_DEFAULT_LOG_LEVEL	= LOG_LEVELS.error;

/**
 * @brief	Transport class used by the other Transport types
 */
class Transport
{
	constructor( options = {} )
	{
		this.logLevel	= null;
		this.logLevels	= null;
		this.sanitizeConfig( options );
	}

	/**
	 * @brief	Sanitize the given options
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		this.logLevel		= typeof options.logLevel === 'number'
							? options.logLevel
							: LOGGER_DEFAULT_LOG_LEVEL;

		this.logLevels		= typeof options.logLevels === 'object' && Array.isArray( options.logLevels )
							? options.logLevels
							: LOG_LEVELS;
	}

	/**
	 * @brief	Get an instance of the current transport
	 *
	 * @param	Object options
	 *
	 * @return	Transport
	 */
	static getInstance( options = {} )
	{
		return new this( options );
	}

	/**
	 * @brief	Returns whether the current log is supported by the transport
	 *
	 * @param	Log log
	 *
	 * @return	Boolean
	 */
	supports( log )
	{
		if ( ( log instanceof Log ) === false )
		{
			return false;
		}

		return this.logLevel >= log.getLevel();
	}

	/**
	 * @brief	Saves the log
	 *
	 * @param	Log log
	 *
	 * @return	void
	 */
	log( log )
	{
	}
}

module.exports	= Transport;