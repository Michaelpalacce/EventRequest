'use strict';

// Dependencies
const RequestEvent	= require( './event' );

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
		if ( typeof route !== 'object' )
		{
			throw new Error( 'Invalid middleware added!!' );
		}

		if ( route instanceof Router )
		{
			this.middleware	= this.middleware.concat( route.middleware );
			return;
		}

		route.route		= typeof route.route === 'string' || route.route instanceof RegExp
						? route.route
						: '';

		route.method	= typeof route.method === 'string' || route.method instanceof Array
						? route.method
						: '';

		route.handler	= route.handler instanceof Function
						? route.handler
						: null;

		if ( route.handler === null )
		{
			throw new Error( 'Invalid middleware added!!' );
		}

		this.middleware.push( route );
	}

	/**
	 * @brief	This will process the request and return the appropriate block chain
	 *
	 * @param	RequestEvent event
	 *
	 * @return	Array
	 */
	getExecutionBlockForCurrentEvent( event )
	{
		if ( ! event instanceof RequestEvent )
		{
			throw new Error( 'Invalid Event provided' );
		}

		let block	= [];

		for ( let index in this.middleware )
		{
			let value				= this.middleware[index];
			if ( value.route === '' )
			{
				block.push( value.handler );
				continue;
			}

			let match	= Router.matchRoute( event.path, value.route );

			if ( match !== false )
			{
				if ( Router.matchMethod( event.method, value.method ) )
				{
					event.params	= Object.assign( event.params, match );
					block.push( value.handler );
				}
			}
		}

		return block;
	}

	/**
	 * @brief	Matches the requested method with the ones set in the event
	 * @param requestedMethod
	 * @param eventMethod
	 * @return {boolean}
	 */
	static matchMethod( requestedMethod, eventMethod )
	{
		return eventMethod === requestedMethod
				|| eventMethod === ''
				|| ( eventMethod.constructor === Array && ( eventMethod.indexOf( requestedMethod ) !== -1 || eventMethod.length === 0 ) )
	}

	/**
	 * @brief	Match the given route and returns any route parameters passed
	 *
	 * @param	String|RegExp requestedRoute
	 * @param	String eventPath
	 *
	 * @return	Object|Boolean
	 */
	static matchRoute( requestedRoute, eventPath )
	{
		if ( eventPath instanceof RegExp )
		{
			return eventPath.exec( requestedRoute ) !== null ? {} : false;
		}

		let routeRe		= /\/:([^:]+):/g;
		let matched		= false;
		let matchedKeys	= [];

		eventPath	= eventPath.replace( routeRe, function( matchedString, capturingGroupOne, offset, examinedString )
		{
			if ( arguments === null )
			{
				return '';
			}

			matched	= true;
			matchedKeys.push( capturingGroupOne );

			return '/(\\S+)';
		});

		if ( ! matched && typeof requestedRoute === 'string' )
		{
			return requestedRoute === eventPath ? {} : false;
		}

		if ( matched && typeof requestedRoute === 'string' )
		{
			eventPath			= eventPath.replace( new RegExp( '\/', 'g' ), '\\/');
			let matchPathKeys	= requestedRoute.match( eventPath );
			let match			= {};

			if ( matchPathKeys !== null )
			{
				matchPathKeys.shift();

				for ( let index in matchedKeys )
				{
					let key	= matchedKeys[index];
					match[key]	= matchPathKeys[index]
				}
			}

			return match !== null ? match : false;
		}

		return false;
	}
}

// Export the module
module.exports	= Router;
