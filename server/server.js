'use strict';

// Dependencies
const http						= require( 'http' );
const EventRequest				= require( './event_request' );
const { EventEmitter }			= require( 'events' );
const RouterClass				= require( './components/routing/router' );
const PluginInterface			= require( './plugins/plugin_interface' );
const PluginManager				= require( './plugins/preloaded_plugins' );
const Logging					= require( './components/logger/loggur' );
const { Loggur, LOG_LEVELS }	= Logging;

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

		this.plugins		= [];
		this.pluginManager	= PluginManager;
		this.pluginBag		= {};
		this.router			= this.Router();
		this.Loggur			= Loggur;

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
		this.apply( this.router );

		const pluginsToApply	= [
			{ plugin : 'er_static_resources', options: { paths: ['favicon.ico'] } },
		];

		pluginsToApply.forEach(( pluginConfig )=>{
			this.apply( pluginConfig.plugin, pluginConfig.options );
		});

		// attached like this to enable smart autocomplete in IDE's
		this.er_timeout					= this.pluginManager.getPlugin( 'er_timeout' );
		this.er_env						= this.pluginManager.getPlugin( 'er_env' );
		this.er_rate_limits				= this.pluginManager.getPlugin( 'er_rate_limits' );
		this.er_static_resources		= this.pluginManager.getPlugin( 'er_static_resources' );
		this.er_data_server				= this.pluginManager.getPlugin( 'er_data_server' );
		this.er_templating_engine		= this.pluginManager.getPlugin( 'er_templating_engine' );
		this.er_file_stream				= this.pluginManager.getPlugin( 'er_file_stream' );
		this.er_logger					= this.pluginManager.getPlugin( 'er_logger' );
		this.er_session					= this.pluginManager.getPlugin( 'er_session' );
		this.er_security				= this.pluginManager.getPlugin( 'er_security' );
		this.er_cors					= this.pluginManager.getPlugin( 'er_cors' );
		this.er_response_cache			= this.pluginManager.getPlugin( 'er_response_cache' );
		this.er_body_parser_json		= this.pluginManager.getPlugin( 'er_body_parser_json' );
		this.er_body_parser_form		= this.pluginManager.getPlugin( 'er_body_parser_form' );
		this.er_body_parser_multipart	= this.pluginManager.getPlugin( 'er_body_parser_multipart' );
		this.er_body_parser_raw			= this.pluginManager.getPlugin( 'er_body_parser_raw' );
		this.er_validation				= this.pluginManager.getPlugin( 'er_validation' );
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
	 * @param	{PluginInterface|String} plugin
	 * @param	{Object} options
	 *
	 * @return	Server
	 */
	apply( plugin, options = null )
	{
		if ( plugin instanceof PluginInterface )
		{
		}
		else if ( typeof plugin === 'string' )
		{
			plugin	= this.pluginManager.getPlugin( plugin );
		}
		else
		{
			throw new Error( 'A PluginInterface or an existing PluginManager pluginId (string) must be added' );
		}

		if ( options != null )
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

		pluginDependencies.forEach(( dependency )=>{

			if ( ! this.hasPlugin( dependency ) )
				throw new Error( 'The plugin ' + pluginId + ' requires ' + dependency + ' which is missing.' );

		});

		plugin.setServerOnRuntime( this );

		const pluginMiddleware	= plugin.getPluginMiddleware();

		pluginMiddleware.forEach( ( route )=>{
			this.add( route );
		});

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
			throw new Error( `The plugin ${id} is not attached to the server` );
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
		return ( request, response )=>{
			let eventRequest	= new EventRequest( request, response );

			request.on( 'close', ()=> {
				if ( eventRequest != null )
				{
					eventRequest._cleanUp();
					eventRequest	= null;
				}
			});

			response.on( 'finish', () => {
				if ( eventRequest != null )
				{
					eventRequest._cleanUp();
					eventRequest	= null;
				}
			});

			response.on( 'error', ( error ) => {
				if ( eventRequest != null )
				{
					eventRequest.next( error );
					eventRequest	= null;
				}
			});

			try
			{
				let block	= this.router.getExecutionBlockForCurrentEvent( eventRequest );

				eventRequest._setBlock( block );

				const onErrorCallback	= ( error ) =>{
					if ( eventRequest.logger === null )
						Loggur.log( error, LOG_LEVELS.error );
				};

				eventRequest.on( 'error', onErrorCallback );
				eventRequest.on( 'on_error', onErrorCallback );

				eventRequest.next();
			}
			catch ( error )
			{
				if ( ! eventRequest.isFinished() )
					eventRequest.next( error );
			}
		}
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