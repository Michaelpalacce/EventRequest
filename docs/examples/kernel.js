'use strict';

// Dependencies
const app			= require( 'event_request' )();
const path			= require( 'path' );
const PROJECT_ROOT	= path.parse( require.main.filename ).dir;

//////////////////////////////////////////////LOGGING SECTION //////////////////////////////////////////////////////////

const { Logging }							= require( 'event_request' );
const { Console, File, Loggur, LOG_LEVELS }	= Logging;

/**
 * @brief	Logs to the /logs/access.log
 *
 * @details	Logs on a level of notice where the only thing being logged there is the routing information
 */
const accessFileLog		= new File({
	logLevel	: LOG_LEVELS.notice,
	filePath	: path.join( PROJECT_ROOT, '/logs/access.log' ),
	logLevels	: { notice : LOG_LEVELS.notice }
});

/**
 * @brief	Logs errors to /logs/error.log
 */
const errorFileLog		= new File({
	logLevel	: LOG_LEVELS.error,
	filePath	: path.join( PROJECT_ROOT, '/logs/error.log' ),
});

/**
 * @brief	Transports to be added to the Logger
 */
const transports		= [accessFileLog, errorFileLog];

if ( typeof process.env !== 'undefined' && process.env.DEBUG === '1' )
{
	/**
	 * @brief	Logs all information capable of logging to /logs/debug.log
	 *
	 * @details	Will be enabled only if environment variable DEBUG === 1
	 */
	const debugFileLog		= new File({
		logLevel	: LOG_LEVELS.debug,
		filePath	: path.join( PROJECT_ROOT, '/logs/debug.log' )
	});

	/**
	 * @brief	Logs Everything below a notice level to the console
	 *
	 * @details	Will be enabled only if environment variable DEBUG === 1
	 */
	const debugConsoleLog	= new Console( { logLevel : LOG_LEVELS.notice } );

	transports.push( debugConsoleLog );
	transports.push( debugFileLog );
}

// The Id of the new logger
const loggerId	= 'app-id';

// The new Logger
const logger	= Loggur.createLogger({
	serverName	: 'AppName',
	logLevel	: LOG_LEVELS.debug,
	capture		: false,
	transports
});

// Adds a Logger to the Loggur with an id of server-emulator
Loggur.addLogger( loggerId, logger );

//////////////////////////////////////////////LOGGING SECTION //////////////////////////////////////////////////////////

////////////////////////////////////////ERROR HANDLER SECTION //////////////////////////////////////////////////////////
'use strict';

//Dependencies
const ErrorHandler	= require( 'event_request/server/components/error/error_handler' );
const errorHandler	= new ErrorHandler();

errorHandler.addNamespace( 'app.input', { status: 400 } );
errorHandler.addNamespace( 'app.module', { status: 400 } );

errorHandler.addNamespace( 'app.security.unauthorized', { status: 401, message: 'Invalid credentials' } );
errorHandler.addNamespace( 'app.security.unauthenticated', { status: 401, message: 'User unauthenticated' } );

errorHandler.addNamespace( 'app.security.forbidden', { status: 403 } );


////////////////////////////////////////ERROR HANDLER SECTION //////////////////////////////////////////////////////////


app.apply( app.er_cors, {
	origin: 'er_dynamic',
	headers: [
		'Access-Control-Allow-Headers',
		'Origin',
		'Accept',
		'X-Requested-With',
		'Cache-Control',
		'Content-Type',
		'Referer',
		'User-Agent',
		'Access-Control-Request-Method',
		'Access-Control-Request-Headers',
		'token',
		'DNT',
		'sec-ch-ua',
		'sec-ch-ua-mobile'
	],
	exposedHeaders: ['token'],
	credentials: true
});

// Add Error Handler
app.add(( event ) => {
	event.errorHandler	= errorHandler;

	event.next();
});

app.er_validation.setOptions({
	failureCallback: ( event, parameter, result ) => {
		event.next( `Invalid input: ${JSON.stringify( result.getValidationResult() )}`, 400 );
	}
});

// Attach the cache server
app.apply( app.er_data_server, { dataServerOptions: { persist: true, persistPath: path.join( PROJECT_ROOT, 'cache' ) } } );

// Rate Limit the request
app.apply( app.er_rate_limits, {} );

// Parse body
app.apply( app.er_body_parser_form );
app.apply( app.er_body_parser_json );
app.apply( app.er_body_parser_multipart,	{ tempDir	: path.join( PROJECT_ROOT, './Uploads' ) } );
app.apply( app.er_body_parser_raw );

// Add Timeout
app.apply( app.er_timeout,					{ timeout	: 60000 } );

// Add a logger
app.apply( app.er_logger,					{ logger } );

// Attach the file streamers
app.apply( app.er_file_stream );

const hasSSL	= process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATHl;

// Add a user cookie session
app.apply( app.er_session, { isCookieSession: true, isSecureCookie: hasSSL, sessionKey: 'token' } );

// Attach the caching server to the process optionally
// process.cachingServer	= app.getPlugin( app.er_data_server ).getServer();
