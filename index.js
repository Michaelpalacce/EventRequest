'use strict';

// Dependencies
const http					= require( 'http' );
const middlewaresContainer	= require( './server/middleware_container' );
const Router				= require( './server/router' );
const RequestEvent			= require( './server/event' );
const TemplatingEngine		= require( './server/middlewares/templating_engine' );
const SessionHandler		= require( './server/middlewares/session_handler' );
const BodyParserHandler		= require( './server/middlewares/body_parser_handler' );
const Logger				= require( './server/middlewares/logger' );

/**
 * @brief	Server class responsible for receiving requests and sending responses
 */
class Index
{
	constructor()
	{
		this.server	= {};
		this.router	= new Router();
	}

	/**
	 * @brief	Function that adds a middleware to the block chain of the router
	 *
	 * @param	Object|Router route
	 *
	 * @returns	void
	 */
	add( route )
	{
		this.router.add( route );
	};

	/**
	 * @brief	Use a predefined middleware from middlewaresContainer
	 *
	 * @param	String name
	 * @param	Object options
	 *
	 * @return	void
	 */
	use( name, options )
	{
		if ( typeof name === 'string' && typeof middlewaresContainer[name] === 'function' )
		{
			this.add( middlewaresContainer[name]( options ) );
		}
	};

	/**
	 * @brief	Resolves the given request and response
	 *
	 * @details	Creates a RequestEvent used by the Server with helpful methods
	 *
	 * @return	RequestEvent
	 */
	static resolve ( request, response )
	{
		return new RequestEvent( request, response );
	};

	/**
	 * @brief	Starts the server on a given port
	 *
	 * @param	Number port
	 *
	 * @return	void
	 */
	start ( port )
	{
		// Create the server
		this.server			= http.createServer( ( req, res ) => {
			let requestEvent	= Index.resolve( req, res );

			res.on( 'finish', () => {
				requestEvent.cleanUp();
				requestEvent	= null;
			});

			res.on( 'error', ( error ) => {
				requestEvent.sendError( error );
				requestEvent.cleanUp();
				requestEvent	= null;
			});

			try
			{
				let block	= this.	router.getExecutionBlockForCurrentEvent( requestEvent );
				requestEvent.setBlock( block );
				requestEvent.next();
			}
			catch ( e )
			{
				requestEvent.sendError( e );
			}
		});

		this.server.listen( port, () =>
			{
				console.log( 'Server successfully started and listening on port', port );
			}
		);

		// Add an error handler in case of an error.
		this.server.on( 'error', ( err )=>{
			console.log( 'Could not start the server on port: ', port );
			console.log( 'Error Returned was: ', err.code );
		});
	}
}

// Export the server module
module.exports	= {
	Server					: Index,
	Router					: Router,
	TemplatingEngine		: TemplatingEngine,
	SessionHandler			: SessionHandler,
	BodyParserHandler		: BodyParserHandler,
	Logger					: Logger
};
