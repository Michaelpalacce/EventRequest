'use strict';

// Dependencies
const { EventEmitter }	= require( 'events' );

/**
 * @brief	BodyParser extended by all body parsers
 */
class BodyParser extends EventEmitter
{
	/**
	 * @param	Object options
	 */
	constructor( options = {} )
	{
		super();
		this.options	= options;
		this.setMaxListeners( 0 );
	}

	/**
	 * @brief	Returns a boolean whether this parser supports the given event
	 *
	 * @param	EventRequest event
	 *
	 * @return	Boolean
	 */
	supports( event )
	{
		return false;
	}

	/**
	 * @brief	Parses the given event body
	 *
	 * @param	EventRequest event
	 *
	 * @return	Promise
	 */
	parse( event )
	{
		return new Promise(( resolve, reject ) =>{
			reject( 'Not implemented' );
		});
	}
}

module.exports	= BodyParser;
