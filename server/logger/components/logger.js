'use strict';

// Dependencies
const Transport				= require( './transport_types/transport' );
const { Log, LOG_LEVELS }	= require( './log' );

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
	constructor( options = {}, uniqueId = false )
	{
		this.transports		= null;
		this.logLevel		= null;
		this.logLevels		= null;
		this.capture		= null;
		this.dieOnCapture	= null;

		Object.defineProperty( this, 'uniqueId', {
			writable	: false,
			value		: uniqueId
		});

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

		this.logLevels		= typeof options.logLevels === 'object'
							? options.logLevels
							: LOG_LEVELS;

		this.capture		= typeof options.capture === 'boolean'
							? options.capture
							: true;

		this.dieOnCapture	= typeof options.dieOnCapture === 'boolean'
							? options.dieOnCapture
							: true;

		this.attachLogLevelsToLogger();
		this.attachUnhandledEventListener();
	}

	/**
	 * @brief	Attach an event handler to process.on uncaughtException and unhandledRejection
	 *
	 * @details	If capture is set to true only. If dieOnCapture is set to false the process won't die but this is
	 * 			not recommended
	 *
	 * @return	void
	 */
	attachUnhandledEventListener()
	{
		if ( this.capture )
		{
			process.on( 'unhandledRejection', ( reason, p ) => {
				console.error( reason, 'Unhandled Rejection at Promise', p );
			});

			process.on( 'uncaughtException', ( err ) => {
				console.error( err, 'Uncaught Exception thrown' );
				if ( this.dieOnCapture )
				{
					process.exit( 1 );
				}
			});
		}
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
			log.setUniqueId( this.uniqueId );

			this.transports.forEach( ( transport ) =>{
				if ( transport.supports( log ) )
				{
					// Log whenever ready
					setTimeout( () => {
						transport.log( log );
					});
				}
			});
		}
	}
}

module.exports	= Logger;