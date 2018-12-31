'use strict';

// Dependencies
const http						= require( 'http' );
const https						= require( 'https' );
const EventRequest				= require( './event' );
const Router					= require( './components/routing/router' );
const PluginInterface			= require( './plugins/plugin_interface' );
const middlewaresContainer		= require( './middleware_container' );
const Logging					= require( './components/logger/loggur' );
const { Loggur, LOG_LEVELS }	= Logging;
const DataServer				= require( './components/caching/data_server' );
const MemoryDataServer			= require( './components/caching/memory/memory_data_server' );

/**
 * @brief	Constants
 */
const PROTOCOL_HTTP									= 'http';
const PROTOCOL_HTTPS								= 'https';
const OPTIONS_PARAM_PORT							= 'port';
const OPTIONS_PARAM_PORT_DEFAULT					= 3000;
const OPTIONS_PARAM_PROTOCOL						= 'protocol';
const OPTIONS_PARAM_PROTOCOL_DEFAULT				= PROTOCOL_HTTP;
const OPTIONS_PARAM_HTTPS							= 'httpsOptions';
const OPTIONS_PARAM_HTTPS_DEFAULT					= {};
const OPTIONS_PARAM_CACHING_SERVER					= 'cachingServer';
const OPTIONS_PARAM_CACHING_SERVER_DEFAULT			= MemoryDataServer;
const OPTIONS_PARAM_CACHING_SERVER_OPTIONS			= 'cachingServerOptions';
const OPTIONS_PARAM_CACHING_SERVER_OPTIONS_DEFAULT	= {};

const POSSIBLE_PROTOCOL_OPTIONS						= {};
POSSIBLE_PROTOCOL_OPTIONS[PROTOCOL_HTTP]			= http;
POSSIBLE_PROTOCOL_OPTIONS[PROTOCOL_HTTPS]			= https;

/**
 * @brief	Server class responsible for receiving requests and sending responses
 */
class Server
{
	/**
	 * @brief	Passes options for server configuration
	 *
	 * @param	Object options
	 */
	constructor( options	= {} )
	{
		this.sanitizeConfig( options );

		this.router		= new Router();
	}

	/**
	 * @brief	Sets defaults for the server options
	 *
	 * @details	Accepted options:
	 * 			- protocol - String - The protocol to be used ( http || https ) -> Defaults to http
	 * 			- httpsOptions - Object - Options that will be given to the https webserver -> Defaults to {}
	 * 			- port - Number - The port to run the webserver/s on -> Defaults to 3000
	 * 			- cachingServer - DataServer - The caching server to be used to store data - Defaults to MemoryDataServer
	 * 			- cachingServerOptions - Object - Options to be passed to the data server - Defaults to OPTIONS_PARAM_CACHING_SERVER_OPTIONS_DEFAULT
	 *
	 * 	@param	Object options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		this.protocol				= options[OPTIONS_PARAM_PROTOCOL];
		this.protocol				= typeof this.protocol === 'string'
									&& typeof POSSIBLE_PROTOCOL_OPTIONS[this.protocol] !== 'undefined'
									? this.protocol
									: OPTIONS_PARAM_PROTOCOL_DEFAULT;

		this.httpsOptions			= options[OPTIONS_PARAM_HTTPS];
		this.httpsOptions			= typeof this.httpsOptions === 'object'
									? this.httpsOptions
									: OPTIONS_PARAM_HTTPS_DEFAULT;

		this.port					= options[OPTIONS_PARAM_PORT];
		this.port					= typeof this.port === 'number'
									? this.port
									: OPTIONS_PARAM_PORT_DEFAULT;

		this.cachingServer			= options[OPTIONS_PARAM_CACHING_SERVER];
		this.cachingServer			= typeof this.cachingServer === 'object'
									&& this.cachingServer instanceof DataServer
									? this.cachingServer
									: new OPTIONS_PARAM_CACHING_SERVER_DEFAULT();

		this.cachingServerOptions	= options[OPTIONS_PARAM_CACHING_SERVER_OPTIONS];
		this.cachingServerOptions	= typeof this.cachingServerOptions === 'object'
									? this.cachingServerOptions
									: OPTIONS_PARAM_CACHING_SERVER_OPTIONS_DEFAULT;
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
	 * @brief	This is used to apply a new PluginInterface
	 *
	 * @param	PluginInterface plugin
	 *
	 * @return	void
	 */
	apply( plugin )
	{
		if ( plugin instanceof PluginInterface )
		{
			let pluginMiddleware	= plugin.getPluginMiddleware();

			pluginMiddleware.forEach( ( route )=>{
				this.add( route );
			});
		}
	}

	/**
	 * @brief	Resolves the given request and response
	 *
	 * @details	Creates a EventRequest used by the Server with helpful methods
	 *
	 * @return	EventRequest
	 */
	resolve ( request, response )
	{
		return new EventRequest( request, response );
	};

	/**
	 * @brief	Called when a request is received to the server
	 *
	 * @param	IncomingMessage req
	 * @param	ServerResponse res
	 *
	 * @return	void
	 */
	serverCallback( req, res )
	{
		let eventRequest			= this.resolve( req, res );
		eventRequest.cachingServer	= this.cachingServer;

		req.on( 'close', ()=> {
			eventRequest.cleanUp();
			eventRequest	= null;
		});

		res.on( 'finish', () => {
			eventRequest.cleanUp();
			eventRequest	= null;
		});

		res.on( 'error', ( error ) => {
			eventRequest.next( error );
			eventRequest.cleanUp();
			eventRequest	= null;
		});

		try
		{
			let block	= this.router.getExecutionBlockForCurrentEvent( eventRequest );
			eventRequest.setBlock( block );

			eventRequest.on( 'error', ( err ) =>{
				if ( eventRequest.logger === null )
				{
					Loggur.log({
						level	: LOG_LEVELS.error,
						message	: err
					});
				}
			});

			eventRequest.next();
		}
		catch ( e )
		{
			eventRequest.next( e );
		}
	}

	/**
	 * @brief	Starts a new server
	 *
	 * @param	Function successCallback
	 *
	 * @return	Server
	 */
	setUpNewServer( callback )
	{
		// Create the server
		let protocol	= this.protocol;
		let server		= protocol === PROTOCOL_HTTPS
						? https.createServer( this.httpsOptions, this.serverCallback.bind( this ) )
						: http.createServer( this.serverCallback.bind( this ) );

		server.listen( this.port, () => {
				Loggur.log({
					level	: LOG_LEVELS.warning,
					message	: `Server successfully started and listening on port: ${this.port}`
				});

				callback( false, server );
			}
		);

		// Add an error handler in case of an error.
		server.on( 'error', ( err )=>{
			Loggur.log({
				level	: LOG_LEVELS.error,
				message	: 'Could not start the server on port: ' + this.port
			});
			Loggur.log({
				level	: LOG_LEVELS.error,
				message	: 'Error Returned was: ' + err.code
			});

			callback( err );
		});

		return server;
	}

	/**
	 * @brief	Starts the server on a given port
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	start( callback )
	{
		if ( this.httpServer == null )
		{
			callback	= typeof callback === 'function' ? callback : ()=>{};

			let onFulfilled	= ( data )=>{
				Loggur.log({
						level	: LOG_LEVELS.info,
						message	: data
					}
				);
			};
			let onRejected	= ( err )=>{
				Loggur.log({
						level	: LOG_LEVELS.error,
						message	: err
					}
				);
			};

			this.cachingServer.setUp( this.cachingServerOptions ).then( onFulfilled, onRejected );

			this.httpServer	= this.setUpNewServer( callback );
		}
	}

	/**
	 * @brief	Stops the server and the caching server
	 *
	 * @return	void
	 */
	stop()
	{
		if ( this.httpServer != null )
		{
			let onFulfilled	= ()=>{};
			let onRejected	= ( err )=>{
				Loggur.log({
					level	: LOG_LEVELS.error,
					message	: err
				});
			};

			this.cachingServer.exit( {} ).then( onFulfilled, onRejected );

			this.httpServer.close();
			this.httpServer	= null;
		}
	}
}

// Export the server module
module.exports	= Server;
