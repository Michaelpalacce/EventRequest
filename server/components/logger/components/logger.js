'use strict';

// Dependencies
const Transport				= require( './transport_types/transport' );
const Console				= require( './transport_types/console' );
const File					= require( './transport_types/file' );
const { Log, LOG_LEVELS }	= require( './log' );

/**
 * @brief	Constants
 */
const LOGGER_DEFAULT_LOG_LEVEL	= LOG_LEVELS.info;

/**
 * @brief	Logger class used to hold transports
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
	 * @details	Accepted options:
	 * 			- serverName - String - The name of the server to be concatenated with the uniqueId - Defaults to empty
	 * 			- transports - Array - Array of the transports to be added to the logger - Defaults to empty
	 * 			- logLevel - Number - The log severity level -> Defaults to error
	 * 			- logLevels - Object - JSON object with all the log severity levels and their values
	 * 						All added log levels will be attached to the instance of the logger class -> Defaults to LOG_LEVELS
	 * 			- capture - Boolean - Whether to attach event listeners for process.on
	 * 						uncaughtException and unhandledRejection - Defaults to true
	 * 			- dieOnCapture - Boolean - If the process should exit in case of a caught exception -> Defaults to true
	 * 			- unhandledExceptionLevel - Number - What level should the unhandled exceptions be logged at -> Defaults to error
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		this.serverName					= typeof options.serverName === 'string'
										? options.serverName
										: false;

		this.logLevel					= typeof options.logLevel === 'number'
										? options.logLevel
										: LOGGER_DEFAULT_LOG_LEVEL;

		this.logLevels					= typeof options.logLevels === 'object'
										? options.logLevels
										: LOG_LEVELS;

		this.capture					= typeof options.capture === 'boolean'
										? options.capture
										: true;

		this.dieOnCapture				= typeof options.dieOnCapture === 'boolean'
										? options.dieOnCapture
										: true;

		this.unhandledExceptionLevel	= typeof options.unhandledExceptionLevel === 'number'
										? options.unhandledExceptionLevel
										: LOG_LEVELS.error;

		this.transports					= [];
		let transports					= typeof options.transports === 'object' && Array.isArray( options.transports )
										? options.transports
										: [];

		transports.forEach( ( currentTransport ) => { this.addTransport( currentTransport ) } );

		if ( this.transports.length === 0 )
		{
			this.transports.push( new Console() );
		}

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
				let unhandledRejectionLog	= Log.getInstance({
					level	: this.unhandledExceptionLevel,
					message	: [reason + ' Unhandled Rejection at Promise: ' + p]
				});

				this.log( unhandledRejectionLog );
			});

			process.on( 'uncaughtException', ( err ) => {
				let uncaughtExceptionLog	= Log.getInstance({
					level	: this.unhandledExceptionLevel,
					message	: err.stack
				});

				this.log( uncaughtExceptionLog, true );

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

					return this.log( log );
				};
			}
		}
	}

	/**
	 * @brief	Add a transport to the logger
	 *
	 * @param	mixed transport
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
	 * @brief	Logs the given data
	 *
	 * @details	If forced is set as true then the log will be logged immediately this is done mainly so we can log critical
	 * 			errors
	 *
	 * @param	mixed log
	 * @param	Boolean force
	 *
	 * @return	Promise
	 */
	log( log, force = false )
	{
		log	= Log.getInstance( log );

		if ( this.supports( log ) )
		{
			let transportPromises	= [];
			let uniqueServerId		= typeof this.serverName === 'string'
									? this.serverName + '/' + this.uniqueId
									: this.uniqueId;
			log.setUniqueId( uniqueServerId );

			this.transports.forEach( ( transport ) =>{
				if ( ! transport.supports( log ) )
				{
					return;
				}

				if ( force )
				{
					// Log immediately
					transport.log( log );
					return;
				}

				// Add log to the queue
				let logPromise	= new Promise( ( resolve, reject )=>{
					setImmediate( () => {
						let transportPromise	= transport.log( log );

						transportPromise.then(()=>{
							resolve();
						});

						transportPromise.catch(( err )=>{
							reject( err );
						});
					});
				});

				transportPromises.push( logPromise );
			});

			return Promise.all( transportPromises );
		}
	}
}

module.exports	= {
	Logger,
	Transport,
	Console,
	File,
	Log,
	LOG_LEVELS
};