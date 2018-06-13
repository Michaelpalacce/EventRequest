'use strict';

// Dependencies
const Transport	= require( './../transport' );

/**
 * @brief	Console transport
 */
class Console extends Transport
{
	constructor( options = {} )
	{
		super( options );
	}
}

module.exports	= Console;