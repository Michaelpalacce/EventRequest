'use strict';

// Dependencies
const http							= require( 'http' );
const https							= require( 'https' );
const os							= require( 'os' );
const cluster						= require( 'cluster' );
const middlewaresContainer			= require( './server/middleware_container' );
const Router						= require( './server/router' );
const TemplatingEngine				= require( './server/middlewares/templating_engine' );
const SessionHandler				= require( './server/middlewares/session_handler' );
const BodyParserHandler				= require( './server/middlewares/body_parser_handler' );
const Cluster						= require( './server/cluster/cluster' );
const CommunicationManager			= require( './server/cluster/communication_manager' );

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
															: OPTIONS_PARAM_COMMUNICATION_MANAGER_DEFAULT;
		
		this.options[OPTIONS_PARAM_COMMUNICATION_MANAGER]	= this.options[OPTIONS_PARAM_COMMUNICATION_MANAGER].getInstance();
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
	 * @brief	Starts a new server
	 *
	 * @param	Function serverCallback
	 * @param	Function successCallback
	 * @param	Function errorCallback
	 *
	 * @return	Server
	 */
	setUpNewServer( serverCallback, successCallback, errorCallback )
	{
		// Create the server
		let protocol	= this.options[OPTIONS_PARAM_PROTOCOL];
		let server		= protocol === PROTOCOL_HTTPS
						? https.createServer( this.options[OPTIONS_PARAM_HTTPS], serverCallback )
						: http.createServer( serverCallback );

		server.listen( this.options[OPTIONS_PARAM_PORT], () => {
				console.log( `Server ${cluster.worker.id} successfully started and listening on port: ${this.options[OPTIONS_PARAM_PORT]}` );
				successCallback();
			}
		);

		// Add an error handler in case of an error.
		server.on( 'error', ( err )=>{
			console.log( 'Could not start the server on port: ', this.options[OPTIONS_PARAM_PORT] );
			console.log( 'Error Returned was: ', err.code );
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
	Server					: Server,
	Router					: Router,
	TemplatingEngine		: TemplatingEngine,
	SessionHandler			: SessionHandler,
	BodyParserHandler		: BodyParserHandler
};
