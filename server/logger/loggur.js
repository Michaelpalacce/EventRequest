'use strict';

// Dependencies
const Container				= require( './components/container' );
const { EventEmitter }		= require( 'events' );
const Logger				= require( './components/logger' );
const { Log, LOG_LEVELS }	= require( './components/log' );

/**
 * @brief	Logger class that is used to create different loggers and log information to them when called
 *
 * @return	void
 */
class Loggur
{
	constructor()
	{
		Object.defineProperty( this, 'eventEmitter', {
			value		: new EventEmitter(),
			writable	: false
		});

		Object.defineProperty( this, 'container', {
			value		: new Container(),
			writable	: false
		});
	}

	getUniqueId()
	{
		return this.container.uniqueId;
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
	 * @brief	Adds the logger to the container
	 *
	 * @param	String loggerId
	 * @param	Logger logger
	 *
	 * @return	void
	 */
	addLogger( loggerId, logger )
	{
		this.container.addLogger( loggerId, logger );
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
		return this.container.getLogger( loggerId );
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
		return this.container.createLogger( loggerConfig );
	}

	/**
	 * @brief	Log the data data
	 *
	 * @param	mixed log
	 *
	 * @return	void
	 */
	log( log )
	{
		this.container.log( log );
	}
}

module.exports	= new Loggur();
