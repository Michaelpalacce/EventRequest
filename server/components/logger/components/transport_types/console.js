'use strict';

// Dependencies
const Transport			= require( './transport' );
const { LOG_LEVELS }	= require( './../log' );
const colorize			= require( './formatters/colorize' );

/**
 * @brief	Constants
 */
const TRANSPORT_DEFAULT_SHOULD_COLOR	= true;
const TRANSPORT_DEFAULT_COLOR			= 'red';
const TRANSPORT_DEFAULT_COLORS			= {
	[LOG_LEVELS.error]		: 'red',
	[LOG_LEVELS.warning]	: 'yellow',
	[LOG_LEVELS.notice]		: 'green',
	[LOG_LEVELS.info]		: 'blue',
	[LOG_LEVELS.verbose]	: 'cyan',
	[LOG_LEVELS.debug]		: 'white'
};

/**
 * @brief	Console transport
 */
class Console extends Transport
{
	constructor( options = {} )
	{
		super( options );
	}

	/**
	 * @brief	Sanitize the config
	 *
	 * @details	Accepted options:
	 * 			- color - Boolean - Whether the log should be colored -> Defaults to TRANSPORT_DEFAULT_SHOULD_COLOR
	 * 			- logColors - Object - The colors to use -> Defaults to TRANSPORT_DEFAULT_COLORS
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		super.sanitizeConfig( options );

		this.color		= typeof options.color === 'boolean'
						? options.color
						: TRANSPORT_DEFAULT_SHOULD_COLOR;

		this.logColors	= typeof options.logColors === 'object'
						? options.logColors
						: TRANSPORT_DEFAULT_COLORS;
	}

	/**
	 * @brief	Format the given log
	 *
	 * @param	Log log
	 *
	 * @return	Array
	 */
	format( log )
	{
		const isRaw		= log.getIsRaw();
		const level		= log.getLevel();
		let message		= isRaw ? log.getRawMessage() : log.getMessage();
		let uniqueId	= log.getUniqueId();
		let timestamp	= log.getTimestamp();
		timestamp		= new Date( timestamp * 1000 );
		timestamp		= Intl.DateTimeFormat( 'en-GB', {
			hour12	: false,
			year	: '2-digit',
			month	: '2-digit',
			day		: '2-digit',
			hour	: '2-digit',
			minute	: '2-digit',
			second	: '2-digit'
		}).format( timestamp );

		if ( this.color )
		{
			let color	= typeof this.logColors[level] === 'undefined'
						? TRANSPORT_DEFAULT_COLOR
						: this.logColors[level];

			color		= typeof colorize[color] === 'function'
						? color
						: TRANSPORT_DEFAULT_COLOR;

			if ( ! isRaw )
			{
				message	= colorize[color]( message );
			}

			uniqueId	= colorize.reset( uniqueId );
			timestamp	= colorize.blue( timestamp );
		}

		if ( isRaw )
		{
			return [`${uniqueId} - ${timestamp}: ${colorize.reset( '' )}`, message];
		}

		return [`${uniqueId} - ${timestamp}: ${message} ${colorize.reset( '' )}`];
	}

	/**
	 * @brief	Logs the data
	 *
	 * @param	Log log
	 * @param	Function resolve
	 * @param	Function reject
	 *
	 * @return	Promise
	 */
	_log( log, resolve, reject )
	{
		console.log.apply( this, this.format( log ) );

		resolve();
	}
}

module.exports	= Console;