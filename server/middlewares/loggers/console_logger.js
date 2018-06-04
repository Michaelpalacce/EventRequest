'use strict';

const Logger	= require( './../logger' );

/**
 * @brief	Logger that logs data directly to the console
 */
class ConsoleLogger extends Logger
{
	/**
	 * @see	Logger::constructor()
	 */
	constructor( event, options )
	{
		super( event, options );
		this.logLevel	= 0;
		this.sanitize();
	}

	/**
	 * @see	Logger::sanitize()
	 */
	sanitize()
	{
		this.logLevel	= typeof this.options.logLevel === 'number' ? this.options.logLevel : 0;
	}

	/**
	 * @see	Logger::attachToEvents()
	 */
	attachToEvents()
	{
	}

	/**
	 * @see	Logger::log()
	 */
	log( data )
	{
		console.log( data );
	}
}

module.exports	= ConsoleLogger;