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
	 * @param	{Object} options
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
	 * @param	{Object} [options={}]
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
	 * @param	{Log} log
	 *
	 * @return	Boolean
	 */
	supports( log )
	{
		if ( ! ( log instanceof Log ) )
			return false;

		if ( this.supportedLevels.indexOf( log.getLevel() ) === -1 )
			return false;

		return this.logLevel >= log.getLevel();
	}

	/**
	 * @brief	Formats the log according to the specified format
	 *
	 * @param	{Log} log
	 *
	 * @return	*
	 */
	format( log )
	{
		return log;
	}

	/**
	 * @brief	Gets the timestamp from the Log
	 *
	 * @param	{Log} log
	 *
	 * @return	{String}
	 */
	_getTimestamp( log )
	{
		let timestamp	= Date.now();

		if ( ! ( log instanceof Log ) )
			timestamp	= log.getTimestamp();

		timestamp		= new Date( timestamp * 1000 );
		return Intl.DateTimeFormat( 'en-GB', {
			hour12	: false,
			year	: '2-digit',
			month	: '2-digit',
			day		: '2-digit',
			hour	: '2-digit',
			minute	: '2-digit',
			second	: '2-digit'
		}).format( timestamp );
	}

	/**
	 * @brief	The method that actually logs the data
	 *
	 * @param	{Log} log
	 * @param	{Function} resolve
	 * @param	{Function} reject
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
	 * @param	{Log} log
	 *
	 * @return	Promise
	 */
	log( log )
	{
		return new Promise(( resolve, reject ) => {
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
