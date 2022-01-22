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
	 * @property	{Object} options
	 *
	 * @return	void
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
	 * @property	{Array} data
	 * @property	{Function} resolve
	 * @property	{Function} reject
	 *
	 * @return	void
	 */
	_log( data, resolve, reject ) {
		console.log.apply( this, data );

		resolve();
	}
}

Console.formatters	= Transport.formatters;
Console.processors	= Transport.processors;

module.exports	= Console;
