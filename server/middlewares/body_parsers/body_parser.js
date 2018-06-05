'use strict';

/**
 * @brief	BodyParser extended by all body parsers
 */
class BodyParser
{
	/**
	 * @param	Object options
	 */
	constructor( options = {} )
	{
		this.options	= options;
	}

	/**
	 * @brief	Gets an instance of the body parser
	 *
	 * @return	BaseBodyParser
	 */
	static getInstance( bodyParser, options = {} )
	{
		return new this(  bodyParser, options );
	}

	/**
	 * @brief	Returns a boolean whether this parser supports the given event
	 *
	 * @param	RequestEvent event
	 *
	 * @return	Boolean
	 */
	supports( event )
	{
	}

	/**
	 * @brief	Parses the given event body
	 *
	 * @param	RequesEvent event
	 * @param	Function callback
	 *
	 * @return	void
	 */
	parse( event, callback )
	{
	}
}

module.exports	= BodyParser;
