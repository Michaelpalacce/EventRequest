'use strict';

const RawBodyParser	= require( './raw_body_parser' );

/**
 * @brief	BodyParserHandler responsible for parsing the body of the request
 */
class BodyParserHandler
{
	constructor()
	{
		this.parsers		= [];

		this.fallbackParser	= new RawBodyParser();
	}

	/**
	 * @brief	Adds a new parser to the Body Parser Handler
	 *
	 * @param	{*} parser
	 *
	 * @return	void
	 */
	addParser( parser )
	{
		if ( typeof parser.supports !== 'function' || typeof parser.parse !== 'function' )
			throw new Error( 'Parser must have a supports and parse functions' );

		this.parsers.push( parser );
	}

	/**
	 * @brief	Goes through all the parsers and tries to parse the payload. If it cannot be parsed then an error is set
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	Promise
	 */
	parseBody( event )
	{
		for ( const parser of this.parsers )
			if ( parser.supports( event ) )
				return parser.parse( event );

		return this.fallbackParser.parse( event );
	}
}

module.exports	= BodyParserHandler;
