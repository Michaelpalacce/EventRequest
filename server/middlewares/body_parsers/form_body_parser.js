'use strict';

/**
 * @brief	Constants
 */
const FORM_PARSER_SUPPORTED_TYPE	= 'application/x-www-form-urlencoded';
const PARSER_ID						= 'FormBodyParser';
const CONTENT_LENGTH_HEADER			= 'content-length';
const CONTENT_TYPE_HEADER			= 'content-type';

/**
 * @brief	FormBodyParser responsible for parsing application/x-www-form-urlencoded forms
 */
class FormBodyParser
{
	/**
	 * @param	BodyParser bodyParser
	 * @param	Object options
	 * 			Accepts options:
	 * 			- maxPayloadLength - Number - The max size of the body to be parsed
	 * 			- strict - Boolean - Whether the received payload must match the content-length
	 */
	constructor( bodyParser, options = {} )
	{
		this.bodyParser			= bodyParser;

		// Defaults to 10 MB
		this.maxPayloadLength	= options.maxPayloadLength || 10 * 1048576;
		this.strict				= options.strict || true;
	}

	/**
	 * @brief	Return if the current body type is supported by the current body parser
	 *
	 * @param	RequestEvent event
	 *
	 * @return	Boolean
	 */
	supports( event )
	{
		let contentType	= event.headers[CONTENT_TYPE_HEADER];
		return typeof contentType === 'string' && contentType.match( FORM_PARSER_SUPPORTED_TYPE ) !== null
	}

	/**
	 * @brief	Gets the id of the parser used to reference it by
	 *
	 * @return	String
	 */
	static getId()
	{
		return PARSER_ID;
	}

	/**
	 * @brief	Called when new data is received
	 *
	 * @param	Buffer chunk
	 *
	 * @return	void
	 */
	onDataCallback( chunk )
	{
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
			callback( 'Max payload length reached', {} );
		}

		if (
			this.strict
		) {
			if (
				typeof headers !== 'object'
				|| typeof headers[CONTENT_LENGTH_HEADER] !== 'string'
				|| rawPayload.length !== Number( headers[CONTENT_LENGTH_HEADER] )
			) {
				callback( 'Payload length does not match provided content-length' );
				return;
			}
		}

		let decodedPayload	= decodeURIComponent( rawPayload.toString( 'ascii' ) );
		let body			= {};

		try
		{
			body	= JSON.parse( decodedPayload );
			callback( false, body );
		}
		catch ( e )
		{
			body				= {};
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
	}

	/**
	 * @brief	Parser the form body if possible and returns an object
	 *
	 * @param	Buffer rawPayload
	 * @param	Function callback
	 *
	 * @return	Object
	 */
	parse( event, callback )
	{
		this.bodyParser.attachEvents( this.onDataCallback, ( rawPayload )=>{
			this.onEndCallback( rawPayload, event.headers, ( err, body )=>{
				if ( ! err )
				{
					event.body	= body;
					callback( false );
				}
				else
				{
					callback( 'Could not parse the body' );
				}
			});
		});
	}
}

module.exports	= FormBodyParser;
