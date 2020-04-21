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
						return resolve( {} );

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
						return resolve( {} );

					let payload			= rawPayload.toString();
					let body			= {};
					let payloadParts	= payload.split( '&' );

					for ( let i = 0; i < payloadParts.length; ++ i )
					{
						let param	= payloadParts[i].split( '=' );

						if ( param.length !== 2 )
							continue;

						body[param[0]]	= decodeURIComponent( param[1] );
					}

					resolve( body );
				}
			});
		})
	}
}

module.exports	= FormBodyParser;