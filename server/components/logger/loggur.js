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
class Loggur
{
	constructor()
	{
		this.loggers				= {};
		this.defaultLogger			= null;
		this.enableDefaultLogger	= true;
		let uniqueId				= cluster.isMaster
									? 'Master'
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
	enableDefault()
	{
		this.enableDefaultLogger	= true;
	}

	/**
	 * @brief	Disables the default logger
	 *
	 * @return	void
	 */
	disableDefault()
	{
		this.enableDefaultLogger	= false;
	}

	/**
	 * @brief	Adds the given logger to the container
	 *
	 * @details	Configuration for the logger can be passed here and if valid the logger will be created and added
	 *
	 * @param	String loggerId
	 * @param	Logger|Object logger
	 *
	 * @return	Boolean
	 */
	addLogger( loggerId, logger = {} )
	{
		if ( typeof logger === 'object' && ( logger instanceof Logger ) === false )
		{
			logger	= this.createLogger( logger );
		}

		if ( logger instanceof Logger && typeof this.loggers[loggerId] === 'undefined')
		{
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
	 * @param	String loggerId
	 *
	 * @return	Logger|Boolean
	 */
	getLogger( loggerId )
	{
		let logger	= this.loggers[loggerId];
		if ( logger === undefined )
		if ( logger === undefined )
		{
			return false;
		}

		return logger;
	}

	/**
	 * @brief	Create a new logger
	 *
	 * @param	Object loggerConfig
	 *
	 * @return	Logger
	 */
	createLogger( loggerConfig = {} )
	{
		return new Logger( loggerConfig, this.uniqueId );
	}

	/**
	 * @brief	Returns a single instance of the default logger
	 *
	 * @return	Logger
	 */
	getDefaultLogger()
	{
		if ( this.defaultLogger === null )
		{
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
	 * @param	mixed data
	 * @param	Number level
	 *
	 * @return	Promise
	 */
	log( data, level = null )
	{
		let loggersPromises	= [];
		if ( Object.keys( this.loggers ).length !== 0 )
		{
			for ( let loggerId in this.loggers )
			{
				loggersPromises.push( this.loggers[loggerId].log( data, level ) );
			}
		}
		else
		{
			if ( this.enableDefaultLogger )
			{
				loggersPromises.push( this.getDefaultLogger().log( data, level ) );
			}
		}

		return Promise.all( loggersPromises );
	}

	/**
	 * @brief	Sets the Log Level of all the attached Loggers
	 *
	 * @param	Number logLevel
	 *
	 * @return	void
	 */
	setLogLevel( logLevel )
	{
		if ( Object.keys( this.loggers ).length !== 0 )
		{
			for ( let loggerId in this.loggers )
			{
				this.loggers[loggerId].setLogLevel( logLevel );
			}
		}
		else
		{
			if ( this.enableDefaultLogger )
			{
				this.getDefaultLogger().setLogLevel( logLevel );
			}
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
