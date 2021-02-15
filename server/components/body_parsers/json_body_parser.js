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
	 * @param	{Object} options
	 * 				Accepts options:
	 * 					- maxPayloadLength - Number - The max size of the body to be parsed
	 * 					- strict - Boolean - Whether the received payload must match the content-length
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
	 * @param	{EventRequest} event
	 *
	 * @return	Boolean
	 */
	supports( event )
	{
		const contentType	= event.getRequestHeader( CONTENT_TYPE_HEADER );
		return typeof contentType === 'string' && contentType.match( JSON_BODY_PARSER_SUPPORTED_TYPE ) !== null;
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
		return new Promise(( resolve, reject ) => {
			let rawBody		= [];
			let payloadLength	= 0;

			if ( ! this.supports( event ) )
				return reject( { code: 'app.er.bodyParser.json.notSupported' } );

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

					if (
						this.strict &&
						(
							typeof event.headers !== 'object'
							|| typeof event.headers[CONTENT_LENGTH_HEADER] === 'undefined'
							|| payloadLength !== Number( event.headers[CONTENT_LENGTH_HEADER] )
						)
					) {
						return resolve( { body: {}, rawBody: {} } );
					}

					try
					{
						rawBody		= rawBody.toString();
						const body	= JSON.parse( rawBody );
						resolve( { body, rawBody } );
					}
					catch ( error )
					{
						reject( { code: 'app.er.bodyParser.json.errorParsing' } );
					}
				}
			});
		});
	}
}

module.exports	= JsonBodyParser;