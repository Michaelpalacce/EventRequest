'use strict';

// Dependencies
const Loggur				= require( './components/logger/loggur' );
const { LOG_LEVELS }		= require( './components/logger/components/log' );

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
			throw new Error( 'Invalid middleware added!!' );
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
			throw new Error( 'Invalid middleware added!!' );
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
	 * @brief	Matches this route with the requested path
	 *
	 * @return	void
	 */
	match()
	{
	}
}

module.exports	= Route;