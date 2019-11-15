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

		this.middleware	= [];
		this.setUpHttpMethodsToObject( this );
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
		let methods	= ['POST', 'PUT', 'GET', 'DELETE', 'HEAD'];

		methods.forEach(( method )=>{
			object[method.toLocaleLowerCase()]	= ( route, handler )=>{
				this.add({
					method,
					route,
					handler
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
	 * @returns	void
	 */
	add( route )
	{
		if ( route instanceof Router )
		{
			this.middleware	= this.middleware.concat( route.middleware );
			return;
		}

		if ( ! ( route instanceof Route ) )
		{
			route	= new Route( route );
		}

		this.middleware.push( route );
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
			throw new Error( 'Invalid Event provided' );
		}

		let block	= [];

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
					block.push( route.getHandler() );
				}
			}
		}

		return block;
	}

	/**
	 * @brief	Matches the requested method with the ones set in the event
	 *
	 * @details	If a string or an array is passed, then it will be converted to a Route
	 *
	 * @param	String requestedMethod
	 * @param	Route|Array|String route
	 *
	 * @return	Boolean
	 */
	static matchMethod( requestedMethod, method )
	{
		let route;

		if ( typeof method === 'string' || Array.isArray( method ) )
		{
			route	= new Route({
				method	: method
			});
		}
		else
		{
			// It should be a route object
			route	= method;
		}

		if ( ! ( route instanceof Route ) )
		{
			return false;
		}

		return route.matchMethod( requestedMethod );
	}

	/**
	 * @brief	Match the given route and returns any route parameters passed
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
