'use strict';

// Dependencies
const Transport	= require( './../transport' );

/**
 * @brief	File transport
 */
class File extends Transport
{
	constructor( options = {} )
	{
		super( options );
	}
}

module.exports	= File;