'use strict';

// Dependencies
const Transport	= require( './transport' );

/**
 * @brief	Console transport
 */
class Console extends Transport
{
	constructor( options = {} )
	{
		super( options );
	}

	log( data )
	{
		console.log( data );
	}
}

module.exports	= Console;