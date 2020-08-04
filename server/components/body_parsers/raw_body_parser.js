'use strict';

// Dependencies
const { EventEmitter }	= require( 'events' );

/**
 * @brief	RawBodyParser responsible for parsing any body sent
 */
class RawBodyParser extends EventEmitter
{
	/**
	 * @param	{Object} options
	 * 				Accepts options:
	 * 					- maxPayloadLength - Number - The max size of the body to be parsed
	 */
	constructor( options = {} )
	{
		super();
		this.setMaxListeners( 0 );

		// Defaults to 10 MB
		this.maxPayloadLength	= typeof options.maxPayloadLength === 'number'
								? options.maxPayloadLength
								: 104857600;
	}

	/**
	 * @brief	Returns a boolean if the current body parser supports the request
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	boolean
	 */
	supports( event )
	{
		return true;
	}

	/**
	 * @brief	Parses the request
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	Promise
	 */
	parse( event )
	{
		return new Promise(( resolve ) => {
			let rawBody		= [];
			let payloadLength	= 0;

			event.request.on( 'data', ( data ) =>
			{
				if ( ! event.isFinished() )
				{
					payloadLength	+= data.length;

					if ( payloadLength <= this.maxPayloadLength )
						rawBody.push( data );
				}
			});

			event.request.on( 'end', () => {
				if ( ! event.isFinished() )
				{
					rawBody	= Buffer.concat( rawBody, payloadLength );

					if ( payloadLength > this.maxPayloadLength || payloadLength === 0 )
						return resolve( { body: {}, rawBody: {} } );

					rawBody	= rawBody.toString();

					resolve( { body: rawBody, rawBody } );
				}
			});
		});
	}
}

module.exports	= RawBodyParser;