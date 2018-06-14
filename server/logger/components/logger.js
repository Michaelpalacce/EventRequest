'use strict';

// Dependencies
const Transport					= require( './transport_types/transport' );
const { Log, LOG_LEVELS }		= require( './log' );
const stream					= require( 'stream' );

/**
 * @brief	Constants
 */
const LOGGER_DEFAULT_LOG_LEVEL	= LOG_LEVELS.error;

/**
 * @brief	Logger class used to hold transports
 */
class Logger extends stream.Transform
{
	constructor( options = {} )
	{
		super({
			objectMode	: true
		});
		this.transports	= [];
		this.logLevel	= LOGGER_DEFAULT_LOG_LEVEL;
		this.logLevels	= LOG_LEVELS;

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

		transports.forEach( ( currentTransport ) => {
			if ( ! this.addTransport( currentTransport ) )
			{
				this.addTransport( Transport.getInstance( currentTransport ) );
			}
		});

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

		console.log( log );
		// this.transports.forEach( () =>{
		// });
	}
}

module.exports	= Logger;