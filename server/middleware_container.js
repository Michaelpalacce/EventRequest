'use strict';

// Dependencies
const fs							= require( 'fs' );
const path							= require( 'path' );
const setAdvTimeout					= require( './timeout' );
const { BodyParserHandler }			= require( './middlewares/body_parser_handler' );
const TemplatingEngine				= require( './middlewares/templating_engine' );
const BaseTemplatingEngine			= require( './middlewares/templating_engines/base_templating_engine' );
const { FileStreamHandler }			= require( './middlewares/file_stream_handler' );
const { SessionHandler }			= require( './middlewares/session_handler' );
const { Console, File, Transport }	= require( './logger/components/logger' );
const Loggur						= require( './logger/loggur' );
const { LOG_LEVELS }				= require( './logger/components/log' );

// Define the object
let middlewaresContainer	= {};

/**
 * @brief	Constants
 */
const PROJECT_ROOT			= path.parse( require.main.filename ).dir;
const DEFAULT_SERVER_NAME	= 'EventRequest';

/**
 * @brief	Sets up the Loggur and attaches it to the EventRequest events
 *
 * @param	Objects options
 *
 * @return	Object
 */
middlewaresContainer.logger				= ( options ) =>{
	let serverName				= typeof options.serverName	=== 'string'
								? options.serverName
								: DEFAULT_SERVER_NAME;

	let consoleLogLevel			= typeof options.consoleLogLevel === 'number'
								? options.consoleLogLevel
								: LOG_LEVELS.info;

	let loggerLogLevel			= typeof options.loggerLogLevel === 'number'
								? options.loggerLogLevel
								: LOG_LEVELS.info;

	let fileLogLevel			= typeof options.fileLogLevel === 'number'
								? options.fileLogLevel
								: LOG_LEVELS.info;

	let filePath				= typeof options.filePath === 'string'
								? options.filePath
								: false;

	let dieOnCapture			= typeof options.dieOnCapture === 'boolean'
								? options.dieOnCapture
								: false;

	let unhandledExceptionLevel	= typeof options.unhandledExceptionLevel === 'number'
								? options.unhandledExceptionLevel
								: false;

	let logger	= Loggur.createLogger({
		serverName	: serverName,
		transports	: [
			new Console({ logLevel : consoleLogLevel }),
			new File({ logLevel : fileLogLevel, filePath : filePath }),
		],
		logLevel				: loggerLogLevel,
		dieOnCapture			: dieOnCapture,
		unhandledExceptionLevel	: unhandledExceptionLevel
	});

	Loggur.addLogger( 'default_logger', logger );

	return {
		handler	: ( event ) =>{
			event.on( 'send', () =>{
				logger.verbose( '' )
			});
			event.next();
		}
	};
};

/**
 * @brief	File stream middleware
 *
 * @param	Object options
 *
 * @return	Object
 */
middlewaresContainer.setFileStream		= ( options ) =>{
	return {
		handler	: ( event ) =>{
			event.fileStreamHandler	= new FileStreamHandler( event, options );
			event.next();
		}
	};
};

/**
 * @brief	Sets the given templating engine to the event
 *
 * @param	Object options
 * 			Accepted options:
 * 			- engine - TemplatingEngine - Instance of TemplatingEngine. Defaults to BaseTemplatingEngine
 * 			- options - Object - options to be passed to the engine
 *
 * @return	Object
 */
middlewaresContainer.templatingEngine	= ( options ) =>{
	return {
		handler	: ( event ) =>{
			let engineOptions	= typeof options.options === 'object' ? options.options : {};

			if ( typeof options !== 'undefined' )
			{
				let templatingEngine	= typeof options.engine === 'function'
				&& typeof options.engine.getInstance === 'function'
					? options.engine.getInstance( engineOptions )
					: null;

				if ( ! templatingEngine instanceof TemplatingEngine || templatingEngine === null )
				{
					templatingEngine	= BaseTemplatingEngine.getInstance( engineOptions );
				}

				event.templatingEngine	= templatingEngine;
				event.next();
			}
			else
			{
				event.sendError( 'Invalid templating engine provided' );
			}
		}
	};
};

/**
 * @brief	Session middleware
 *
 * @param	Object options
 *
 * @return	Object
 */
middlewaresContainer.session	= ( options ) =>{
	return {
		handler	: ( event ) =>{
			let sessionHandler	= new SessionHandler( event, options );
			sessionHandler.handle( ( err ) =>{
				if ( ! err )
				{
					event.next();
				}
				else
				{
					event.sendError( err )
				}
			});
		}
	};
};

/**
 * @brief	Middleware responsible for parsing the body data
 *
 * @param	Object options
 *
 * @return	Object
 */
middlewaresContainer.bodyParser	= ( options ) =>{
	return {
		handler	: ( event ) =>
		{
			let bodyParserHandler	= new BodyParserHandler( event, options );
			bodyParserHandler.parseBody( ( err ) =>{
				if ( ! err )
				{
					event.next();
				}
				else
				{
					event.sendError( 'Could not parse the body' );
				}
			});
		}
	};
};

/**
 * @brief	Parses the given cookies and sets them to event.cookies
 *
 * @param	Object options
 * 			Accepts options:
 * 			- NONE -
 *
 * @return	Object
 */
middlewaresContainer.parseCookies	= ( options ) =>
{
	return {
		handler	: ( event ) =>{
			let list = {},
				rc = event.headers.cookie;

			rc && rc.split( ';' ).forEach( function( cookie ) {
				let parts					= cookie.split( '=' );
				list[parts.shift().trim()]	= decodeURI( parts.join( '=' ) );
			});

			event.cookies	= list;
			event.next();
		}
	};
};

/**
 * @brief	Sets the given path as the static path where resources can be delivered easily
 *
 * @param	string staticPath
 * 			Accepts options:
 * 			- path - the path to make static
 *
 * @return	Object
 */
middlewaresContainer.addStaticPath	= ( options ) => {
	let regExp	= new RegExp( '^(\/' + options.path + ')' );

	return {
		route	: regExp,
		handler	: ( event ) => {
			let item	= path.join( PROJECT_ROOT, event.path );

			fs.readFile( item, {}, ( err, data ) => {
				if ( ! err && data )
				{
					event.send( data, 200, true );
				}
				else
				{
					event.sendError( 'File not found' );
				}
			});
		}
	};
};

/**
 * @brief	Adds a timeout middleware that will cause the event to timeout after a sepcific time
 *
 * @param	string staticPath
 * 			Accepts options:
 * 			- timeout - the amount in seconds to cause the timeout defaults to 60
 *
 * @return	Object
 */
middlewaresContainer.timeout	= ( options ) =>
{
	let timeout	= typeof options.timeout === 'number' ? parseInt( options.timeout ) : 60;

	return {
		handler	: ( event ) => {
			event.internalTimeout	= setAdvTimeout( () => {
					if ( ! event.isFinished() )
					{
						event.sendError( 'TIMEOUT' );
					}
				},
				timeout
			);

			event.next();
		}
	};
};

// Export the module
module.exports	= middlewaresContainer;
