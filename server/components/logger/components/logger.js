'use strict';

// Dependencies
const Transport				= require( './transport_types/transport' );
const Console				= require( './transport_types/console' );
const { Log, LOG_LEVELS }	= require( './log' );

/**
 * @brief	Constants
 */
const LOGGER_DEFAULT_LOG_LEVEL	= LOG_LEVELS.info;

/**
 * @brief	Logger class used to hold transports
 */
class Logger {
	/**
	 * @property	{Object} [options={}]
	 * @property	{Boolean} [uniqueId=null]
	 */
	constructor( options = {}, uniqueId = null ) {
		if ( typeof uniqueId !== 'string' )
			throw new Error( 'app.er.logger.invalidUniqueId' );

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
	 * 						uncaughtException and unhandledRejection - Defaults to false
	 * 			- dieOnCapture - Boolean - If the process should exit in case of a caught exception -> Defaults to true
	 * 			- unhandledExceptionLevel - Number - What level should the unhandled exceptions be logged at -> Defaults to error
	 *
	 * @property	{Object} options
	 *
	 * @return	void
	 */
	sanitizeConfig( options ) {
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
										: false;

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

		transports.forEach( ( transport ) => { this.addTransport( transport ); } );

		if ( this.transports.length === 0 )
			this.transports.push( new Console({ logLevel : this.logLevel, logLevels : this.logLevels }) );

		this.attachLogLevelsToLogger();
		this.attachUnhandledEventListener();
	}

	/**
	 * @brief	Sets the Log Level of the Logger
	 *
	 * @property	{Number} logLevel
	 *
	 * @return	void
	 */
	setLogLevel( logLevel ) {
		this.logLevel	= logLevel;
	}

	/**
	 * @brief	Attach an event handler to process.on uncaughtException and unhandledRejection
	 *
	 * @details	If capture is set to true only. If dieOnCapture is set to false the process won't die but this is
	 * 			not recommended
	 *
	 * @return	void
	 */
	/* istanbul ignore next */
	attachUnhandledEventListener() {
		if ( this.capture ) {
			process.on( 'unhandledRejection', ( reason, p ) => {
				const unhandledRejectionLog	= Log.getInstance({
					level	: this.unhandledExceptionLevel,
					message	: [reason,' Unhandled Rejection at Promise: ', p]
				});

				this.log( unhandledRejectionLog ).finally(() => {
					if ( this.dieOnCapture )
						process.exit( 1 );
				});
			});

			process.on( 'uncaughtException', ( err ) => {
				const uncaughtExceptionLog	= Log.getInstance({
					level	: this.unhandledExceptionLevel,
					message	: err.stack
				});

				this.log( uncaughtExceptionLog ).finally(() => {
					if ( this.dieOnCapture )
						process.exit( 1 );
				});
			});
		}
	}

	/**
	 * @brief	Attach the provided log levels to the logger for convenience
	 *
	 * @return	void
	 */
	attachLogLevelsToLogger() {
		for ( let key in this.logLevels ) {
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( this.logLevels, key ) )
				continue;

			let logLevel			= this.logLevels[key];
			let objectProperties	= Object.getOwnPropertyNames( this.constructor.prototype );

			if ( ! objectProperties.includes( key ) ) {
				this[key]	= ( log, isRaw = false ) => {
					log	= Log.getInstance( log, logLevel, isRaw );

					return this.log( log );
				};
			}
		}
	}

	/**
	 * @brief	Add a transport to the logger
	 *
	 * @property	{*} transport
	 *
	 * @return	Boolean
	 */
	addTransport( transport ) {
		if ( transport instanceof Transport ) {
			this.transports.push( transport );
			return true;
		}

		return false;
	}

	/**
	 * @brief	Checks whether the given log's level matches the supported log levels by this transport
	 *
	 * @brief	{*} log
	 *
	 * @return	Boolean
	 */
	supports( log ) {
		if ( ! ( log instanceof Log ) )
			return false;

		return this.logLevel >= log.getLevel();
	}

	/**
	 * @brief	Returns a unique id to be set in the log
	 *
	 * @return	String
	 */
	getUniqueId() {
		return typeof this.serverName === 'string'
				? `${this.serverName}/${this.uniqueId}`
				: this.uniqueId;
	}

	/**
	 * @brief	Logs the given data
	 *
	 * @property	{*} log
	 * @property	{Number} [level=null]
	 * @property	{Boolean} [isRaw=false]
	 *
	 * @return	Promise
	 */
	log( log, level = null, isRaw = false ) {
		log				= Log.getInstance( log, level, isRaw );
		const promises	= [];

		if ( this.supports( log ) ) {
			log.setUniqueId( this.getUniqueId() );

			for ( const transport of this.transports )
				promises.push( transport.log( log ) );
		}

		// Do not reject the log if not supported
		if ( promises.length === 0 )
			promises.push( Promise.resolve() );

		return Promise.all( promises );
	}
}

module.exports	= Logger;
