'use strict';

// Dependencies
const Container			= require( './components/container' );
const { EventEmitter }	= require( 'events' );

/**
 * @brief	Logger class that is used to create different loggers and log information to them when called
 *
 * @return	void
 */
class Logger
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

	/**
	 * @brief	Ease of use method to add a listener
	 *
	 * @return	void
	 */
	on()
	{
		this.eventEmitter.on.call( this, arguments );
	}

	/**
	 * @brief	Ease of use method to add a listener once
	 *
	 * @return	void
	 */
	once()
	{
		this.eventEmitter.once.call( this, arguments );
	}

	/**
	 * @brief	Ease of use method to add a listener once
	 *
	 * @return	void
	 */
	off()
	{
		this.eventEmitter.off.call( this, arguments );
	}

	/**
	 * @brief	Sanitize the config to make sure valid options are provided
	 *
	 * @return	void
	 */
	sanitizeConfig()
	{
	}

	/**
	 * @brief	Adds the logger to the container
	 *
	 * @param	Object logConfig
	 *
	 * @return	void
	 */
	addLogger( logConfig )
	{
		this.container.addLogger( logConfig );
	}

	/**
	 * @brief	Log the data data
	 *
	 * @param	Object log
	 *
	 * @return	void
	 */
	log( log )
	{
		log	= typeof log === 'object' ? log : false;

		if ( log === false )
		{
			setTimeout(() => {
				this.eventEmitter.emit( 'error', 'Could not log the data' );
			});
		}
		else
		{
			this.container.log( log );
		}
	}
}

module.exports	= new Logger();