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
	/**
	 * @param	Object options
	 */
	constructor( options = {} )
	{
		this.options		= options;
		this.sanitizeConfig();

		this.eventEmitter	= new EventEmitter();
		this.container		= new Container();
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
	addLog( logConfig )
	{
		this.container.addLog( logConfig );
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
			setTimeout(() => {
				this.eventEmitter.emit( 'logged', log )
			});

			this.container.log( log );
		}
	}
}

module.exports	= new Logger();