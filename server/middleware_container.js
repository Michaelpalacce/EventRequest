'use strict';

// Dependencies
const { BodyParserHandler }	= require( './components/body_parsers/body_parser_handler' );
const ErrorHandler			= require( './components/error/error_handler' );
const { Logger }			= require( './components/logger/loggur' );

// Define the object
let middlewaresContainer	= {};

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

				event.logger	= logger;
			}

			event.next();
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

// Export the module
module.exports	= middlewaresContainer;
