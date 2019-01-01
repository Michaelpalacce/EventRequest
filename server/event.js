'use strict';

// Dependencies
const url									= require( 'url' );
const { EventEmitter }						= require( 'events' );
const { FileStreamHandler, FileStream }		= require( './components/file_streams/file_stream_handler' );
const ErrorHandler							= require( './components/error/error_handler' );
const Streams								= require( 'stream' );
const { Logger }							= require( './components/logger/loggur' );
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

		this.request			= request;
		this.response			= response;

		this.templateDir		= null;
		this.templatingEngine	= null;
		this.extra				= {};
		this.cookies			= {};
		this.params				= {};
		this.body				= {};
		this.block				= {};

		let fileStreamHandler	= null;
		Object.defineProperty( this, 'fileStreamHandler', {
			enumerable	: true,
			set			: ( arg ) =>{
				if ( arg == null )
				{
					fileStreamHandler	= arg;
					return;
				}

				if ( arg instanceof FileStreamHandler )
				{
					fileStreamHandler	= arg;
				}
				else
				{
					throw new Error( 'File stream handler must be an instance of FileStreamHandler' );
				}
			},
			get			: () =>{
				return fileStreamHandler;
			}
		});

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

		let logger	= null;
		Object.defineProperty( this, 'logger', {
			enumerable	: true,
			set			: ( arg ) =>{
				if ( arg == null )
				{
					logger	= arg;
					return;
				}

				if ( arg instanceof Logger )
				{
					logger	= arg;
				}
				else
				{
					throw new Error( 'Logger must be an instance of Logger' );
				}
			},
			get			: () =>{
				return logger;
			}
		});
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

		this.extra				= undefined;
		this.body				= undefined;
		this.templatingEngine	= undefined;
		this.templateDir		= undefined;
		this.fileStreamHandler	= undefined;
		this.errorHandler		= undefined;
		this.cookies			= undefined;
		this.params				= undefined;

		this.emit( 'finished' );
		this.removeAllListeners();
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
		this.response.statusCode	= typeof code === 'number' ? code : 200;

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

		this.emit( 'send', { code, raw } );

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
	 *
	 * @param	Error err
	 * @param	Number code
	 *
	 * @return	void
	 */
	next( err, code )
	{
		if ( err )
		{
			code	= typeof code === 'number' ? code : 500;
			this.sendError( err, code );
			return;
		}

		if ( this.block.length <= 0 && ! this.isFinished() )
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

	/**
	 * @brief	Gets the file stream handler if one exists, creates an empty one if not
	 *
	 * @return	FileStreamHandler
	 */
	getFileStreamHandler()
	{
		if ( this.fileStreamHandler === null )
		{
			this.fileStreamHandler	= new FileStreamHandler( this );
		}

		return this.fileStreamHandler;
	}

	/**
	 * @brief	Streams files
	 *
	 * @param	String file
	 * @param	Object options
	 *
	 * @return	void
	 */
	streamFile( file, options )
	{
		let fileStream	= this.getFileStreamHandler().getFileStreamerForType( file );

		if ( fileStream !== null || fileStream instanceof FileStream )
		{
			fileStream.stream( file, options );
		}
		else
		{
			this.next( 'Could not find a FileStream that supports that format' )
		}
	}
}

// Export The Module
module.exports	= EventRequest;
