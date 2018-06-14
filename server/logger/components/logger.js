'use strict';

// Dependencies
const Transport				= require( './transport_types/transport' );
const { Log, LOG_LEVELS }	= require( './log' );
const stream				= require( 'stream' );

/**
 * @brief	Constants
 */
const LOGGER_DEFAULT_LOG_LEVEL	= LOG_LEVELS.error;

/**
 * @brief	Logger class used to hold transports
 *
 * @todo	Implement Streams
 */
class Logger
{
	constructor( options = {}, uniqueId )
	{
		this.transports		= null;
		this.logLevel		= null;
		this.logLevels		= null;
		this.capture		= null;
		this.dieOnCapture	= null;
		this.uniqueId		= typeof uniqueId === 'string' ? uniqueId : false;

		this.sanitizeConfig( options );
	}

	/**
	 * @brief	Sanitize the loggers config
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		let transports	= typeof options.transports === 'object' && Array.isArray( options.transports )
						? options.transports
						: [];

		transports.forEach( ( currentTransport ) => { this.addTransport( currentTransport ) } );

		this.logLevel		= typeof options.logLevel === 'number'
							? options.logLevel
							: LOGGER_DEFAULT_LOG_LEVEL;

		this.logLevels		= typeof options.logLevels === 'object' && Array.isArray( options.logLevels )
							? options.logLevels
							: LOG_LEVELS;

		this.capture		= typeof options.capture === 'boolean'
							? options.capture
							: true;

		this.dieOnCapture	= typeof options.dieOnCapture === 'boolean'
							? options.dieOnCapture
							: true;

		this.attachLogLevelsToLogger();
	}

	/**
	 * @brief	Attach the provided log levels to the logger for convenience
	 *
	 * @return	void
	 */
	attachLogLevelsToLogger()
	{
		for ( let key in this.logLevels )
		{
			let logLevel			= this.logLevels[key];
			let objectProperties	= Object.getOwnPropertyNames( this.constructor.prototype );

			if ( ! ( key in objectProperties ) )
			{
				this[key]	= ( log ) => {
					log	= Log.getInstance({
						level	: logLevel,
						message	: log
					});

					this.log( log );
				};
			}
		}
	}

	/**
	 * @brief	Add a transport to the logger
	 *
	 * @return	Boolean
	 */
	addTransport( transport )
	{
		if ( ! Array.isArray( this.transports ) )
		{
			this.transports	= [];
		}

		if ( transport instanceof Transport )
		{
			this.transports.push( transport );
			return true;
		}

		return false;
	}

	/**
	 * @brief	Checks whether the given log's level matches the supported log levels by this transport
	 *
	 * @brief	Object log
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
	 * @param	mixed log
	 *
	 * @return	void
	 */
	log( log )
	{
		if ( ! ( log instanceof Log ) )
		{
			log	= Log.getInstance( log );
		}

		if ( this.supports( log ) )
		{
			this.transports.forEach( ( transport ) =>{
				if ( transport.supports( log ) )
				{
					// Log whenever ready
					setTimeout( () => {
						transport.log( log, this.uniqueId );
					});
				}
			});
		}
	}
}

module.exports	= Logger;