'use strict';

// Dependencies
const { EventEmitter }				= require( 'events' );

/**
 * @brief	Constants
 */
const FORM_PARSER_SUPPORTED_TYPE	= 'application/x-www-form-urlencoded';
const CONTENT_LENGTH_HEADER			= 'content-length';
const CONTENT_TYPE_HEADER			= 'content-type';

/**
 * @brief	FormBodyParser responsible for parsing application/x-www-form-urlencoded forms
 */
class FormBodyParser extends EventEmitter
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

		// Defaults to 10 MB
		this.maxPayloadLength	= typeof options.maxPayloadLength === 'number'
								? options.maxPayloadLength
								: 10485760;

		this.strict				= typeof options.strict === 'boolean'
								? options.strict
								: false;
	}

	/**
	 * @brief	Returns true if the current body parser supports teh given request
	 *
	 * @return	void
	 */
	supports( event )
	{
		const contentType	= event.getHeader( CONTENT_TYPE_HEADER );
		return typeof contentType === 'string' && contentType.match( FORM_PARSER_SUPPORTED_TYPE ) !== null;
	}

	/**
	 * @see	BodyParser::parse()
	 */
	parse( event )
	{
		return new Promise(( resolve, reject ) => {
			let rawBody		= [];
			let payloadLength	= 0;

			if ( ! this.supports( event ) )
				return reject( 'Body type not supported' );

			event.request.on( 'data', ( data ) =>
			{
				if ( ! event.isFinished() )
				{
					rawBody.push( data );
					payloadLength	+= data.length;
				}
			});

			event.request.on( 'end', () => {
				if ( ! event.isFinished() )
				{
					rawBody	= Buffer.concat( rawBody, payloadLength );

					if ( this.strict && rawBody.length > this.maxPayloadLength )
						return resolve( { body: {}, rawBody: {} } );

					if (
						this.strict &&
						(
							typeof event.headers !== 'object'
							|| typeof event.headers[CONTENT_LENGTH_HEADER] === 'undefined'
							|| rawBody.length !== Number( event.headers[CONTENT_LENGTH_HEADER] )
						)
					) {
						return resolve( { body: {}, rawBody: {} } );
					}

					if ( rawBody.length === 0 )
						return resolve( { body: {}, rawBody: {} } );

					rawBody				= rawBody.toString();
					const payload		= rawBody;
					const body			= {};
					const payloadParts	= payload.split( '&' );

					for ( let i = 0; i < payloadParts.length; ++ i )
					{
						let param	= payloadParts[i].split( '=' );

						if ( param.length !== 2 )
							continue;

						body[param[0]]	= decodeURIComponent( param[1] );
					}

					resolve( { body, rawBody } );
				}
			});
		})
	}
}

module.exports	= FormBodyParser;