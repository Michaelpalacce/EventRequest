'use strict';

// Dependencies
const { Loggur, LOG_LEVELS }	= require( '../logger/loggur' );

/**
 * @brief	Constants
 */
const DEFAULT_ROUTE_HANDLER	= ( event ) => {
	Loggur.log({
		level	: LOG_LEVELS.info,
		message	: 'Possible mishandling. This route does not have a handler specified.'
	});
	event.next()
};

/**
 * @brief	Defines a single route in the site
 */
class Route
{
	constructor( routeConfig )
	{
		this.handler	= null;
		this.route		= null;
		this.method		= null;
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
	 * @param	Object routeConfig
	 *
	 * @return	void
	 */
	sanitize( routeConfig )
	{
		if ( typeof routeConfig !== 'object' )
		{
			throw new Error( 'Invalid middleware added!' );
		}

		this.route		= typeof routeConfig.route === 'string' || routeConfig.route instanceof RegExp
						? routeConfig.route
						: '';

		this.method		= typeof routeConfig.method === 'string' || routeConfig.method instanceof Array
						? routeConfig.method
						: '';

		this.handler	= routeConfig.handler instanceof Function
						? routeConfig.handler
						: DEFAULT_ROUTE_HANDLER;

		if ( this.handler === null )
		{
			throw new Error( 'Invalid middleware added!' );
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
	 * @brief	Matches the requestedMethod with the route's one
	 *
	 * @param	String requestedMethod
	 *
	 * @return	Boolean
	 */
	matchMethod( requestedMethod )
	{
		return this.method === requestedMethod
				|| this.method === ''
				|| ( this.method.constructor === Array && ( this.method.indexOf( requestedMethod ) !== -1 || this.method.length === 0 ) );
	}

	/**
	 * @brief	Matches this route with the requested path
	 *
	 * @details	Returns an object with the matched parameters and whether the route actually matches
	 *
	 * @return	Object
	 */
	matchPath( requestedRoute )
	{
		let matchResult	= Route.getMatchObject();

		if ( requestedRoute === '' )
		{
			return matchResult;
		}

		if ( this.route === '' )
		{
			matchResult.matched	= true;
			return matchResult;
		}

		if ( this.route instanceof RegExp )
		{
			matchResult.matched	= this.route.test( requestedRoute );

			return matchResult;
		}

		let routeRe		= /\/:([^:]+):/g;
		let matched		= false;
		let matchedKeys	= [];

		let route		= this.route.replace( routeRe, ( matchedString, capturingGroupOne, offset, examinedString )=>{
			if ( arguments === null )
			{
				return '';
			}

			matched	= true;
			matchedKeys.push( capturingGroupOne );

			return '/([^\\/]*)$';
		});

		if ( ! matched && typeof requestedRoute === 'string' )
		{
			matchResult.matched	= requestedRoute === route;
			return matchResult;
		}

		if ( matched && typeof requestedRoute === 'string' )
		{
			route				= route.replace( new RegExp( '\/', 'g' ), '\\/');
			let matchPathKeys	= requestedRoute.match( route );
			let match			= {};

			if ( matchPathKeys !== null )
			{
				matchPathKeys.shift();

				for ( let index in matchedKeys )
				{
					let key	= matchedKeys[index];
					match[key]	= matchPathKeys[index]
				}

				matchResult.matched	= true;
				matchResult.params	= match;
			}
		}

		return matchResult;
	}
}

module.exports	= Route;
