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
		super( options );

		// Defaults to 10 MB
		this.maxPayloadLength	= typeof options.maxPayloadLength === 'number'
								? options.maxPayloadLength
								: 10 * 1048576;

		this.strict				= typeof options.strict === 'boolean'
								? options.strict
								: false;

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

		let payload			= rawPayload.toString();
		let body			= {};
		let payloadParts	= payload.split( '&' );

		for ( let i = 0; i < payloadParts.length; ++ i )
		{
			let param	= payloadParts[i].split( '=' );

			if ( param.length !== 2 )
			{
				continue;
			}

			body[param[0]]	= decodeURIComponent( param[1] );
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
		if ( ! this.supports( event ) )
		{
			callback( 'Body type not supported' );
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