'use strict';

// Dependencies
const url				= require( 'url' );
const events			= require( 'events' );
const FileStreams		= require( './middlewares/file_stream_handler' );
const TemplatingEngine	= require( './middlewares/templating_engine' );
const Logger			= require( './middlewares/logger' );

const FileStreamHandler	= FileStreams.FileStreamHandler;
const FileStream		= FileStreams.FileStream;

/**
 * @brief	Request event that holds all kinds of request data that is passed to all the middleware given by the router
 */
class RequestEvent
{
	/**
	 * @param	Object request
	 * @param	Object response
	 * @param	Object buffer
	 */
	constructor( request, response )
	{
		let parsedUrl	= url.parse( request.url, true );

		// Define read only properties of the Request Event
		Object.defineProperty( this, 'method', {
			value		: request.method.toUpperCase(),
			writable	: false
		});

		Object.defineProperty( this, 'headers', {
			value		: request.headers,
			writable	: false
		});

		Object.defineProperty( this, 'queryString', {
			value		: parsedUrl.query,
			writable	: false
		});

		Object.defineProperty( this, 'path', {
			value		: parsedUrl.pathname.trim(),
			writable	: false
		});

		Object.defineProperty( this, 'eventEmitter', {
			value		: new events.EventEmitter(),
			writable	: true
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
		this.templatingEngine	= null;
		this.fileStreamHandler	= null;
		this.logger				= null;
	}

	/**
	 * @brief	Attaches a callback to a specific event just once after which the
	 * 			Callback is removed from the event emitter queue
	 *
	 * @param	String key
	 * @param	Function callback
	 *
	 * @return	void
	 */
	once( key, callback )
	{
		this.eventEmitter.once( key, callback );
	}

	/**
	 * @brief	Attaches a callback to a specific event
	 *
	 * @param	String key
	 * @param	Function callback
	 *
	 * @return	void
	 */
	on( key, callback )
	{
		this.eventEmitter.on( key, callback );
	}

	/**
	 * @brief	Get the event emitter of the RequestEvent
	 *
	 * @param	String key
	 * @param	mixed data
	 *
	 * @return	EventEmitter
	 */
	emit( key, data )
	{
		this.eventEmitter.emit( key, data );
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
		this.clearTimeout();
		this.eventEmitter.removeAllListeners();
		this.stop();

		this.extra				= undefined;
		this.internalTimeout	= undefined;
		this.body				= undefined;
		this.templatingEngine	= undefined;
		this.fileStreamHandler	= undefined;
	}

	/**
	 * @brief	Logs Data if a logger is defined
	 *
	 * @param	mixed data
	 *
	 * @return	void
	 */
	log( data )
	{
		if ( this.logger instanceof Logger )
		{
			this.logger.log( data );
		}
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
		if ( raw === true )
		{
			this.response.statusCode	= code;
			this.response.end( response );
		}
		else
		{
			try
			{
				response	= typeof response === 'string' ? response : JSON.stringify( response );
			}
			catch ( e )
			{
				response	= 'Error while sending the payload';
			}

			this.response.statusCode	= typeof code === 'number' ? code : 200;
			this.response.end( response );
		}

		this.cleanUp();
	}

	/**
	 * @brief	Stops block execution
	 *
	 * @return	void
	 */
	stop()
	{
		this.isStopped	= true;
	}

	/**
	 * @brief	Outputs basic data about the request
	 *
	 * @param	Number level
	 *
	 * @return	void
	 */
	logData( level )
	{
		level		= typeof level === 'number' ? level : 1;

		if ( level >= 1 )
		{
			this.log({
				method				: this.method,
				path				: this.path,
				queryString			: this.queryString,
			});
		}

		if ( level >= 2 )
		{
			this.log({
				headers				: this.headers,
				cookies				: this.cookies,
				extra				: this.extra
			});
		}

		if ( level >= 3 )
		{
			this.log({});
		}
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
		if ( ! this.isFinished() )
		{
			this.response.setHeader( key, value );
		}
		else
		{
			this.sendError( 'Trying to set headers when response is already sent' );
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
			event.sendError( 'Trying to render but templating engine is not set' );
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
	 * @return	void
	 */
	next()
	{
		if ( this.block.length <= 0 && ! this.isFinished() )
		{
			this.sendError( 'No middlewares left and response has not been sent.' );
			return;
		}

		if ( this.isStopped )
		{
			if ( ! this.isFinished() )
			{
				this.send();
			}

			return ;
		}

		let middleware	= this.block.shift();

		try
		{
			middleware( this );
		}
		catch ( error )
		{
			this.sendError( error );
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
	sendError( message = '', code = 500 )
	{
		if ( message instanceof Error )
		{
			this.log( message );
			message	= message.toString();
		}

		if ( typeof message !== 'string' )
		{
			message	= JSON.stringify( message );
		}

		if ( ! this.isFinished() )
		{
			this.send( message, code );
		}
		else
		{
			this.log( `Server error: ${message}` );
		}
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
			this.sendError( 'Could not find a FileStream that supports that format' )
		}
	}
}

// Export The Module
module.exports	= RequestEvent;
