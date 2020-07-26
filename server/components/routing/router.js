'use strict';
// Dependencies
const EventRequest		= require( '../../event_request' );
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

		this.middleware				= [];
		this.globalMiddlewares		= {};

		this.cache					= {};
		this.cachingIsEnabled		= true;
		this.keyLimit				= 5000;
		this.lastClearCacheAttempt	= 0;

		this.setUpHttpMethodsToObject( this );
	}

	/**
	 * @brief	Enables or disables caching
	 *
	 * @param	{Boolean} [enable=true]
	 *
	 * @return	void
	 */
	enableCaching( enable = true )
	{
		this.cachingIsEnabled	= enable;
	}

	/**
	 * @brief	Sets the caching key limit
	 *
	 * @param	{Number} [keyLimit=5000]
	 *
	 * @return	void
	 */
	setKeyLimit( keyLimit = 5000 )
	{
		this.keyLimit	= keyLimit;
	}

	/**
	 * @brief	Defines a middleware to be used globally
	 *
	 * @param	{String} middlewareName
	 * @param	{Function} middleware
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
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.setUpHttpMethodsToObject( server );

		/**
		 * @brief	Function that adds a middleware to the block chain of the router
		 *
		 * @returns	Server
		 */
		server.add	= ( ...args ) => {
			this.add.apply( this, args );

			return server;
		};
	}

	/**
	 * @brief	Adds .post, .put, .get, .delete methods to the object
	 *
	 * @details	If route is a function then the handler will be treated as middlewares
	 *
	 * @return	void
	 */
	setUpHttpMethodsToObject( object )
	{
		const methods	= ['POST', 'PUT', 'GET', 'DELETE', 'HEAD', 'PATCH', 'COPY'];

		const isGlobalMiddleware	= ( argument ) => {
			return typeof argument === 'function' || typeof argument === 'string' || Array.isArray( argument );
		};

		methods.forEach(( method ) => {
			object[method.toLocaleLowerCase()]	= ( ...args ) => {
				const firstArgument	= args[0];
				let route			= null;
				let handler			= null;
				let middlewares		= null;

				switch ( true )
				{
					case typeof firstArgument === 'function':
						route		= '';
						handler		= firstArgument;
						middlewares	= [];
						break;

					case ( typeof firstArgument === 'string' || firstArgument instanceof RegExp ) && isGlobalMiddleware( args[1] ) && typeof args[2] === 'function':
						route		= firstArgument;
						handler		= args[2];
						middlewares	= args[1];
						break;

					case ( typeof firstArgument === 'string' || firstArgument instanceof RegExp ) && typeof args[1] === 'function':
						route		= firstArgument;
						handler		= args[1];
						middlewares	= [];
						break;

					case isGlobalMiddleware( firstArgument ) && typeof args[1] === 'function':
						route		= '';
						handler		= args[1];
						middlewares	= firstArgument;
						break;

					default:
						throw new Error( 'Trying to add an invalid middleware' );
				}

				this.add({
					method,
					route,
					handler,
					middlewares
				});

				return object;
			};
		});
	}

	/**
	 * @brief	Function that adds a middleware to the block chain of the router
	 *
	 * @details	Accepts an object with 4 arguments:
	 * 			- handler - Function - Handler to be called - ! REQUIRED
	 * 			- method - String|Array - The methods(s) to be matched for the route - optional
	 * 			- route - String|RegExp - The route to match - optional
	 * 			- middlewares - Array|String - Handler to be called - ! optional
	 * 			( { method: '', route: '', handler:() => {}, middlewares: '' } )
	 *
	 * 			Accepts an instance of router ( Router router )
	 *
	 * 			Accepts a route and an instance of a router ( String route, Router router )
	 *
	 * @returns	Router
	 */
	add( ...args )
	{
		if ( args.length === 1 )
		{
			let first	= args[0];

			if ( first instanceof Router )
			{
				this.middleware			= this.middleware.concat( first.middleware );
				const routerMiddlewares	= first.globalMiddlewares;

				for ( const [key, value] of Object.entries( routerMiddlewares ) )
					this.define( key, value );

				return this;
			}

			if ( typeof first === 'function' )
				first	= new Route( { handler: first } );

			if ( ! ( first instanceof Route ) )
				first	= new Route( first );

			this.middleware.push( first );
		}
		else if ( args.length === 2 )
		{
			let first	= args[0];
			let second	= args[1];

			if ( typeof first === 'string' && second instanceof Router )
			{
				const secondMiddleware	= second.middleware;

				for ( const middleware of secondMiddleware )
				{
					if ( middleware.route === '/' )
						middleware.route	= '';

					if ( middleware.route instanceof RegExp )
					{
						let regex	= middleware.route.source;

						if ( regex.startsWith( '^' ) )
							regex	= regex.substring( 1 );

						middleware.route	= new RegExp( `${first}${regex}`, middleware.route.flags );
						continue;
					}

					middleware.route	= first + middleware.route;
				}

				this.middleware			= this.middleware.concat( secondMiddleware );
				const routerMiddlewares	= second.globalMiddlewares;

				for ( const [key, value] of Object.entries( routerMiddlewares ) )
					this.define( key, value );
			}
			else
			{
				throw new Error( 'Invalid middleware added!' );
			}
		}
		else
		{
			throw new Error( 'Invalid middleware added!' );
		}

		return this;
	}

	/**
	 * @brief	This will process the request and return the appropriate block chain
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	Array
	 */
	getExecutionBlockForCurrentEvent( event )
	{
		if ( ! ( event instanceof EventRequest ) )
			throw new Error( 'Invalid EventRequest provided' );

		const blockKey	= `${event.path}${event.method}`;
		const block		= [];

		if ( this.cachingIsEnabled )
		{
			this._clearCache();

			if ( typeof this.cache[blockKey] === 'object' )
			{
				event.params				= Object.assign( event.params, this.cache[blockKey].params );
				this.cache[blockKey].date	= Date.now();

				return this.cache[blockKey].block.slice();
			}
		}

		for ( let index in this.middleware )
		{
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( this.middleware, index ) )
				continue;

			let route	= this.middleware[index];
			let params	= {};

			if ( Router.matchMethod( event.method, route ) )
			{
				if ( Router.matchRoute( event.path, route, params ) )
				{
					event.params	= Object.assign( event.params, params );

					for ( const middleware of route.getMiddlewares() )
					{
						switch ( true )
						{
							case typeof middleware === 'string':
								if ( typeof this.globalMiddlewares[middleware] !== 'function' )
									throw new Error( `Could not find middleware ${middleware}` );

								block.push( this.globalMiddlewares[middleware] );
								break;

							case typeof middleware === 'function':
								block.push( middleware );
								break;

							default:
								throw new Error( `Could not find middleware ${middleware}` );
						}
					}

					block.push( route.getHandler() );
				}
			}
		}

		if ( this.cachingIsEnabled && ! this._isCacheFull() )
		{
			let params				= {};
			params					= Object.assign( params, event.params );
			const date				= Date.now();

			this.cache[blockKey]	= { block: block.slice(), params, date };
		}

		return block;
	}

	/**
	 * @brief	Exported for local instances
	 *
	 * @return	Boolean
	 */
	matchMethod()
	{
		return Router.matchMethod.apply( Router, arguments );
	}

	/**
	 * @brief	Exported for local instances
	 *
	 * @return	Boolean
	 */
	matchRoute()
	{
		return Router.matchRoute.apply( Router, arguments );
	}

	/**
	 * @brief	Matches the requested method with the ones set in the event and returns if there was a match or no
	 *
	 * @details	If a string or an array is passed, then it will be converted to a Route
	 *
	 * @param	{String} requestedMethod
	 * @param	{Route|Array|String} method
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
			return false;

		return route.matchMethod( requestedMethod );
	}

	/**
	 * @brief	Match the given route and returns any route parameters passed in the matchedParams argument.
	 *
	 * @details	Returns bool if there was a successful match
	 *
	 * @param	{String} requestedRoute
	 * @param	{String|RegExp|Route} route
	 * @param	{Object} [matchedParams={}]
	 *
	 * @return	Boolean
	 */
	static matchRoute( requestedRoute, route, matchedParams = {} )
	{
		if ( typeof route === 'string' || route instanceof RegExp )
		{
			route	= new Route( { route } );
		}

		if ( ! ( route instanceof Route ) )
			return false;

		return route.matchPath( requestedRoute, matchedParams );
	}

	/**
	 * @brief	Attempts to keep the cache in check by clearing keys that are not in use
	 *
	 * @param	{Number} [ttl=3600000]
	 * @param	{Number} [lastClearCacheAttemptTtl=60000]
	 *
	 * @private
	 *
	 * @return	void
	 */
	_clearCache( ttl = 60 * 60 * 1000, lastClearCacheAttemptTtl = 60 * 1000 )
	{
		if ( this.lastClearCacheAttempt + lastClearCacheAttemptTtl > Date.now() )
			return;

		this.lastClearCacheAttempt	= Date.now();

		if ( this._isCacheFull() )
		{
			for ( const key in this.cache )
			{
				/* istanbul ignore next */
				if ( ! {}.hasOwnProperty.call( this.cache, key ) )
					continue;

				const data	= this.cache[key];

				if ( ( data.date + ttl ) <= Date.now() )
					delete this.cache[key];
			}
		}
	}

	/**
	 * @brief	Returns if the cache is full
	 *
	 * @details	If the keyLimit is set to 0 then the cache will have an unlimited size
	 *
	 * @private
	 *
	 * @return	Boolean
	 */
	_isCacheFull()
	{
		if ( this.keyLimit === 0 )
			return false;

		return Object.keys( this.cache ).length > this.keyLimit;
	}
}

// Export the module
module.exports	= Router;
