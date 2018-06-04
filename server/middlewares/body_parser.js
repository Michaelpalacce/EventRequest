'use strict';

// Dependencies
const MultipartFormParser	= require( './body_parsers/multipart_data_parser' );
const FormBodyParser		= require( './body_parsers/form_body_parser' );
const BaseBodyParser		= require( './body_parsers/base_body_parser' );

/**
 * @brief	BodyParser responsible for parsing the body of the request
 */
class BodyParser
{
	/**
	 * @brief	Initializes the parsers
	 *
	 * @details	Possible options:
	 * 			MultipartFormParser	: {} -> instructions to initialize the MultipartFormParser with the specified options
	 * 			FormBodyParser		: {} -> instructions to initialize the FormBodyParser with the specified options
	 * 			dieOnError			: Boolean -> if set to true will set an error in the event, if not event.next()
	 *
	 * @param	RequestEvent event
	 * @param	Object options
	 */
	constructor( event, options )
	{
		this.options		= options;
		this.dieOnError		= this.options.dieOnError || true;
		this.baseOptions	= {};
		this.event			= event;
		this.rawPayload		= [];
		this.payloadLength	= 0;
		this.parsers		= [];

		this.initParsers();
	}

	/**
	 * @brief	Initializes the parsers
	 *
	 * @return	void
	 */
	initParsers()
	{
		try
		{
			if ( this.parsers.constructor === Array )
			{
				for ( let index in this.parsers )
				{
					let parserConfig	= this.parsers[index];
					let parser			= typeof parserConfig.instance === 'function' ? parserConfig.instance : null;
					let parserOptions	= typeof parserConfig.options === 'object' ? parserConfig.options : [];

					if ( parser === null )
					{
						throw new Error( 'Invalid configuration' );
					}

					parser	= parser.getInstance( Object.assign( this.baseOptions, parserOptions ) );

					if ( parser instanceof BaseBodyParser )
					{
						this.parsers.push( parser );
					}
				}
			}
		}
		catch ( e )
		{
			this.event.setError( 'Invalid configuration provided' );
		}
	}

	/**
	 * @brief	Attaches events to receive the request body
	 *
	 * @param	Function onDataCallback
	 * @param	Function onEndCallback
	 *
	 * @return	void
	 */
	attachEvents( onDataCallback, onEndCallback )
	{
		this.event.request.on( 'data', ( data ) =>
		{
			if ( ! this.event.isFinished() )
			{
				this.rawPayload.push( data );
				this.payloadLength	+= data.length;
				onDataCallback( data );
			}
		});

		this.event.request.on( 'end', () => {
			if ( ! this.event.isFinished() )
			{
				this.rawPayload	= Buffer.concat( this.rawPayload, this.payloadLength );
				onEndCallback( this.rawPayload );
			}
		});
	}

	/**
	 * @brief	Goes through all the parsers and tries to parse the payload. If it cannot be parsed then an error is set
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	parseBody( callback )
	{
		for ( let index in this.parsers )
		{
			let parser	= this.parsers[index];
			
			if ( parser.supports( this.event ) )
			{
				parser.parse( this.event, ( err ) =>{
					if ( err && this.dieOnError )
					{
						this.event.setError( err );
					}
					else
					{
						callback( err );
					}
				});
				return;
			}
		}

		callback( false );
	}
}

module.exports	= {
	BodyParser			: BodyParser,
	BaseBodyParser		: BaseBodyParser,
	MultipartFormParser	: MultipartFormParser,
	FormBodyParser		: FormBodyParser
};
