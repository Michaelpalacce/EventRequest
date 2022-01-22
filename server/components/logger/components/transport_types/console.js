'use strict';

// Dependencies
const Transport	= require( './transport' );

/**
 * @brief	Console transport
 */
class Console extends Transport {
	/**
	 * @brief	Sanitize the config
	 *
	 * @param	{Object} options
	 * @param	{Array[Function]} options.processors		- Holds an array of processors to apply to the log
	 * @param	{Function} options.formatter				- Formatter function
	 */
	sanitizeConfig( options ) {
		super.sanitizeConfig( options );

		this.processors	= Array.isArray( options.processors )
						? options.processors
						: [Transport.processors.time(), Transport.processors.stack(), Transport.processors.color()];

		this.formatter	= typeof options.formatter === 'function'
						? options.formatter
						: Transport.formatters.plain();
	}

	/**
	 * @brief	Logs the data
	 *
	 * @param	{Array} data
	 * @param	{Function} resolve
	 * @param	{Function} reject
	 */
	_log( data, resolve, reject ) {
		console.log.apply( this, data );

		resolve();
	}
}

Console.formatters	= Transport.formatters;
Console.processors	= Transport.processors;

module.exports	= Console;
