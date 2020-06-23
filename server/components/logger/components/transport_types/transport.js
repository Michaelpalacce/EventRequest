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
	 * @param	options Object
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
	 * @param	options Object
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
	 * @param	log Log
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
	 * @param	log Log
	 *
	 * @return	String|mixed
	 */
	format( log )
	{
		return log;
	}

	/**
	 * @brief	The method that actually logs the data
	 *
	 * @param	log Log
	 * @param	resolve Function
	 * @param	reject Function
	 *
	 * @private
	 *
	 * @return	void
	 */
	_log( log, resolve, reject )
	{
		resolve();
	}

	/**
	 * @brief	Saves the log
	 *
	 * @param	log Log
	 *
	 * @return	Promise
	 */
	log( log )
	{
		return new Promise(( resolve, reject )=>{
			if ( ! this.supports( log ) )
			{
				resolve();
				return;
			}

			this._log( log, resolve, reject );
		});
	}
}

module.exports	= Transport;
