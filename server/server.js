'use strict';

// Dependencies
const http						= require( 'http' );
const { EventEmitter }			= require( 'events' );
const EventRequest				= require( './event_request' );
const RouterClass				= require( './components/routing/router' );
const PluginManager				= require( './plugins/plugin_manager' );
const { Loggur, LOG_LEVELS }	= require( './components/logger/loggur' );

const TimeoutPlugin				= require( './plugins/available_plugins/timeout_plugin' );
const EnvPlugin					= require( './plugins/available_plugins/env_plugin' );
const RateLimitsPlugin			= require( './plugins/available_plugins/rate_limits_plugin' );
const StaticResourcesPlugin		= require( './plugins/available_plugins/static_resources_plugin' );
const DataServerPlugin			= require( './plugins/available_plugins/data_server_plugin' );
const TemplatingEnginePlugin	= require( './plugins/available_plugins/templating_engine_plugin' );
const FileStreamHandlerPlugin	= require( './plugins/available_plugins/file_stream_handler_plugin' );
const LoggerPlugin				= require( './plugins/available_plugins/logger_plugin' );
const BodyParserPlugin			= require( './plugins/available_plugins/body_parser_plugin' );
const ResponseCachePlugin		= require( './plugins/available_plugins/response_cache_plugin' );
const SessionPlugin				= require( './plugins/available_plugins/session_plugin' );
const SecurityPlugin			= require( './plugins/available_plugins/security_plugin' );
const CorsPlugin				= require( './plugins/available_plugins/cors_plugin' );
const ValidationPlugin			= require( './plugins/available_plugins/validation_plugin' );
const CacheControlPlugin		= require( './plugins/available_plugins/cache_control_plugin' );

const JsonBodyParser			= require( './components/body_parsers/json_body_parser' );
const MultipartDataParser		= require( './components/body_parsers/multipart_data_parser' );
const FormBodyParser			= require( './components/body_parsers/form_body_parser' );
const RawBodyParser				= require( './components/body_parsers/raw_body_parser' );

/**
 * @brief	Server class responsible for receiving requests and sending responses
 */
class Server extends EventEmitter
{
	/**
	 * @brief	Initializes the Server
	 */
	constructor()
	{
		super();
		this.setMaxListeners( 0 );

		this.pluginManager	= new PluginManager();
		this.router			= this.Router();
		this.Loggur			= Loggur;

		this.plugins		= [];
		this.pluginBag		= {};

		this.setUpDefaultPlugins();
	}

	/**
	 * @brief	Adds a new middleware to the router
	 *
	 * @return	Server
	 */
	define()
	{
		this.router.define.apply( this.router, arguments );

		return this;
	}

	/**
	 * @brief	Sets up the default plugins
	 *
	 * @return	void
	 */
	setUpDefaultPlugins()
	{
		// attached like this to enable smart autocomplete in IDE's
		this.er_env						= new EnvPlugin( 'er_env' );
		this.er_cors					= new CorsPlugin( 'er_cors' );
		this.er_cache					= new CacheControlPlugin( 'er_cache' );
		this.er_static					= new StaticResourcesPlugin( 'er_static' );
		this.er_logger					= new LoggerPlugin( 'er_logger' );
		this.er_session					= new SessionPlugin( 'er_session' );
		this.er_timeout					= new TimeoutPlugin( 'er_timeout' );
		this.er_security				= new SecurityPlugin( 'er_security' );
		this.er_validation				= new ValidationPlugin( 'er_validation' );
		this.er_rate_limits				= new RateLimitsPlugin( 'er_rate_limits' );
		this.er_data_server				= new DataServerPlugin( 'er_data_server' );
		this.er_file_stream				= new FileStreamHandlerPlugin( 'er_file_stream' );
		this.er_response_cache			= new ResponseCachePlugin( 'er_response_cache' );
		this.er_body_parser_raw			= new BodyParserPlugin( RawBodyParser, 'er_body_parser_raw' );
		this.er_body_parser_json		= new BodyParserPlugin( JsonBodyParser, 'er_body_parser_json' );
		this.er_body_parser_form		= new BodyParserPlugin( FormBodyParser, 'er_body_parser_form' );
		this.er_templating_engine		= new TemplatingEnginePlugin( 'er_templating_engine' );
		this.er_body_parser_multipart	= new BodyParserPlugin( MultipartDataParser, 'er_body_parser_multipart' );

		this.pluginManager.addPlugin( this.er_env );
		this.pluginManager.addPlugin( this.er_cors );
		this.pluginManager.addPlugin( this.er_cache );
		this.pluginManager.addPlugin( this.er_static );
		this.pluginManager.addPlugin( this.er_logger );
		this.pluginManager.addPlugin( this.er_timeout );
		this.pluginManager.addPlugin( this.er_session );
		this.pluginManager.addPlugin( this.er_security );
		this.pluginManager.addPlugin( this.er_validation );
		this.pluginManager.addPlugin( this.er_rate_limits );
		this.pluginManager.addPlugin( this.er_data_server );
		this.pluginManager.addPlugin( this.er_file_stream );
		this.pluginManager.addPlugin( this.er_response_cache );
		this.pluginManager.addPlugin( this.er_body_parser_raw );
		this.pluginManager.addPlugin( this.er_body_parser_json );
		this.pluginManager.addPlugin( this.er_body_parser_form );
		this.pluginManager.addPlugin( this.er_templating_engine );
		this.pluginManager.addPlugin( this.er_body_parser_multipart );

		this.apply( this.router );
		this.apply( this.er_static, { paths: ['favicon.ico'] } );
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
	 * @brief	Creates a new router
	 *
	 * @return	Router
	 */
	Router()
	{
		return new RouterClass();
	}

	/**
	 * @brief	This is used to apply a new PluginInterface
	 *
	 * @details	The plugin manager can be used to extract and set up plugins and then add them to the server just by
	 * 			giving their plugin ids
	 *
	 * @param	{PluginInterface|Object|String} plugin
	 * @param	{Object} options
	 *
	 * @return	Server
	 */
	apply( plugin, options = null )
	{
		if ( typeof plugin === 'string' )
			plugin	= this.pluginManager.getPlugin( plugin );

		if ( ! this.pluginManager.isValidPlugin( plugin ) )
			throw new Error( 'app.er.server.invalidPlugin' );

		if ( options !== null && options !== undefined )
			plugin.setOptions( options );

		this._attachPlugin( plugin );

		return this;
	}

	/**
	 * @brief	Attaches a PluginInterface to the server
	 *
	 * @param	{PluginInterface} plugin
	 *
	 * @return	void
	 */
	_attachPlugin( plugin )
	{
		const pluginDependencies	= plugin.getPluginDependencies();
		const pluginId				= plugin.getPluginId();

		for ( const dependency of pluginDependencies )
			if ( ! this.hasPlugin( dependency ) )
				throw new Error( `app.er.server.missingPluginDependency.${pluginId}` );

		plugin.setServerOnRuntime( this );

		for ( const middleware of plugin.getPluginMiddleware() )
			this.add( middleware );

		this.plugins[pluginId]	= plugin;
	}

	/**
	 * @brief	Gets a plugin attached to the server
	 *
	 * @details	Will throw if the plugin is not attached
	 *
	 * @param	{String|PluginInterface} pluginId
	 *
	 * @return	PluginInterface
	 */
	getPlugin( pluginId )
	{
		const id	= typeof pluginId === 'string' ? pluginId : pluginId.getPluginId();

		if ( this.hasPlugin( id ) )
			return this.plugins[id];
		else
			throw new Error( `app.er.server.missingPlugin.${id}` );
	}

	/**
	 * @brief	Checks whether the server has a plugin with the given id
	 *
	 * @param	{String|PluginInterface} pluginId
	 *
	 * @return	Boolean
	 */
	hasPlugin( pluginId )
	{
		const id	= typeof pluginId === 'string' ? pluginId : pluginId.getPluginId();

		return typeof this.plugins[id] !== 'undefined';
	}

	/**
	 * @brief	Callback for the http.createServer
	 *
	 * @return	Function
	 */
	attach()
	{
		return ( request, response ) => {
			let eventRequest	= new EventRequest( request, response );

			request.on( 'close', () => {
				if ( eventRequest !== null && eventRequest !== undefined )
				{
					eventRequest._cleanUp();
					eventRequest	= null;
				}
			});

			response.on( 'error', ( error ) => {
				if ( eventRequest !== null && eventRequest !== undefined )
				{
					eventRequest.next( error );
					eventRequest	= null;
				}
			});

			const block	= this.router.getExecutionBlockForCurrentEvent( eventRequest );

			eventRequest._setBlock( block );

			const onErrorCallback	= ( error ) => {
				if ( eventRequest.logger !== null && eventRequest.logger !== undefined )
					return;

				let message;

				if ( error.error instanceof Error )
				{
					message			= Object.assign( {}, error );
					message.error	= message.error.stack;
				}
				else if ( error instanceof Error )
					message	= error.stack;
				else if ( typeof error === 'object' )
					message	= Object.assign( {}, error );
				else
					message	= error;

				Loggur.log( message, LOG_LEVELS.error, true );
			};

			eventRequest.on( 'error', onErrorCallback );
			eventRequest.on( 'on_error', onErrorCallback );

			eventRequest.next();
		};
	}

	/**
	 * @brief	Starts the server on the given port
	 *
	 * @return	Server
	 */
	listen()
	{
		const httpServer	= http.createServer( this.attach() );

		return httpServer.listen.apply( httpServer, arguments );
	}
}

module.exports	= Server;