'use strict';

// Dependencies
const { EventEmitter }		= require( 'events' );
const uniqueId				= require( './../unique_id' );
const Logger				= require( './components/logger' );
const { Log, LOG_LEVELS }	= require( './components/log' );

/**
 * @brief	Container that holds all the different loggers
 */
class Loggur
{
	constructor()
	{
		this.loggers	= {};
		Object.defineProperty( this, 'uniqueId', {
			writable	: false,
			value		: uniqueId.makeId( 30 )
		});

		Object.defineProperty( this, 'eventEmitter', {
			value		: new EventEmitter(),
			writable	: false
		});
	}

	/**
	 * @brief	Ease of use method to add a listener
	 *
	 * @return	void
	 */
	on()
	{
		this.eventEmitter.on.call( this.eventEmitter, arguments );
	}

	/**
	 * @brief	Ease of use method to add a listener once
	 *
	 * @return	void
	 */
	once()
	{
		this.eventEmitter.once.call( this.eventEmitter, arguments );
	}

	/**
	 * @brief	Ease of use method to add a listener once
	 *
	 * @return	void
	 */
	off()
	{
		this.eventEmitter.off.call( this.eventEmitter, arguments );
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
	addLogger( loggerId, logger )
	{
		if ( typeof logger === 'object' && ( logger instanceof Logger ) === false )
		{
			logger	= new Logger( logger );
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
	 * @param	String loggerId
	 *
	 * @return	Logger
	 */
	getLogger( loggerId )
	{
		return this.loggers[loggerId];
	}

	/**
	 * @brief	Create a new logger
	 *
	 * @param	Object loggerConfig
	 *
	 * @return	Logger
	 */
	createLogger( loggerConfig )
	{
		return new Logger( loggerConfig, this.uniqueId );
	}

	/**
	 * @brief	Logs the data
	 *
	 * @param	mixed data
	 *
	 * @return	void
	 */
	log( data )
	{
		for ( let loggerId in this.loggers )
		{
			this.loggers[loggerId].log( data );
		}
	}
}

module.exports	= new Loggur();
