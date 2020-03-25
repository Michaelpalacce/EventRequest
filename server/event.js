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

		const parsedUrl	= url.parse( request.url, true );
		const list		= {},
			rc		= request.headers.cookie;

		rc && rc.split( ';' ).forEach( function( cookie ) {
			const parts					= cookie.split( '=' );
			list[parts.shift().trim()]	= decodeURI( parts.join( '=' ) );
		});

		this.queryString		= parsedUrl.query;
		this.clientIp			= request.connection === undefined ? false : request.connection.remoteAddress;
		this.path				= parsedUrl.pathname.trim();
		this.method				= request.method.toUpperCase();
		this.headers			= request.headers;
		this.validationHandler	= new ValidationHandler();
		this.request			= request;
		this.response			= response;
		this.cookies			= list;
		this.finished			= false;
		this.extra				= {};
		this.params				= {};
		this.block				= {};

		let errorHandler		= null;
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
		const self	= this;
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
	_cleanUp()
	{
		this.emit( 'cleanUp' );

		this.next				= undefined;
		this.block				= undefined;
		this.errorHandler		= undefined;
		this.queryString		= undefined;
		this.headers			= undefined;
		this.method				= undefined;
		this.path				= undefined;
		this.validationHandler	= undefined;
		this.request			= undefined;
		this.extra				= undefined;
		this.errorHandler		= undefined;
		this.cookies			= undefined;
		this.params				= undefined;
		this.clientIp			= undefined;
		this.finished			= true;

		this.emit( 'finished' );
		this.removeAllListeners();
	}

	/**
	 * @brief	Sets a new cookie
	 *
	 * @details	Return false if name or value are not set
	 * 			The options should be an object where all the keys will be taken as is as well as the values
	 * 			And they will be used to make an cookie header
	 *
	 * @param	String name
	 * @param	String value
	 * @param	Object options
	 *
	 * @return	Boolean
	 */
	setCookie( name, value, options = {} )
	{
		const cookieHeaderName	= 'set-cookie';
		const result			= this.validationHandler.validate(
			{ name, value },
			{
				name: 'filled',
				value: 'filled'
			}
		);

		if ( result.hasValidationFailed() )
		{
			return false;
		}

		let cookie	= `${name}=${value};`;

		for( const optionName in options )
		{
			if ( optionName.toLowerCase() === 'expires' || optionName.toLowerCase() === 'max-age' )
			{
				options[optionName]	= new Date( new Date().getTime() + options[optionName] * 1000 )
			}

			cookie	+= ` ${optionName}=${options[optionName]};`;
		}

		const cookieHeader	= this.response.getHeader( cookieHeaderName );
		const cookies		= typeof cookieHeader === 'undefined'
							? []
							: cookieHeader;

		cookies.push( cookie );

		this.setHeader( cookieHeaderName, cookies );
		return true;
	}

	/**
	 * @copydoc	EventRequest::_send
	 */
	send( response = '', code = 200, raw = false )
	{
		try
		{
			this._send( response, code, raw );
		}
		catch ( e )
		{
			this.sendError( e.toString() );
		}
	}

	/**
	 * @brief	Sends the response to the user
	 *
	 * @details	Raw is a flag to tell the eventRequest how to send the data
	 * 			If set to false, then the response passed will be returned in a JSON format if is not already a valid string
	 * 			If it is a valid string, then it will be returned as is
	 *
	 * @param	mixed response
	 * @param	Number code
	 * @param	Boolean raw
	 *
	 * @return	void
	 */
	_send( response = '', code = 200, raw = false )
	{
		let isRaw	= raw;

		if ( code !== 200 )
		{
			this.setStatusCode( code );
		}

		if (
			response != null
			&& typeof response != 'undefined'
			&& typeof response.pipe === 'function'
			&& response instanceof Streams.Readable
		) {
			isRaw	= true;
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

		const payload	= { code, raw, headers: this.response.getHeaders() };

		if ( ! isRaw || typeof response === 'string' )
			payload.response	= response;

		this.emit( 'send', payload );

		this._cleanUp();
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
	 * @brief	Retrieve a request header value
	 *
	 * @details	If the key does not exist, then return the default value if passed. Defaults to NULL
	 *
	 * @param	String key
	 * @param	String defaultValue
	 *
	 * @return	mixed
	 */
	getHeader( key, defaultValue = null )
	{
		key	= key.toLowerCase();

		return ! this.hasHeader( key ) ? defaultValue : this.headers[key];
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
		return typeof this.headers[key.toLowerCase()] !== 'undefined';
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
		this.response.statusCode	= typeof code === 'number' ? code : 500
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
			this.send( { redirectUrl }, statusCode );
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
		return this.response.finished || this.finished === true;
	}

	/**
	 * @brief	Sets the current execution block
	 *
	 * @param	Array block
	 *
	 * @return	void
	 */
	_setBlock( block )
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

		const isResponseFinished	= this.isFinished();

		if ( ! isResponseFinished )
		{
			if ( ! this.block.length > 0  )
			{
				this.sendError( `Cannot ${this.method} ${this.path}`, 404 );
				return;
			}

			try
			{
				const next		= this.block.shift();
				const response	= next( this );

				if ( response instanceof Promise )
				{
					response.catch(( error )=>{
						setImmediate(()=>{
							if ( ! this.isFinished() )
							{
								this.next( error );
							}
						});
					});
				}
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
	 *@param	Array args
	 *
	 * @return	void
	 */
	sendError( ...args )
	{
		if ( ! ( this.errorHandler instanceof ErrorHandler ) )
		{
			this.errorHandler	= new ErrorHandler();
		}

		args.unshift( this );

		this.errorHandler.handleError.apply( this.errorHandler, args );
	}
}

// Export The Module
module.exports	= EventRequest;
