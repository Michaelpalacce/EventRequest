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
	 * @details	If only one argument is provided then that is set as a global middleware and should always be called
	 * 			If two arguments are provided then the first is expected to be the path and the second callback
	 * 			If three are provided then the first one is path, second method and third one is callback
	 * 			If another router is found then the middleware from that router will be concatenated to th
	 * 			This method will throw an error if invalid parameters are provided
	 *
	 * @param	..args
	 *
	 * @returns	void
	 */
	add()
	{
		let route	= {};

		if ( arguments.length === 1 )
		{
			const callback	= arguments[0];

			if ( callback instanceof Router )
			{
				this.middleware	= this.middleware.concat( callback.middleware );
				return;
			}

			if ( typeof callback !== 'function' )
			{
				throw new Error( 'Invalid middleware added!!' );
			}

			route	= {
				callback	: callback,
				method		: '',
				path		: ''
			};
		}
		else if( arguments.length === 2 )
		{
			const path		= arguments[0];
			const callback	= arguments[1];

			if (
				typeof callback !== 'function'
				|| ( typeof path !== 'string' && ! path instanceof RegExp )
		 	) {
				throw new Error( 'Invalid middleware added!!' );
			}

			route	= {
				callback	: callback,
				method		: '',
				path		: path
			};
		}
		else if( arguments.length === 3 )
		{
			const path		= arguments[0];
			const method	= arguments[1].toUpperCase();
			const callback	= arguments[2];

			if ( typeof callback !== 'function' || typeof path !== 'string' || typeof method !== 'string' )
			{
				throw new Error( 'Invalid middleware added!!' );
			}

			route	= {
				callback	: callback,
				method		: method,
				path		: path
			};
		}
		else
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
			if ( value.path === '' )
			{
				block.push( value.callback );
				continue;
			}

			let match	= Router.matchRoute( event.path, value.path );

			if ( match !== false )
			{
				if ( Router.matchMethod( event.method, value.method ) )
				{
					event.params	= Object.assign( event.params, match );
					block.push( value.callback );
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
