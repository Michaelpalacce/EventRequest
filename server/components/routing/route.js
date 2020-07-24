'use strict';

// Dependencies
const { Loggur, LOG_LEVELS }	= require( '../logger/loggur' );

/**
 * @brief	Constants
 */
const DEFAULT_ROUTE_HANDLER	= ( event ) => {
	Loggur.log( 'Possible mishandling. This route does not have a handler specified.', LOG_LEVELS.info );

	event.next()
};

/**
 * @brief	Defines a single route in the site
 */
class Route
{
	constructor( routeConfig )
	{
		this.handler		= null;
		this.route			= null;
		this.method			= null;
		this.middlewares	= [];
		this.sanitize( routeConfig );
	}

	/**
	 * @brief	Returns an empty unmatched object to work with
	 *
	 * @return	Object
	 */
	static getMatchObject()
	{
		return {
			matched	: false,
			params	: {}
		}
	}

	/**
	 * @brief	Sets Route options
	 *
	 * @param	{Object} routeConfig
	 *
	 * @return	void
	 */
	sanitize( routeConfig )
	{
		if ( typeof routeConfig !== 'object' || routeConfig === null )
			throw new Error( 'Invalid middleware added!' );

		this.route			= typeof routeConfig.route === 'string' || routeConfig.route instanceof RegExp
							? routeConfig.route
							: '';

		this.method			= typeof routeConfig.method === 'string'
							? routeConfig.method.toUpperCase()
							: routeConfig.method instanceof Array
							? routeConfig.method.map( ( x ) => { return x.toUpperCase() } )
							: '';

		this.handler		= routeConfig.handler instanceof Function
							? routeConfig.handler
							: DEFAULT_ROUTE_HANDLER;

		this.middlewares	= this.parseGlobalMiddlewares( routeConfig );

		if ( this.handler === null )
		{
			throw new Error( 'Invalid middleware added!' );
		}
	}

	/**
	 * @brief	Parses the global middlewares passed
	 *
	 * @details	Accepts one of the following:
	 * 			Array ( of strings or of functions )
	 * 			String
	 * 			Function
	 *
	 * @param	{Object} routeConfig
	 *
	 * @return	*
	 */
	parseGlobalMiddlewares( routeConfig )
	{
		switch ( true )
		{
			case Array.isArray( routeConfig.middlewares ):
				return routeConfig.middlewares;

			case typeof routeConfig.middlewares === 'string':
				return [routeConfig.middlewares];

			case typeof routeConfig.middlewares === 'function':
				return [routeConfig.middlewares];

			default:
				return [];
		}
	}

	/**
	 * @brief	Returns the current route
	 *
	 * @return	String|RegExp
	 */
	getRoute()
	{
		return this.route;
	}

	/**
	 * @brief	Returns the current handler
	 *
	 * @return	Function
	 */
	getHandler()
	{
		return this.handler;
	}

	/**
	 * @brief	Returns the current method(s)
	 *
	 * @return	Array|String
	 */
	getMethod()
	{
		return this.method;
	}

	/**
	 * @brief	Returns the middlewares set for the current route
	 *
	 * @return	Array
	 */
	getMiddlewares()
	{
		return this.middlewares;
	}

	/**
	 * @brief	Matches the requestedMethod with the route's one
	 *
	 * @param	{String} requestedMethod
	 *
	 * @return	Boolean
	 */
	matchMethod( requestedMethod )
	{
		requestedMethod	= requestedMethod.toUpperCase();

		return this.method === requestedMethod
				|| this.method === ''
				|| ( Array.isArray( this.method ) && ( this.method.indexOf( requestedMethod ) !== -1 || this.method.length === 0 ) );
	}

	/**
	 * @brief	Matches this route with the requested path
	 *
	 * @details	Sets the matchedParams with any parameters found
	 *
	 * @param	{String} requestedRoute
	 * @param	{Object} [matchedParams={}]
	 *
	 * @return	Object
	 */
	matchPath( requestedRoute, matchedParams = {} )
	{
		if ( requestedRoute === '' )
			return false;

		if ( this.route === '' )
			return true;

		if ( requestedRoute === this.route )
			return true;

		if ( this.route instanceof RegExp )
		{
			const result	= requestedRoute.match( this.route );

			const matched	= result !== null;

			if ( matched )
				matchedParams.match	= result;

			return result !== null;
		}

		const routeRe				= /^:([^:]+):$/;
		const requestedRouteParts	= requestedRoute.split( '/' );
		const routeParts			= this.route.split( '/' );
		let hasWrongPart			= false;

		if ( requestedRouteParts.length === routeParts.length )
		{
			routeParts.forEach(( pathPart, index ) => {
				if ( hasWrongPart )
					return;

				const result	= pathPart.match( routeRe );
				if ( result !== null )
				{
					matchedParams[result[1]]	= requestedRouteParts[index];
				}
				else
				{
					if ( pathPart !== requestedRouteParts[index] )
						hasWrongPart	= true;
				}
			});

			return ! hasWrongPart;
		}

		return false;
	}
}

module.exports	= Route;
