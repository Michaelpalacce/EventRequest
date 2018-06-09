'use strict';

// Dependencies
const BodyParser	= require( './body_parser' );

/**
 * @brief	Constants
 */
const FORM_PARSER_SUPPORTED_TYPE	= 'application/x-www-form-urlencoded';
const CONTENT_LENGTH_HEADER			= 'content-length';
const CONTENT_TYPE_HEADER			= 'content-type';

/**
 * @brief	FormBodyParser responsible for parsing application/x-www-form-urlencoded forms
 */
class FormBodyParser extends BodyParser
{
	/**
	 * @param	Object options
	 * 			Accepts options:
	 * 			- maxPayloadLength - Number - The max size of the body to be parsed
	 * 			- strict - Boolean - Whether the received payload must match the content-length
	 */
	constructor( options = {} )
	{
		super( options = {} );

		// Defaults to 10 MB
		this.maxPayloadLength	= options.maxPayloadLength || 10 * 1048576;
		this.strict				= options.strict || true;
		this.rawPayload			= [];
		this.payloadLength		= 0;
	}

	/**
	 * @see	BodyParser::supports
	 */
	supports( event )
	{
		let contentType	= event.headers[CONTENT_TYPE_HEADER];
		return typeof contentType === 'string' && contentType.match( FORM_PARSER_SUPPORTED_TYPE ) !== null
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
		}

		if (
			this.strict &&
			(
				typeof headers !== 'object'
				|| typeof headers[CONTENT_LENGTH_HEADER] !== 'string'
				|| rawPayload.length !== Number( headers[CONTENT_LENGTH_HEADER] )
			)
		) {
			callback( 'Payload length does not match provided content-length' );
			return;
		}

		let decodedPayload	= decodeURIComponent( rawPayload.toString( 'ascii' ) );
		let body			= {};
		let payloadParts	= decodedPayload.split( '&' );

		for ( let i = 0; i < payloadParts.length; ++ i )
		{
			let param	= payloadParts[i].split( '=' );

			if ( param.length !== 2 )
			{
				continue;
			}

			body[param[0]]	= param[1];
		}

		callback( false, body );
	}

	/**
	 * @brief	Parser the form body if possible and returns an object
	 *
	 * @param	Buffer rawPayload
	 * @param	Function callback
	 *
	 * @return	void
	 */
	parse( event, callback )
	{
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
				this.rawPayload	= Buffer.concat( this.rawPayload, this.payloadLength );
				this.onEndCallback( this.rawPayload, event.headers, ( err, body )=>{
					if ( ! err )
					{
						callback( false, body );
					}
					else
					{
						callback( 'Could not parse the body' );
					}
				});
			}
		});
	}
}

module.exports	= FormBodyParser;
