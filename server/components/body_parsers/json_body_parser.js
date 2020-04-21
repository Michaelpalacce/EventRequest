'use strict';

// Dependencies
const { EventEmitter }					= require( 'events' );

/**
 * @brief	Constants
 */
const JSON_BODY_PARSER_SUPPORTED_TYPE	= 'application/json';
const CONTENT_LENGTH_HEADER				= 'content-length';
const CONTENT_TYPE_HEADER				= 'content-type';

/**
 * @brief	JsonBodyParser responsible for parsing application/json forms
 */
class JsonBodyParser extends EventEmitter
{
	/**
	 * @param	Object options
	 * 			Accepts options:
	 * 			- maxPayloadLength - Number - The max size of the body to be parsed
	 * 			- strict - Boolean - Whether the received payload must match the content-length
	 */
	constructor( options = {} )
	{
		super();
		this.setMaxListeners( 0 );

		// Defaults to 100 MB
		this.maxPayloadLength	= typeof options.maxPayloadLength === 'number'
								? options.maxPayloadLength
								: 104857600;

		this.strict				= typeof options.strict === 'boolean'
								? options.strict
								: false;
	}

	/**
	 * @brief	Returns a boolean if the current body parser supports the request
	 *
	 * @return	boolean
	 */
	supports( event )
	{
		const contentType	= event.getHeader( CONTENT_TYPE_HEADER );
		return typeof contentType === 'string' && contentType.match( JSON_BODY_PARSER_SUPPORTED_TYPE ) !== null
	}

	/**
	 * @brief	Parses the request
	 *
	 * @return	Promise
	 */
	parse( event )
	{
		return new Promise(( resolve, reject )=>{
			let rawPayload		= [];
			let payloadLength	= 0;

			if ( ! this.supports( event ) )
				return reject( 'Body type not supported' );

			event.request.on( 'data', ( data ) =>
			{
				if ( ! event.isFinished() )
				{
					rawPayload.push( data );
					payloadLength	+= data.length;
				}
			});

			event.request.on( 'end', () => {
				if ( ! event.isFinished() )
				{
					rawPayload	= Buffer.concat( rawPayload, payloadLength );

					if ( this.strict && rawPayload.length > this.maxPayloadLength )
					{
						return resolve( {} );
					}

					if (
						this.strict &&
						(
							typeof event.headers !== 'object'
							|| typeof event.headers[CONTENT_LENGTH_HEADER] === 'undefined'
							|| rawPayload.length !== Number( event.headers[CONTENT_LENGTH_HEADER] )
						)
					) {
						return resolve( {} );
					}

					if ( rawPayload.length === 0 )
					{
						return resolve( {} );
					}

					try
					{
						const payload	= JSON.parse( rawPayload.toString() );
						for ( const index in payload )
							payload[index]	= decodeURIComponent( payload[index] );

						resolve( payload );
					}
					catch ( e )
					{
						reject( 'Could not parse the body' );
					}
				}
			});
		});
	}
}

module.exports	= JsonBodyParser;