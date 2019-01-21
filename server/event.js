'use strict';

// Dependencies
const url									= require( 'url' );
const { EventEmitter }						= require( 'events' );
const ErrorHandler							= require( './components/error/error_handler' );
const Streams								= require( 'stream' );
const ValidationHandler						= require( './components/validation/validation_handler' );
const { IncomingMessage, ServerResponse }	= require( 'http' );

/**
 * @brief	Request event that holds all kinds of request data that is passed to all the middleware given by the router
 */
class EventRequest extends EventEmitter
{
	/**
	 * @param	Object request
	 * @param	Object response
	 * @param	Object buffer
	 */
	constructor( request, response )
	{
		super();
		this.setMaxListeners( 0 );

		if ( ! ( request instanceof IncomingMessage ) || ! ( response instanceof ServerResponse ) )
		{
			throw new Error( 'Invalid parameters passed to EventRequest' );
		}

		// Define read only properties of the Request Event
		let parsedUrl	= url.parse( request.url, true );

		Object.defineProperty( this, 'queryString', {
			value		: parsedUrl.query,
			writable	: false
		});

		Object.defineProperty( this, 'clientIp', {
			value		: request.connection === undefined ? false : request.connection.remoteAddress,
			writable	: false
		});

		Object.defineProperty( this, 'path', {
			value		: parsedUrl.pathname.trim(),
			writable	: false
		});

		Object.defineProperty( this, 'method', {
			value		: request.method.toUpperCase(),
			writable	: false
		});

		Object.defineProperty( this, 'headers', {
			value		: request.headers,
			writable	: false
		});

		Object.defineProperty( this, 'validationHandler', {
			value		: new ValidationHandler(),
			writable	: false
		});

		let list	= {},
			rc		= this.headers.cookie;

		rc && rc.split( ';' ).forEach( function( cookie ) {
			let parts					= cookie.split( '=' );
			list[parts.shift().trim()]	= decodeURI( parts.join( '=' ) );
		});

		this.request			= request;
		this.response			= response;
		this.cookies			= list;

		this.extra				= {};
		this.params				= {};
		this.block				= {};

		let errorHandler	= null;
		Object.defineProperty( this, 'errorHandler', {
			enumerable	: true,
			set			: ( arg ) =>{
				if ( arg == null )
				{
					errorHandler	= arg;
					return;
				}

				if ( arg instanceof ErrorHandler )
				{
					errorHandler	= arg;
				}
				else
				{
					throw new Error( 'Error handler must be an instance of ErrorHandler' );
				}
			},
			get			: () =>{
				return errorHandler;
			}
		});

		// We do this so we can pass the event.next function by reference
		let self	= this;
		this.next	= ( err, code )=>{
			self._next( err, code );
		};
	}

	/**
	 * @brief	Clean ups the event
	 *
	 * @details	Removes all listeners from the eventEmitter
	 * 			Stops the event
	 * 			Clears internal pointers
	 *
	 * @return	void
	 */
	cleanUp()
	{
		this.emit( 'cleanUp' );

		this.extra			= undefined;
		this.errorHandler	= undefined;
		this.cookies		= undefined;
		this.params			= undefined;

		this.emit( 'finished' );
		this.removeAllListeners();
	}

	/**
	 * @brief	Sets a new cookie
	 *
	 * @param	String name
	 * @param	String value
	 *
	 * @return	void
	 */
	setCookie( name, value )
	{
		this.setHeader( 'Set-Cookie', [name + '=' + value] )
	}

	/**
	 * @brief	Sends the response to the user
	 *
	 * @details	Raw is a flag to tell the eventRequest how to send the data
	 *
	 * @param	mixed response
	 * @param	Number code
	 * @param	Boolean raw
	 *
	 * @return	void
	 */
	send( response, code = 200, raw = false )
	{
		this.setStatusCode( code );

		if ( typeof response.pipe === 'function' && response instanceof Streams.Readable )
		{
			response.pipe( this.response );
		}
		else
		{
			if ( raw === false )
			{
				try
				{
					response	= typeof response === 'string' ? response : JSON.stringify( response );
				}
				catch ( e )
				{
					response	= 'Malformed payload';
				}
			}

			this.response.end( response );
		}

		this.emit( 'send', { code, raw, response, headers: this.response.getHeaders() } );

		this.cleanUp();
	}

	/**
	 * @brief	Safely set header to response ( only if response is not sent )
	 *
	 * @details	Will throw an error if response is sent ( but server error that will not kill the execution )
	 *
	 * @param	String key
	 * @param	String value
	 *
	 * @return	void
	 */
	setHeader( key, value )
	{
		this.emit( 'setHeader', { key, value } );

		if ( ! this.isFinished() )
		{
			this.response.setHeader( key, value );
		}
		else
		{
			this.next( 'Trying to set headers when response is already sent' );
		}
	}

	/**
	 * @brief	Retrieve a header value
	 *
	 * @details	If the key does not exist, then return the default value if passed. Defaults to NULL
	 *
	 * @param	String key
	 * @param	String defaultValue
	 *
	 * @return	Mixed
	 */
	getHeaderValue( key, defaultValue = null )
	{
		return ! this.hasHeader( key ) ? defaultValue : key;
	}

	/**
	 * @brief	Return all the headers for the current request
	 *
	 * @return	Object
	 */
	getHeaders()
	{
		return this.headers;
	}

	/**
	 * @brief	Checks if the desired header exists
	 *
	 * @param	String key
	 *
	 * @return	Boolean
	 */
	hasHeader( key )
	{
		return typeof this.headers[key] !== 'undefined';
	}

	/**
	 * @brief	Sets the status code of the response
	 *
	 * @param	Number code
	 *
	 * @return	void
	 */
	setStatusCode( code )
	{
		this.response.statusCode	= typeof code === 'number' ? code : 200
	}

	/**
	 * @brief	Used to send a redirect response to a given redirectUrl
	 *
	 * @param	String redirectUrl
	 *
	 * @return	void
	 */
	redirect( redirectUrl, statusCode = 302 )
	{
		this.emit( 'redirect', { redirectUrl, statusCode } );

		if ( ! this.isFinished() )
		{
			this.setHeader( 'Location', redirectUrl );
			this.send( { redirectURL : redirectUrl }, statusCode );
		}
		else
		{
			this.next( 'Could not redirect, response already finished' );
		}
	}

	/**
	 * @brief	Checks if the response is finished
	 *
	 * @return	Boolean
	 */
	isFinished()
	{
		return this.response.finished;
	}

	/**
	 * @brief	Sets the current execution block
	 *
	 * @param	Array block
	 *
	 * @return	void
	 */
	setBlock( block )
	{
		this.block	= block;
	}

	/**
	 * @brief	Calls the next middleware in the execution block
	 *
	 * @details	If there is nothing else to send and the response has not been sent YET, then send a server error
	 * 			if the event is stopped and the response has not been set then send a server error
	 * 			This function is wrapped by the next() function
	 *
	 * @param	Error err
	 * @param	Number code
	 *
	 * @return	void
	 */
	_next( err, code )
	{
		if ( err )
		{
			code	= typeof code === 'number' ? code : 500;
			this.sendError( err, code );
			return;
		}

		let isResponseFinished	= this.isFinished();

		if ( ! isResponseFinished )
		{
			if ( ! this.block.length > 0  )
			{
				this.sendError( `Cannot ${this.method} ${this.path}` );
				return;
			}

			try
			{
				this.block.shift().call( this, this );
			}
			catch ( error )
			{
				this.next( error );
			}
		}
	}

	/**
	 * @brief	Will send a server error in case a response has not been already sent
	 *
	 * @param	mixed message
	 * @param	Number code
	 *
	 * @return	void
	 */
	sendError( error = '', code = 500 )
	{
		if ( ! ( this.errorHandler instanceof ErrorHandler ) )
		{
			this.errorHandler	= new ErrorHandler();
		}

		this.errorHandler.handleError( this, error, code );
	}
}

// Export The Module
module.exports	= EventRequest;
