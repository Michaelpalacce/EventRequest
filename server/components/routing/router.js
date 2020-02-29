'use strict';

// Dependencies
const EventRequest		= require( '../../event' );
const Route				= require( './route' );
const PluginInterface	= require( './../../plugins/plugin_interface' );

/**
 * @brief	Handler used to return all the needed middleware for the given event
 */
class Router extends PluginInterface
{
	/**
	 * @brief	Initializes the router with an empty middleware object
	 */
	constructor()
	{
		super( 'er_router', {} );

		this.middleware			= [];
		this.globalMiddlewares	= {};
		this.setUpHttpMethodsToObject( this );
	}

	/**
	 * @brief	Defines a middleware to be used globally
	 *
	 * @param	String middlewareName
	 * @param	Function middleware
	 *
	 * @return	Router
	 */
	define( middlewareName, middleware )
	{
		if (
			typeof middlewareName !== 'string'
			|| typeof middleware !== 'function'
			|| typeof this.globalMiddlewares[middlewareName] !== 'undefined'
		) {
			throw new Error( 'Invalid middleware definition or middleware already exists' );
		}

		this.globalMiddlewares[middlewareName]	= middleware;

		return this;
	}

	/**
	 * @brief	Attaches methods to the server on runtime
	 *
	 * @param	Server server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.setUpHttpMethodsToObject( server );

		/**
		 * @brief	Function that adds a middleware to the block chain of the router
		 *
		 * @param	Object|Router route
		 *
		 * @returns	Server
		 */
		server.add	= ( route )=>{
			server.emit( 'addRoute', route );

			this.add( route );

			return server;
		};
	}

	/**
	 * @brief	Adds .post, .put, .get, .delete methods to the object
	 *
	 * @details	Accepts "route" as first param that can be the the usual string or regex but MUST be given
	 * 			and function "handler" to be called
	 *
	 * @return	void
	 */
	setUpHttpMethodsToObject( object )
	{
		const methods	= ['POST', 'PUT', 'GET', 'DELETE', 'HEAD', 'PATCH', 'COPY'];

		methods.forEach(( method )=>{
			object[method.toLocaleLowerCase()]	= ( route, handler, middlewares = [] )=>{
				this.add({
					method,
					route,
					handler,
					middlewares
				});

				return object;
			}
		});
	}

	/**
	 * @brief	Function that adds a middleware to the block chain of the router
	 *
	 * @details	Accepts an object with 3 arguments:
	 * 			- method - String|Array - The methods(s) to be matched for the route - optional
	 * 			- route - String|RegExp - The route to match - optional
	 * 			- handler - Function - Handler to be called - ! REQUIRED
	 *
	 * @param	Object route
	 *
	 * @returns	Router
	 */
	add( route )
	{
		if ( route instanceof Router )
		{
			this.middleware			= this.middleware.concat( route.middleware );
			const routerMiddlewares	= route.globalMiddlewares;

			for ( const [key, value] of Object.entries( routerMiddlewares ) )
			{
				this.define( key, value );
			}

			return this;
		}

		if ( ! ( route instanceof Route ) )
		{
			route	= new Route( route );
		}

		this.middleware.push( route );

		return this;
	}

	/**
	 * @brief	This will process the request and return the appropriate block chain
	 *
	 * @param	EventRequest event
	 *
	 * @return	Array
	 */
	getExecutionBlockForCurrentEvent( event )
	{
		if ( ! ( event instanceof EventRequest ) )
		{
			throw new Error( 'Invalid EventRequest provided' );
		}

		const block	= [];

		for ( let index in this.middleware )
		{
			let route			= this.middleware[index];
			let matchedParams	= [];
			let matched			= Router.matchRoute( event.path, route, matchedParams );

			if ( matched )
			{
				if ( Router.matchMethod( event.method, route ) )
				{
					let params	= {};

					matchedParams.forEach(( param )=>{
						params[param[0]]	= param[1];
					});

					event.params	= Object.assign( event.params, params );

					for ( const middlewareName of route.getMiddlewares() )
					{
						if ( typeof this.globalMiddlewares[middlewareName] !== 'function' )
						{
							throw new Error( `Could not find middleware ${middlewareName}` );
						}

						block.push( this.globalMiddlewares[middlewareName] );
					}

					block.push( route.getHandler() );
				}
			}
		}

		return block;
	}

	/**
	 * @brief	Matches the requested method with the ones set in the event and returns if there was a match or no
	 *
	 * @details	If a string or an array is passed, then it will be converted to a Route
	 *
	 * @param	String requestedMethod
	 * @param	Route|Array|String method
	 *
	 * @return	Boolean
	 */
	static matchMethod( requestedMethod, method )
	{
		let route;

		switch ( true )
		{
			case typeof method === 'string':
			case Array.isArray( method ):
				route	= new Route( { method } );
				break;
			default:
				route	= method;
				break;
		}

		if ( ! ( route instanceof Route ) )
		{
			return false;
		}

		return route.matchMethod( requestedMethod );
	}

	/**
	 * @brief	Match the given route and returns any route parameters passed in the matchedParams argument.
	 *
	 * @details	Returns bool if there was a successful match
	 *
	 * @param	String requestedRoute
	 * @param	String|RegExp|Route eventPath
	 * @param	Array matchedParams
	 *
	 * @return	Boolean
	 */
	static matchRoute( requestedRoute, route, matchedParams = [] )
	{
		if ( typeof route === 'string' || route instanceof RegExp )
		{
			route	= new Route({
				route	: route
			});
		}

		if ( ! ( route instanceof Route ) )
		{
			return false;
		}

		return route.matchPath( requestedRoute, matchedParams );
	}
}

// Export the module
module.exports	= Router;
