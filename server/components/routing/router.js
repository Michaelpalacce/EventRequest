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
	 * @param	middlewareName String
	 * @param	middleware Function
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
	 * @param	server Server
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
		server.add	= ( ...args )=>{
			server.emit( 'addRoute', args );
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

		methods.forEach(( method )=>{
			object[method.toLocaleLowerCase()]	= ( ...args )=>{
				const firstArgument	= args[0];
				let route			= null;
				let handler			= null;
				let middlewares		= null;

				switch ( true )
				{
					case typeof firstArgument === 'function':
						route		= '';
						handler		= firstArgument;
						middlewares	= typeof args[1] === 'undefined' ? [] : args[1];
						break;

					case ( typeof firstArgument === 'string' || firstArgument instanceof RegExp ) && typeof args[1] === 'function':
						route		= firstArgument;
						handler		= typeof args[1] === 'function' ? args[1] : null;
						middlewares	= args[2];
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
			}
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
	 * 			( { method: '', route: '', handler:()=>{}, middlewares: '' } )
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
				{
					this.define( key, value );
				}

				return this;
			}

			if ( typeof first === 'function' )
			{
				first	= new Route( { handler: first } );
			}

			if ( ! ( first instanceof Route ) )
			{
				first	= new Route( first );
			}

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
					{
						middleware.route	= '';
					}

					if ( middleware.route instanceof RegExp )
					{
						let regex	= middleware.route.source;

						if ( regex.startsWith( '^' ) )
						{
							regex	= regex.substring( 1 );
						}

						middleware.route	= new RegExp( `${first}${regex}`, middleware.route.flags );
						continue;
					}

					middleware.route	= first + middleware.route;
				}

				this.middleware			= this.middleware.concat( secondMiddleware );
				const routerMiddlewares	= second.globalMiddlewares;
				for ( const [key, value] of Object.entries( routerMiddlewares ) )
				{
					this.define( key, value );
				}
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
	 * @param	event EventRequest
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
			let route	= this.middleware[index];
			let params	= [];

			if ( Router.matchMethod( event.method, route ) )
			{
				if ( Router.matchRoute( event.path, route, params ) )
				{
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
	 * @param	requestedMethod String
	 * @param	method Route|Array|String
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
	 * @param	requestedRoute String
	 * @param	route String|RegExp|Route
	 * @param	matchedParams Array
	 *
	 * @return	Boolean
	 */
	static matchRoute( requestedRoute, route, matchedParams = {} )
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
