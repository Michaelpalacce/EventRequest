'use strict';

// Dependencies
const BodyParser	= require( './body_parser' );

/**
 * @brief	BodyParserHandler responsible for parsing the body of the request
 */
class BodyParserHandler
{
	constructor()
	{
		this.parsers	= [];
	}

	/**
	 * @brief	Adds a new parser to the Body Parser Handler
	 *
	 * @param	BodyParser parser
	 *
	 * @return	void
	 */
	addParser( parser )
	{
		if ( parser instanceof BodyParser === false )
		{
			throw new Error( 'Parser must be of type BodyParser' );
		}

		this.parsers.push( parser );
	}

	/**
	 * @brief	Goes through all the parsers and tries to parse the payload. If it cannot be parsed then an error is set
	 *
	 * @param	EventRequest event
	 * @param	Function callback
	 *
	 * @return	Promise | null
	 */
	parseBody( event )
	{
		for ( const parser of this.parsers )
		{
			if ( parser.supports( event ) )
			{
				event.emit( 'stream_start' );
				return parser.parse( event );
			}
		}

		return new Promise(( resolve )=>{
			resolve( {} );
		})
	}
}

module.exports	= BodyParserHandler;
