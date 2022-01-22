'use strict';

// Dependencies
const Logger				= require( './components/logger' );
const Transport				= require( './components/transport_types/transport' );
const File					= require( './components/transport_types/file' );
const Console				= require( './components/transport_types/console' );
const { Log, LOG_LEVELS }	= require( './components/log' );
const cluster				= require( 'cluster' );

/**
 * @brief	Container that holds all the different loggers
 */
class Loggur {
	constructor() {
		this.loggers				= {};
		this.LOG_LEVELS				= LOG_LEVELS;
		this.defaultLogger			= null;
		this.enableDefaultLogger	= true;
		let uniqueId				= cluster.isMaster
									? 'Master'
									/* istanbul ignore next */
									: 'Worker/' + process.pid;

		Object.defineProperty( this, 'uniqueId', {
			writable	: false,
			value		: uniqueId
		});
	}

	/**
	 * @brief	Enables the default logger
	 *
	 * @return	void
	 */
	enableDefault() {
		this.enableDefaultLogger	= true;
	}

	/**
	 * @brief	Disables the default logger
	 *
	 * @return	void
	 */
	disableDefault() {
		this.enableDefaultLogger	= false;
	}

	/**
	 * @brief	Adds the given logger to the container
	 *
	 * @details	Configuration for the logger can be passed here and if valid the logger will be created and added
	 *
	 * @property	{String} loggerId
	 * @property	{Logger|Object} [logger={}]
	 *
	 * @return	Boolean
	 */
	addLogger( loggerId, logger = {} ) {
		if ( typeof logger === 'object' && ! ( logger instanceof Logger ) )
			logger	= this.createLogger( logger );

		if ( logger instanceof Logger && typeof this.loggers[loggerId] === 'undefined' ) {
			this.loggers[loggerId]	= logger;
			return true;
		}

		return false;
	}

	/**
	 * @brief	Get the desired logger
	 *
	 * @details	Returns false if the logger is not added
	 *
	 * @property	{String} loggerId
	 *
	 * @return	Logger|Boolean
	 */
	getLogger( loggerId ) {
		let logger	= this.loggers[loggerId];
		if ( logger === undefined )
			return false;

		return logger;
	}

	/**
	 * @brief	Create a new logger
	 *
	 * @property	{Object} [loggerConfig={}]
	 *
	 * @return	Logger
	 */
	createLogger( loggerConfig = {} ) {
		return new Logger( loggerConfig, this.uniqueId );
	}

	/**
	 * @brief	Returns a single instance of the default logger
	 *
	 * @return	Logger
	 */
	getDefaultLogger() {
		if ( this.defaultLogger === null ) {
			this.defaultLogger	= this.createLogger({
				serverName	: 'Default',
				logLevel	: LOG_LEVELS.debug
			});
		}

		return this.defaultLogger;
	}

	/**
	 * @brief	Logs the data
	 *
	 * @return	Promise
	 */
	log() {
		const loggersPromises	= [];

		if ( Object.keys( this.loggers ).length !== 0 ) {
			for ( const loggerId in this.loggers ) {
				const logger	= this.loggers[loggerId];
				loggersPromises.push( logger.log.apply( logger, arguments ) );
			}
		}
		else {
			if ( this.enableDefaultLogger ) {
				const logger	= this.getDefaultLogger();
				loggersPromises.push( logger.log.apply( logger, arguments ) );
			}
		}

		return Promise.all( loggersPromises );
	}

	/**
	 * @brief	Sets the Log Level of all the attached Loggers
	 *
	 * @property	{Number} logLevel
	 *
	 * @return	void
	 */
	setLogLevel( logLevel ) {
		if ( Object.keys( this.loggers ).length !== 0 ) {
			for ( let loggerId in this.loggers )
				this.loggers[loggerId].setLogLevel( logLevel );
		}
		else {
			if ( this.enableDefaultLogger )
				this.getDefaultLogger().setLogLevel( logLevel );
		}
	}
}

module.exports	= {
	Loggur	: new Loggur(),
	Logger,
	Transport,
	Console,
	File,
	Log,
	LOG_LEVELS
};
