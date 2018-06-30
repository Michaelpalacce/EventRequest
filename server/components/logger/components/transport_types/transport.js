'use strict';

// Dependencies
const { Log, LOG_LEVELS }	= require( './../log' );

/**
 * @brief	Constants
 */
const TRANSPORT_DEFAULT_LOG_LEVEL	= LOG_LEVELS.info;

/**
 * @brief	Transport class used by the other Transport types
 */
class Transport
{
	constructor( options = {} )
	{
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
		this.logLevel			= typeof options.logLevel === 'number'
								? options.logLevel
								: TRANSPORT_DEFAULT_LOG_LEVEL;

		this.logLevels			= typeof options.logLevels === 'object'
								? options.logLevels
								: LOG_LEVELS;

		this.supportedLevels	= Object.values( this.logLevels );
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

		if ( this.supportedLevels.indexOf( log.getLevel() ) === -1 )
		{
			return false;
		}

		return this.logLevel >= log.getLevel();
	}

	/**
	 * @brief	Formats the log according to the specified format
	 *
	 * @param	Log log
	 *
	 * @return	String|mixed
	 */
	format( log )
	{
		return log;
	}

	/**
	 * @brief	Saves the log
	 *
	 * @param	Log log
	 *
	 * @return	Promise
	 */
	log( log )
	{
		return new Promise(( resolve, reject )=>{
			resolve();
		});
	}
}

module.exports	= Transport;
