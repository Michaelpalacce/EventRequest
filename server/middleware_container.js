'use strict';

// Dependencies
const fs					= require( 'fs' );
const path					= require( 'path' );
const setAdvTimeout			= require( './timeout' );
const BodyParsers			= require( './middlewares/body_parser_handler' );
const TemplatingEngine		= require( './middlewares/templating_engine' );
const BaseTemplatingEngine	= require( './middlewares/templating_engines/base_templating_engine' );
const FileStreams			= require( './middlewares/file_stream_handler' );
const Session				= require( './middlewares/session_handler' );
const Logger				= require( './middlewares/logger' );
const ConsoleLogger			= require( './middlewares/loggers/console_logger' );

const SessionHandler		= Session.SessionHandler;
const FileStreamHandler		= FileStreams.FileStreamHandler;
const BodyParserHandler		= BodyParsers.BodyParserHandler;

// Define the object
let middlewaresContainer	= {};
const PROJECT_ROOT			= path.parse( require.main.filename ).dir;

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
 * @brief	Logs information about the current event
 *
 * @details	This should ideally be used after the static path middleware.
 * 			Accepts options:
 * 			- logger - Logger - The logger to use. Defaults to ConsoleLogger
 * 			- options - Object - Any options to be passed to the logger
 * 			- level - log level
 *
 * @param	Object options
 *
 * @return	Object
 */
middlewaresContainer.logger	= ( options ) => {
	return {
		handler	: ( event ) => {
			if ( typeof options !== 'undefined' )
			{
				let logger	= typeof options.logger === 'function'
				&& typeof options.logger.getInstance === 'function'
					? options.logger.getInstance( event, options.options )
					: null;

				if ( ! logger instanceof Logger || logger === null )
				{
					logger	= ConsoleLogger.getInstance( event, options.options );
				}

				event.logger	= logger;

				event.logData( options.level );
				event.next();
			}
			else
			{
				event.sendError( 'Invalid logger provided' );
			}
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
					event.log( 'Request timed out', event.path );
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
