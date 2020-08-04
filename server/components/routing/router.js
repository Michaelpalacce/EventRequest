'use strict';
// Dependencies
const Route				= require( './route' );
const PluginInterface	= require( './../../plugins/plugin_interface' );
const RouterCache		= require( './router_cache' );

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

		this.cachingIsEnabled	= true;
		this.cache				= new RouterCache();

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
	 * @return	void
	 */
	setKeyLimit( ...args )
	{
		this.cache.setKeyLimit.apply( this.cache, args );
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
			throw new Error( 'app.er.routing.cannotDefineMiddleware' );
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
						throw new Error( 'app.er.routing.invalidMiddlewareAdded' );
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
		let first	= args[0];
		let second	= args[1];

		switch ( args.length )
		{
			case 1:
				if ( first instanceof Router )
					return this._concat( first );

				if ( typeof first === 'function' )
					first	= new Route( { handler: first } );

				if ( ! ( first instanceof Route ) )
					first	= new Route( first );

				this.middleware.push( first );

				return this;

			case 2:
				if ( typeof first === 'string' && second instanceof Router )
					return this._concat( second, first );

			default:
				throw new Error( 'app.er.routing.invalidMiddlewareAdded' );
		}
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
		const blockKey	= `${event.path}${event.method}`;
		const block		= [];

		if ( this.cachingIsEnabled )
		{
			const blockData	= this.cache.getBlock( blockKey );

			if ( blockData !== null )
			{
				event.params	= Object.assign( event.params, blockData.params );

				return blockData.block.slice();
			}
		}

		for ( const route of this.middleware )
		{
			let params	= {};

			if ( Router.matchMethod( event.method, route ) && Router.matchRoute( event.path, route, params ) )
			{
				event.params	= Object.assign( event.params, params );

				// This will only push if there are any middlewares returned
				block.push.apply( block, this._getGlobalMiddlewaresForRoute( route ) );
				block.push( route.getHandler() );
			}
		}

		if ( this.cachingIsEnabled && ! this.cache.isFull() )
		{
			const params	= Object.assign( {}, event.params );

			this.cache.setBlock( blockKey, { block: block.slice(), params } );
		}

		return block;
	}

	/**
	 * @brief	Gets all the global middlewares for the given route
	 *
	 * @param	{Route} route
	 *
	 * @private
	 *
	 * @return	Array
	 */
	_getGlobalMiddlewaresForRoute( route )
	{
		const middlewares	= [];
		for ( const middleware of route.getMiddlewares() )
		{
			switch ( true )
			{
				case typeof middleware === 'string':
					if ( typeof this.globalMiddlewares[middleware] !== 'function' )
						throw { code: 'app.er.routing.missingMiddleware', message: middleware };

					middlewares.push( this.globalMiddlewares[middleware] );
					break;

				case typeof middleware === 'function':
					middlewares.push( middleware );
					break;

				default:
					throw { code: 'app.er.routing.missingMiddleware', message: middleware };
			}
		}

		return middlewares;
	}

	/**
	 *
	 * @brief	Concatenates two routers together
	 *
	 * @details	If a path is passed, then that path will be used to prefix all the middlewares
	 *
	 * @param	{Router} router
	 * @param	{String} path
	 *
	 * @private
	 *
	 * @return	Router
	 */
	_concat( router, path = null )
	{
		if ( path !== null )
		{
			for ( const middleware of router.middleware )
			{
				if ( middleware.route === '/' )
					middleware.route	= '';

				if ( middleware.route instanceof RegExp )
				{
					let regex	= middleware.route.source;

					if ( regex.startsWith( '^' ) )
						regex	= regex.substring( 1 );

					middleware.route	= new RegExp( `${path}${regex}`, middleware.route.flags );
					continue;
				}

				middleware.route	= path + middleware.route;
			}
		}

		this.middleware	= this.middleware.concat( router.middleware );

		for ( const [key, value] of Object.entries( router.globalMiddlewares ) )
			this.define( key, value );

		return this;
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
}

// Export the module
module.exports	= Router;
