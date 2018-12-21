'use strict';

// Dependencies
const fs					= require( 'fs' );
const path					= require( 'path' );
const { BodyParserHandler }	= require( './components/body_parser_handler' );
const ErrorHandler			= require( './components/error_handler' );
const { SessionHandler }	= require( './components/session_handler' );
const { Logger }			= require( './components/logger/loggur' );

// Define the object
let middlewaresContainer	= {};

/**
 * @brief	Constants
 */
const PROJECT_ROOT	= path.parse( require.main.filename ).dir;

/**
 * @brief	Attaches an error handler to the event
 *
 * @param	Object options
 *
 * @return	Object
 */
middlewaresContainer.errorHandler		= ( options = {} ) =>{
	return {
		handler	: ( event ) =>{
			event.errorHandler	= typeof options.errorHandler === 'object'
								&& options.errorHandler instanceof ErrorHandler
								? options.errorHandler
								: new ErrorHandler();

			event.next();
		}
	}
};

/**
 * @brief	Sets up the Loggur and attaches it to the EventRequest events
 *
 * @param	Objects options
 *
 * @return	Object
 */
middlewaresContainer.logger				= ( options = {} ) =>{
	let logger	= typeof options.logger !== 'undefined' && options.logger instanceof Logger
				? options.logger
				: false;
	return {
		handler	: ( event ) =>{
			if ( logger )
			{
				let requestURL	= event.request.url;
				logger.notice( event.method + ': ' + requestURL );
				logger.verbose( event.headers );

				event.on( 'error', ( error ) =>{
					if ( error instanceof Error )
					{
						error	= error.stack;
					}

					logger.error( `Error : ${error}` );
				});

				event.on( 'finished', () =>{
					logger.info( 'Event finished' )
				});

				event.on( 'send', ( response ) =>{
					logger.info( `Responded with: ${response.code} to ${requestURL}` )
				});

				event.on( 'redirect', ( redirect ) =>{
					logger.info( `Redirect to: ${redirect.redirectUrl} with status code: ${redirect.statusCode}` )
				});

				event.on( 'stop', () =>{
					logger.verbose( 'Event stopped' )
				});

				event.on( 'setHeader', ( header ) =>{
					logger.verbose( `Header set: ${header.key} with value: ${header.value}` )
				});

				event.on( 'cleanUp', () =>{
					logger.verbose( 'Event is cleaning up' )
				});

				event.on( 'clearTimeout', () =>{
					logger.debug( 'Timeout cleared' )
				});

				event.on( 'render', ( template ) =>{
					logger.debug( `Rendering ${template.templateName}` )
				});

				event.logger	= logger;
			}

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
middlewaresContainer.templatingEngine	= ( options = {} ) =>{
	return {
		handler	: ( event ) =>{
			let engineOptions		= typeof options.options === 'object' ? options.options : {};

			let templatingEngine	= typeof engineOptions.engine !== 'undefined'
									&& typeof engineOptions.engine.render !== 'undefined'
									? engineOptions.engine
									: false;

			let templateDir			= typeof engineOptions.templateDir !== 'undefined'
									? engineOptions.templateDir
									: false;

			if ( templatingEngine === false || templateDir === false )
			{
				throw new Error( 'Invalid templating config provided.' );
			}

			event.templateDir		= templateDir;
			event.templatingEngine	= templatingEngine;
			event.next();
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
middlewaresContainer.session	= ( options = {} ) =>{
	return {
		handler	: ( event ) =>{
			let sessionHandler	= new SessionHandler( event, options );
			sessionHandler.handle( ( err ) =>{
				event.next();
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
middlewaresContainer.bodyParser	= ( options = {} ) =>{
	return {
		handler	: ( event ) =>
		{
			let bodyParserHandler	= new BodyParserHandler( event, options );
			bodyParserHandler.parseBody( event.next.bind( event ) );
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
middlewaresContainer.parseCookies	= ( options = {} ) =>
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
 * @param	String staticPath
 * 			Accepts options:
 * 			- path - String - the path to make static
 *
 * @return	Object
 */
middlewaresContainer.addStaticPath	= ( options = {} ) => {
	let staticPath	= typeof options.path === 'string' ? options.path : false;

	if ( staticPath === false )
	{
		throw new Error( 'Invalid path provided' );
	}

	let regExp	= new RegExp( '^(\/' + staticPath + ')' );

	return {
		route	: regExp,
		handler	: ( event ) => {
			let item	= path.join( PROJECT_ROOT, event.path );

			if ( fs.existsSync( item ) )
			{
				event.send( fs.createReadStream( item ), 200 );
			}
			else
			{
				event.next( `File not found: ${item}` );
			}
		}
	};
};

/**
 * @brief	Adds a timeout middleware that will cause the event to timeout after a specific time
 *
 * @param	string staticPath
 * 			Accepts options:
 * 			- timeout - Number - the amount of milliseconds after which the request should timeout - Defaults to 60 seconds
 *
 * @return	Object
 */
middlewaresContainer.timeout	= ( options = {} ) =>
{
	let timeout	= typeof options.timeout === 'number' ? parseInt( options.timeout ) : 60 * 1000;

	return {
		handler	: ( event ) => {
			event.internalTimeout	= setTimeout( () => {
					if ( ! event.isFinished() )
					{
						event.next( `Request timed out in: ${timeout}` );
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
