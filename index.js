'use strict';

// Dependencies
const http					= require( 'http' );
const https					= require( 'https' );
const os					= require( 'os' );
const cluster				= require( 'cluster' );
const RequestEvent			= require( './server/event' );
const Router				= require( './server/router' );
const ErrorHandler			= require( './server/error_handler' );
const middlewaresContainer	= require( './server/middleware_container' );
const TemplatingEngine		= require( './server/middlewares/templating_engine' );
const SessionHandler		= require( './server/middlewares/session_handler' );
const BodyParserHandler		= require( './server/middlewares/body_parser_handler' );
const Cluster				= require( './server/cluster/cluster' );
const CommunicationManager	= require( './server/cluster/communication_manager' );
const Loggur				= require( './server/logger/loggur' );
const Logger				= require( './server/logger/components/logger' );
const { LOG_LEVELS }		= require( './server/logger/components/log' );

/**
 * @brief	Constants
 */
const CPU_NUM										= os.cpus().length;
const PROTOCOL_HTTP									= 'http';
const PROTOCOL_HTTPS								= 'https';
const OPTIONS_PARAM_PORT							= 'port';
const OPTIONS_PARAM_PORT_DEFAULT					= 3000;
const OPTIONS_PARAM_PROTOCOL						= 'protocol';
const OPTIONS_PARAM_PROTOCOL_DEFAULT				= PROTOCOL_HTTP;
const OPTIONS_PARAM_HTTPS							= 'httpsOptions';
const OPTIONS_PARAM_HTTPS_DEFAULT					= {};
const OPTIONS_PARAM_CLUSTERS						= 'clusters';
const OPTIONS_PARAM_CLUSTERS_DEFAULT				= CPU_NUM;
const OPTIONS_PARAM_COMMUNICATION_MANAGER			= 'communicationManager';
const OPTIONS_PARAM_COMMUNICATION_MANAGER_DEFAULT	= CommunicationManager;
const OPTIONS_PARAM_ERROR_HANDLER					= 'errorHandler';
const OPTIONS_PARAM_ERROR_HANDLER_DEFAULT			= ErrorHandler;

const POSSIBLE_PROTOCOL_OPTIONS						= {};
POSSIBLE_PROTOCOL_OPTIONS[PROTOCOL_HTTP]			= http;
POSSIBLE_PROTOCOL_OPTIONS[PROTOCOL_HTTPS]			= https;

/**
 * @brief	Server class responsible for receiving requests and sending responses
 */
class Server
{
	/**
	 * @brief	Passes options for server configuration
	 *
	 * @param	Object options
	 */
	constructor( options	= {} )
	{
		this.options	= options;
		this.sanitizeConfig();

		this.router		= new Router();
		this.cluster	= new Cluster( this );
	}

	/**
	 * @brief	Sets defaults for the server options
	 *
	 * @details	Accepted options:
	 * 			- protocol - String - The protocol to be used ( http || https ) -> Defaults to http
	 * 			- httpsOptions - Object - Options that will be given to the https webserver -> Defaults to {}
	 * 			- port - Number - The port to run the webserver/s on -> Defaults to 3000
	 * 			- clusters - Number - The amount of instances of the webserver to be started. Cannot be more than the
	 * 			machine's CPUs -> Defaults to the max amount of CPUs of the machine's
	 * 			- communicationManager - CommunicationManager - The communication manager to be used for the IPC communication
	 * 			between the master and the workers -> Defaults to base CommunicationManager
	 * 			- errorHandler - ErrorHandler - The error handler to be called when an error occurs inside of the EventRequest
	 * 			-> Defaults to base errorHandler
	 *
	 * @return	void
	 */
	sanitizeConfig()
	{
		let options											= this.options;

		let protocol										= options[OPTIONS_PARAM_PROTOCOL];
		this.options[OPTIONS_PARAM_PROTOCOL]				= typeof protocol === 'string'
															&& typeof POSSIBLE_PROTOCOL_OPTIONS[protocol] !== 'undefined'
															? protocol
															: OPTIONS_PARAM_PROTOCOL_DEFAULT;

		let httpsOptions									= this.options[OPTIONS_PARAM_HTTPS];
		this.options[OPTIONS_PARAM_HTTPS]					= typeof httpsOptions === 'object'
															? httpsOptions
															: OPTIONS_PARAM_HTTPS_DEFAULT;

		let port											= options[OPTIONS_PARAM_PORT];
		this.options[OPTIONS_PARAM_PORT]					= typeof port === 'number'
															? port
															: OPTIONS_PARAM_PORT_DEFAULT;

		let clusters										= options[OPTIONS_PARAM_CLUSTERS];
		this.options[OPTIONS_PARAM_CLUSTERS]				= typeof clusters === 'number' && clusters <= CPU_NUM
															? clusters
															: OPTIONS_PARAM_CLUSTERS_DEFAULT;

		let communicationManager							= options[OPTIONS_PARAM_COMMUNICATION_MANAGER];
		this.options[OPTIONS_PARAM_COMMUNICATION_MANAGER]	= typeof communicationManager === 'object'
															&& communicationManager instanceof CommunicationManager
															? communicationManager
															: new OPTIONS_PARAM_COMMUNICATION_MANAGER_DEFAULT();

		let errorHandler									= options[OPTIONS_PARAM_ERROR_HANDLER];
		this.options[OPTIONS_PARAM_ERROR_HANDLER]			= typeof errorHandler === 'object'
															&& errorHandler instanceof ErrorHandler
															? errorHandler
															: new OPTIONS_PARAM_ERROR_HANDLER_DEFAULT();
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
	resolve ( request, response )
	{
		return new RequestEvent( request, response );
	};

	/**
	 * @brief	Called when a request is received to the server
	 *
	 * @param	IncomingMessage req
	 * @param	ServerResponse res
	 *
	 * @return	void
	 */
	serverCallback( req, res )
	{
		let requestEvent			= this.resolve( req, res );
		requestEvent.errorHandler	= this.options[OPTIONS_PARAM_ERROR_HANDLER];

		req.on( 'close', ()=> {
			requestEvent.cleanUp();
			requestEvent	= null;
		});

		res.on( 'finish', () => {
			requestEvent.cleanUp();
			requestEvent	= null;
		});

		res.on( 'error', ( error ) => {
			requestEvent.next( error );
			requestEvent.cleanUp();
			requestEvent	= null;
		});

		try
		{
			let block	= this.router.getExecutionBlockForCurrentEvent( requestEvent );
			requestEvent.setBlock( block );
			requestEvent.next();
		}
		catch ( e )
		{
			requestEvent.next( e );
		}
	}

	/**
	 * @brief	Starts a new server
	 *
	 * @param	Function successCallback
	 * @param	Function errorCallback
	 *
	 * @return	Server
	 */
	setUpNewServer( successCallback, errorCallback )
	{
		// Create the server
		let protocol	= this.options[OPTIONS_PARAM_PROTOCOL];
		let server		= protocol === PROTOCOL_HTTPS
						? https.createServer( this.options[OPTIONS_PARAM_HTTPS], this.serverCallback.bind( this ) )
						: http.createServer( this.serverCallback.bind( this ) );

		server.listen( this.options[OPTIONS_PARAM_PORT], () => {
				Loggur.log({
					level	: LOG_LEVELS.warning,
					message	: `Server ${cluster.worker.id} successfully started and listening on port: ${this.options[OPTIONS_PARAM_PORT]}`
				});
				successCallback();
			}
		);

		// Add an error handler in case of an error.
		server.on( 'error', ( err )=>{
			Loggur.log({
				level	: LOG_LEVELS.error,
				message	: 'Could not start the server on port: ' + this.options[OPTIONS_PARAM_PORT]
			});
			Loggur.log({
				level	: LOG_LEVELS.error,
				message	: 'Error Returned was: ' + err.code
			});

			errorCallback( err );
		});

		return server;
	}

	/**
	 * @brief	Starts the server on a given port
	 *
	 * @param	Number port
	 *
	 * @return	void
	 */
	start ()
	{
		this.cluster.startCluster( this.options[OPTIONS_PARAM_CLUSTERS] );
	}
}

// Export the server module
module.exports	= {
	Server				: Server,
	Router				: Router,
	TemplatingEngine	: TemplatingEngine,
	SessionHandler		: SessionHandler,
	BodyParserHandler	: BodyParserHandler,
	ErrorHandler		: ErrorHandler,
	Logging				: {
		Loggur		: Loggur,
		Logger		: Logger,
		LOG_LEVELS	: LOG_LEVELS
	}
};


const MemoryDataServer	= require( './server/caching/data_stores/memory/memory_data_server' );

let memoryDataServer	= new MemoryDataServer();
memoryDataServer.setUp( {}, ( err, data ) => {
	memoryDataServer.createNamespace( 'test', {}, ( nextErr, data )=>{
		console.log( 'here' );
		console.log( nextErr );
		console.log( data );
	});
});

