'use strict';

// Dependencies
const EventRequest	= require( '../../event' );
const Route			= require( './route' );

/**
 * @brief	Handler used to return all the needed middleware for the given event
 */
class Router
{
	/**
	 * @brief	Initializes the router with an empty middleware object
	 */
	constructor()
	{
		this.middleware	= [];
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
			// Its should be a route object
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
