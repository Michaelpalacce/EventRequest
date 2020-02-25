'use strict';

// Dependencies
const BodyParser	= require( './body_parser' );

/**
 * @brief	Constants
 */
const JSON_BODY_PARSER_SUPPORTED_TYPE	= 'application/json';
const CONTENT_LENGTH_HEADER				= 'content-length';
const CONTENT_TYPE_HEADER				= 'content-type';

/**
 * @brief	JsonBodyParser responsible for parsing application/json forms
 */
class JsonBodyParser extends BodyParser
{
	/**
	 * @param	Object options
	 * 			Accepts options:
	 * 			- maxPayloadLength - Number - The max size of the body to be parsed
	 * 			- strict - Boolean - Whether the received payload must match the content-length
	 */
	constructor( options = {} )
	{
		super( options );

		// Defaults to 100 MB
		this.maxPayloadLength	= typeof options.maxPayloadLength === 'number'
								? options.maxPayloadLength
								: 104857600;

		this.strict				= typeof options.strict === 'boolean'
								? options.strict
								: false;

		this.rawPayload			= [];
		this.payloadLength		= 0;
	}

	/**
	 * @see	BodyParser::supports()
	 */
	supports( event )
	{
		let contentType	= event.headers[CONTENT_TYPE_HEADER];
		return typeof contentType === 'string' && contentType.match( JSON_BODY_PARSER_SUPPORTED_TYPE ) !== null
	}

	/**
	 * @brief	Called when the body has been fully received
	 *
	 * @param	Buffer rawPayload
	 * @param	Object headers
	 * @param	Function callback
	 *
	 * @return	void
	 */
	onEndCallback( rawPayload, headers, callback )
	{
		if ( rawPayload.length > this.maxPayloadLength )
		{
			callback( 'Max payload length reached' );
			return;
		}

		if (
			this.strict &&
			(
				typeof headers !== 'object'
				|| typeof headers[CONTENT_LENGTH_HEADER] === 'undefined'
				|| rawPayload.length !== Number( headers[CONTENT_LENGTH_HEADER] )
			)
		) {
			callback( 'Payload length does not match provided content-length' );
			return;
		}

		if ( rawPayload.length === 0 )
		{
			return callback( false, {} );
		}

		try
		{
			let payload	= JSON.parse( rawPayload.toString() );
			for ( let index in payload )
			{
				payload[index]	= decodeURIComponent( payload[index] );
			}

			callback( false, payload );
		}
		catch ( e )
		{
			callback( 'Could not parse the body' );
		}
	}

	/**
	 * @see	BodyParser::parse()
	 */
	parse( event )
	{
		return new Promise(( resolve, reject )=>{
			if ( ! this.supports( event ) )
			{
				reject( 'Body type not supported' );
				return;
			}

			event.request.on( 'data', ( data ) =>
			{
				if ( ! event.isFinished() )
				{
					this.rawPayload.push( data );
					this.payloadLength	+= data.length;
				}
			});

			event.request.on( 'end', () => {
				if ( ! event.isFinished() )
				{
					const rawPayload	= Buffer.concat( this.rawPayload, this.payloadLength );
					this.onEndCallback( rawPayload, event.headers, ( err, body )=>{
						if ( ! err )
						{
							event.body	= body;

							resolve( body );
						}
						else
						{
							reject( 'Could not parse the body' );
						}
					});
				}
			});
		});
	}
}

module.exports	= JsonBodyParser;