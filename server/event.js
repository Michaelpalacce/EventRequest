'use strict';

// Dependencies
const url								= require( 'url' );
const { EventEmitter }					= require( 'events' );
const { FileStreamHandler, FileStream }	= require( './components/file_stream_handler' );
const TemplatingEngine					= require( './components/templating_engine' );
const ErrorHandler						= require( './components/error_handler' );
const DataServer						= require( './components/caching/data_server' );

/**
 * @brief	Request event that holds all kinds of request data that is passed to all the middleware given by the router
 */
class RequestEvent extends EventEmitter
{
	/**
	 * @param	Object request
	 * @param	Object response
	 * @param	Object buffer
	 */
	constructor( request, response )
	{
		super();

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

		this.request			= request;
		this.response			= response;

		this.isStopped			= false;
		this.internalTimeout	= null;
		this.extra				= {};
		this.cookies			= {};
		this.params				= {};
		this.block				= {};
		this.body				= {};

		let templatingEngine	= null;
		Object.defineProperty( this, 'templatingEngine', {
			enumerable	: true,
			set			: ( arg ) =>{
				if ( arg == null )
				{
					templatingEngine	= arg;
					return;
				}

				if ( arg instanceof TemplatingEngine )
				{
					templatingEngine	= arg;
				}
				else
				{
					throw new Error( 'Templating engine must be an instance of TemplatingEngine' );
				}
			},
			get			: () =>{
				return templatingEngine;
			}
		});

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

		let cachingServer	= null;
		Object.defineProperty( this, 'cachingServer', {
			enumerable	: true,
			set			: ( arg ) =>{
				if ( arg == null )
				{
					cachingServer	= arg;
					return;
				}

				if ( arg instanceof DataServer )
				{
					cachingServer	= arg;
				}
				else
				{
					throw new Error( 'Error handler must be an instance of DataServer' );
				}
			},
			get			: () =>{
				return cachingServer;
			}
		});
	}

	/**
	 * @brief	Clean ups the event
	 *
	 * @details	Clears the timeout
	 * 			Removes all listeners from the eventEmitter
	 * 			Stops the event
	 * 			Clears internal pointers
	 *
	 * @return	void
	 */
	cleanUp()
	{
		this.emit( 'cleanUp' );
		this.clearTimeout();
		this.stop();

		this.extra				= undefined;
		this.internalTimeout	= undefined;
		this.body				= undefined;
		this.templatingEngine	= undefined;
		this.fileStreamHandler	= undefined;

		this.emit( 'finished' );
		this.removeAllListeners();
	}

	/**
	 * @brief	Sends the response to the user
	 *
	 * @param	mixed response
	 * @param	Number code
	 *
	 * @return	void
	 */
	send( response, code = 200, raw = false )
	{
		if ( raw === false )
		{
			try
			{
				response	= typeof response === 'string' ? response : JSON.stringify( response );
			}
			catch ( e )
			{
				response	= 'Error while sending the payload';
			}

			code	= typeof code === 'number' ? code : 200;
		}

		this.response.statusCode	= code;
		this.response.end( response );

		this.emit( 'send', { response, code, raw } );

		this.cleanUp();
	}

	/**
	 * @brief	Stops block execution
	 *
	 * @return	void
	 */
	stop()
	{
		this.emit( 'stop' );

		this.isStopped	= true;
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

		this.setHeader( 'Location', redirectUrl );
		this.send( { redirectURL : redirectUrl }, statusCode );
	}

	/**
	 * @brief	Clears the timeout event
	 *
	 * @return	void
	 */
	clearTimeout()
	{
		this.emit( 'clearTimeout' );

		if (
			typeof this.internalTimeout === 'object'
			&& this.internalTimeout !== null
			&& typeof this.internalTimeout.cancel === 'function'
		) {
			this.internalTimeout.cancel();
		}
	}

	/**
	 * @brief	Extends the timeout event given milliseconds
	 *
	 * @param	Number ms
	 *
	 * @return	void
	 */
	extendTimeout( ms )
	{
		if (
			typeof this.internalTimeout === 'object'
			&& this.internalTimeout !== null
			&& typeof this.internalTimeout.extend === 'function'
		) {
			this.internalTimeout.extend( ms );
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
	 * @see	TemplatingEngine::render()
	 */
	render( templateName, variables, callback )
	{
		this.emit( 'render', { templateName, variables, callback } );

		if ( this.templatingEngine instanceof TemplatingEngine )
		{
			this.templatingEngine.render( templateName, variables, ( err, result ) => {
				if ( ! err && result && result.length > 0 )
				{
					this.send( result, 200, true );
					callback( false );
				}
				else
				{
					callback( err );
				}
			});
		}
		else
		{
			event.next( 'Trying to render but templating engine is not set' );
		}
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
	 * @details	if there is nothing else to send and the response has not been sent YET, then send a server error
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
			this.next( 'No middlewares left and response has not been sent.' );
			return;
		}

		if ( this.isStopped )
		{
			if ( ! this.isFinished() )
			{
				this.send();
			}

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
module.exports	= RequestEvent;
