'use strict';

/**
 * @brief	Transport class used by the other Transport types
 */
class Transport
{
	constructor( options = {} )
	{
		this.options	= options;
	}

	static getInstance( options = {} )
	{
		return new this( options );
	}
}

module.exports	= Transport;