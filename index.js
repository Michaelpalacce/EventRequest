'use strict';

// Dependencies
const http					= require( 'http' );
const https					= require( 'https' );
const middlewaresContainer	= require( './server/middleware_container' );
const Router				= require( './server/router' );
const RequestEvent			= require( './server/event' );
const TemplatingEngine		= require( './server/middlewares/templating_engine' );
const SessionHandler		= require( './server/middlewares/session_handler' );
const BodyParserHandler		= require( './server/middlewares/body_parser_handler' );
const Logger				= require( './server/middlewares/logger' );

/**
 * @brief	Constants
 */
const PROTOCOL_HTTP							= 'http';
const PROTOCOL_HTTPS						= 'https';
const OPTIONS_PARAM_PORT					= 'port';
const OPTIONS_PARAM_PORT_DEFAULT			= 3000;
const OPTIONS_PARAM_PROTOCOL				= 'protocol';
const OPTIONS_PARAM_PROTOCOL_DEFAULT		= PROTOCOL_HTTP;
const OPTIONS_PARAM_HTTPS					= 'httpsOptions';
const OPTIONS_PARAM_HTTPS_DEFAULT			= {};

const POSSIBLE_PROTOCOL_OPTIONS				= {};
POSSIBLE_PROTOCOL_OPTIONS[PROTOCOL_HTTP]	= http;
POSSIBLE_PROTOCOL_OPTIONS[PROTOCOL_HTTPS]	= https;

/**
 * @brief	Server class responsible for receiving requests and sending responses
 */
class Index
{
	/**
	 * @brief	Passes options for server configuration
	 *
	 * @param	Object options
	 */
	constructor( options	= {} )
	{
		this.options	= options;

		this.server		= {};
		this.router		= new Router();

		this.sanitizeConfig();
	}

	/**
	 * @brief	Sets defaults for the server options
	 *
	 * @return	void
	 */
	sanitizeConfig()
	{
		let options								= this.options;

		let protocol							= options[OPTIONS_PARAM_PROTOCOL];
		this.options[OPTIONS_PARAM_PROTOCOL]	= typeof protocol === 'string'
												&& typeof POSSIBLE_PROTOCOL_OPTIONS[protocol] !== 'undefined'
												? protocol
												: OPTIONS_PARAM_PROTOCOL_DEFAULT;

		let httpsOptions						= this.options[OPTIONS_PARAM_HTTPS];
		this.options[OPTIONS_PARAM_HTTPS]		= typeof httpsOptions === 'object'
												? httpsOptions
												: OPTIONS_PARAM_HTTPS_DEFAULT;

		let port								= options[OPTIONS_PARAM_PORT];
		this.options[OPTIONS_PARAM_PORT]		= typeof port === 'number'
												? port
												: OPTIONS_PARAM_PORT_DEFAULT;
	}

	/**
	 * @brief	Function that adds a middleware to the block chain of the router
	 *
	 * @param	Object|Router route
	 *
	 * @returns	void
	 */
	add( route )
	{
		this.router.add( route );
	};

	/**
	 * @brief	Use a predefined middleware from middlewaresContainer
	 *
	 * @param	String name
	 * @param	Object options
	 *
	 * @return	void
	 */
	use( name, options )
	{
		if ( typeof name === 'string' && typeof middlewaresContainer[name] === 'function' )
		{
			this.add( middlewaresContainer[name]( options ) );
		}
	};

	/**
	 * @brief	Resolves the given request and response
	 *
	 * @details	Creates a RequestEvent used by the Server with helpful methods
	 *
	 * @return	RequestEvent
	 */
	static resolve ( request, response )
	{
		return new RequestEvent( request, response );
	};

	/**
	 * @brief	Starts the server on a given port
	 *
	 * @param	Number port
	 *
	 * @return	void
	 */
	start ()
	{
		let unifiedServerCallback	= ( req, res ) =>{
			let requestEvent	= Index.resolve( req, res );

			res.on( 'finish', () => {
				requestEvent.cleanUp();
				requestEvent	= null;
			});

			res.on( 'error', ( error ) => {
				requestEvent.sendError( error );
				requestEvent.cleanUp();
				requestEvent	= null;
			});

			try
			{
				let block	= this.router.getExecutionBlockForCurrentEvent( requestEvent );
				requestEvent.setBlock( block );
				requestEvent.next();
			}
			catch ( e )
			{
				requestEvent.sendError( e );
			}
		};

		// Create the server
		let protocol		= this.options[OPTIONS_PARAM_PROTOCOL];
		this.server			= protocol === PROTOCOL_HTTPS
							? https.createServer( this.options[OPTIONS_PARAM_HTTPS], unifiedServerCallback )
							: http.createServer( unifiedServerCallback );

		this.server.listen( this.options[OPTIONS_PARAM_PORT], () =>
			{
				console.log( 'Server successfully started and listening on port', this.options[OPTIONS_PARAM_PORT] );
			}
		);

		// Add an error handler in case of an error.
		this.server.on( 'error', ( err )=>{
			console.log( 'Could not start the server on port: ', port );
			console.log( 'Error Returned was: ', err.code );
		});
	}
}

// Export the server module
module.exports	= {
	Server					: Index,
	Router					: Router,
	TemplatingEngine		: TemplatingEngine,
	SessionHandler			: SessionHandler,
	BodyParserHandler		: BodyParserHandler,
	Logger					: Logger
};
