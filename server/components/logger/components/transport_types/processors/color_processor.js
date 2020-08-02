'use strict';

const colorize					= require( '../formatters/colorize' );

const { LOG_LEVELS }			= require( '../../log' );
const FORMATTER_DEFAULT_COLOR	= 'red';

const DEFAULT_LOG_COLORS		= {
	[LOG_LEVELS.error]		: 'red',
	[LOG_LEVELS.warning]	: 'yellow',
	[LOG_LEVELS.notice]		: 'green',
	[LOG_LEVELS.info]		: 'blue',
	[LOG_LEVELS.verbose]	: 'cyan',
	[LOG_LEVELS.debug]		: 'white'
};

/**
 * @param	{Object} options
 *
 * @return	Function
 */
module.exports	= ( { logColors = DEFAULT_LOG_COLORS } = {} ) =>{
	/**
	 * @brief	Adds colors to the message, uniqueId and timestamp
	 *
	 * @return	void
	 */
	return ( context = {} ) => {
		const propertiesToTest = ['level', 'uniqueId', 'timestamp', 'isRaw', 'message'];

		if ( propertiesToTest.every( ( value ) => { return value in context; } ) )
		{
			let color			= typeof logColors[context.level] === 'undefined' || typeof colorize[logColors[context.level]] !== 'function'
								? FORMATTER_DEFAULT_COLOR
								: logColors[context.level];

			context.uniqueId	= colorize.reset( context.uniqueId );
			context.timestamp	= colorize.blue( context.timestamp );

			if ( ! context.isRaw )
				context.message	= `${colorize[color]( context.message )}${colorize.reset()}`;
		}
	}
};
