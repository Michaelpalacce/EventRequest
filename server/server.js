'use strict';

// Dependencies
const http						= require( 'http' );
const https						= require( 'https' );
const EventRequest				= require( './event' );
const { EventEmitter }			= require( 'events' );
const Router					= require( './components/routing/router' );
const PluginInterface			= require( './plugins/plugin_interface' );
const PluginManager				= require( './plugins/preloaded_plugins' );
const Logging					= require( './components/logger/loggur' );
const { Loggur, LOG_LEVELS }	= Logging;

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

const POSSIBLE_PROTOCOL_OPTIONS						= {};
POSSIBLE_PROTOCOL_OPTIONS[PROTOCOL_HTTP]			= http;
POSSIBLE_PROTOCOL_OPTIONS[PROTOCOL_HTTPS]			= https;

/**
 * @brief	Server class responsible for receiving requests and sending responses
 */
class Server extends EventEmitter
{
	/**
	 * @brief	Passes options for server configuration
	 *
	 * @param	Object options
	 */
	constructor( options	= {} )
	{
		super();

		this.sanitizeConfig( options );

		this.router			= new Router();
		this.pluginManager	= PluginManager;
		this.plugins		= [];
	}

	/**
	 * @brief	Returns the plugin manager
	 *
	 * @return	PluginManager
	 */
	getPluginManager()
	{
		return this.pluginManager;
	}

	/**
	 * @brief	Sets defaults for the server options
	 *
	 * @details	Accepted options:
	 * 			- protocol - String - The protocol to be used ( http || https ) -> Defaults to http
	 * 			- httpsOptions - Object - Options that will be given to the https webserver -> Defaults to {}
	 * 			- port - Number - The port to run the webserver/s on -> Defaults to 3000
	 *
	 * 	@param	Object options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		this.protocol		= options[OPTIONS_PARAM_PROTOCOL];
		this.protocol		= typeof this.protocol === 'string'
							&& typeof POSSIBLE_PROTOCOL_OPTIONS[this.protocol] !== 'undefined'
							? this.protocol
							: OPTIONS_PARAM_PROTOCOL_DEFAULT;

		this.httpsOptions	= options[OPTIONS_PARAM_HTTPS];
		this.httpsOptions	= typeof this.httpsOptions === 'object'
							? this.httpsOptions
							: OPTIONS_PARAM_HTTPS_DEFAULT;

		this.port			= options[OPTIONS_PARAM_PORT];
		this.port			= typeof this.port === 'number'
							? this.port
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
		this.emit( 'addRoute', route );

		this.router.add( route );
	};

	/**
	 * @brief	This is used to apply a new PluginInterface
	 *
	 * @details	The plugin manager can be used to extract and set up plugins and then add them to the server just by
	 * 			giving their plugin ids
	 *
	 * @param	PluginInterface|String plugin
	 *
	 * @return	void
	 */
	apply( plugin )
	{
		if ( plugin instanceof PluginInterface )
		{
			this._attachPlugin( plugin );
		}
		else if ( typeof plugin === 'string' )
		{
			this._attachPlugin( this.pluginManager.getPlugin( plugin ) );
		}
		else
		{
			throw new Error( 'A PluginInterface or an existing PluginManager pluginId (string) must be added' );
		}
	}

	/**
	 * @brief	Attaches a PluginInterface to the server
	 *
	 * @param	PluginInterface plugin
	 *
	 * @return	void
	 */
	_attachPlugin( plugin )
	{
		let pluginDependencies	= plugin.getPluginDependencies();

		pluginDependencies.forEach(( dependency )=>{
			if ( ! this.plugins.includes( dependency ) )
			{
				throw new Error( 'The plugin ' + plugin.getPluginId() + ' requires ' + dependency + ' which is missing.' );
			}
		});

		let pluginMiddleware	= plugin.getPluginMiddleware();

		pluginMiddleware.forEach( ( route )=>{
			this.add( route );
		});

		plugin.setServerOnRuntime( this );

		this.plugins.push( plugin.getPluginId() );
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
	 * @param	IncomingMessage request
	 * @param	ServerResponse response
	 *
	 * @return	void
	 */
	serverCallback( request, response )
	{
		let eventRequest	= this.resolve( request, response );
		this.emit( 'eventRequestResolved', { eventRequest, request, response  } );

		request.on( 'close', ()=> {
			this.emit( 'eventRequestRequestClosed', { eventRequest, request } );

			eventRequest.cleanUp();
			eventRequest	= null;
		});

		response.on( 'finish', () => {
			this.emit( 'eventRequestResponseFinish', { eventRequest, response } );

			eventRequest.cleanUp();
			eventRequest	= null;
		});

		response.on( 'error', ( error ) => {
			this.emit( 'eventRequestResponseError', { eventRequest, response, error } );

			eventRequest.next( error );
			eventRequest.cleanUp();
			eventRequest	= null;
		});

		try
		{
			let block	= this.router.getExecutionBlockForCurrentEvent( eventRequest );
			this.emit( 'eventRequestBlockSetting', { eventRequest, block } );
			eventRequest.setBlock( block );
			this.emit( 'eventRequestBlockSet', { eventRequest, block } );

			eventRequest.on( 'error', ( error ) =>{
				this.emit( 'eventRequestError', { eventRequest, error } );

				if ( eventRequest.logger === null )
				{
					Loggur.log( error, LOG_LEVELS.error );
				}
				else
				{
					eventRequest.logger.log( error, LOG_LEVELS.error );
				}
			});

			eventRequest.next();
		}
		catch ( error )
		{
			this.emit( 'eventRequestThrow', { eventRequest, error } );

			eventRequest.next( error );
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
			this.emit( 'serverCreationSuccess', { server, port: this.port } );

				Loggur.log( `Server successfully started and listening on port: ${this.port}`, LOG_LEVELS.warning );
				callback( false, server );
			}
		);

		// Add an error handler in case of an error.
		server.on( 'error', ( error )=>{
			this.emit( 'serverCreationError', { server, error } );

			Loggur.log( 'Could not start the server on port: ' + this.port, LOG_LEVELS.error );
			Loggur.log( 'Error Returned was: ' + error.code + this.port, LOG_LEVELS.error );

			callback( error );
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
			this.emit( 'serverStart' );

			this.httpServer	= this.setUpNewServer( typeof callback === 'function' ? callback : ()=>{} );
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
			this.emit( 'serverStop' );

			this.httpServer.close();
			this.httpServer	= null;
		}
	}
}

// Export the server module
module.exports	= Server;
