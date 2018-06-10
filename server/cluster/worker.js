'use strict';

// Dependencies
const RequestEvent	= require( './../event' );
const cluster		= require( 'cluster' );

/**
 * @brief	Constants
 */
const MASTER_COMMAND_STOP		= 'stop';
const MASTER_COMMAND_START		= 'start';
const MASTER_COMMAND_RESTART	= 'restart';
const MASTER_COMMAND_DIE		= 'die';

/**
 * @brief	Worker class spawned by the cluster to server as a web server
 */
class Worker
{
	/**
	 * @param	Router router
	 * @param	Function newServerCallback
	 */
	constructor( router, newServerCallback )
	{
		this.router				= router;
		this.newServerCallback	= newServerCallback;
		this.server				= null;

		this.setIPC();
	}

	/**
	 * @brief	Start IPC
	 *
	 * @details	This will let the worker listen in for any instructions from the master process
	 *
	 * @return	void
	 */
	setIPC()
	{
		cluster.worker.on( 'message', ( message )=>{
			this.masterCommand( message );
		});
	}

	/**
	 * @brief	Process a command from the master
	 *
	 * @param	String cmd
	 *
	 * @return	void
	 */
	masterCommand( cmd )
	{
		switch ( cmd )
		{
			case MASTER_COMMAND_STOP:
				this.stop();
				break;
			case MASTER_COMMAND_START:
				this.start();
				break;
			case MASTER_COMMAND_RESTART:
				this.stop();
				this.start();
				break;
			case MASTER_COMMAND_DIE:
				cluster.worker.kill();
				break;
			default:
				break;
		}
	}

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
	 * @brief	Called when teh server is successfully created
	 *
	 * @return	void
	 */
	successCallback()
	{
	}

	/**
	 * @brief	Called if there is an error with the server
	 *
	 * @param	Error err
	 *
	 * @return	void
	 */
	errorCallback( err )
	{
		this.stop();
	}

	/**
	 * @brief	Called when a request is received to the server
	 *
	 * @param	IncomingMessage req
	 * @param	ServerResponse res
	 *
	 * @return	void
	 */
	serverCallback( req, res ) {
		let requestEvent	= Worker.resolve( req, res );

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
			let block	= this.router.getExecutionBlockForCurrentEvent( requestEvent );
			requestEvent.setBlock( block );
			requestEvent.next();
		}
		catch ( e )
		{
			requestEvent.sendError( e );
		}
	}

	/**
	 * @brief	Starts the worker and together with it the web server
	 *
	 * @return	void
	 */
	start()
	{
		if ( this.server === null )
		{
			this.server	= this.newServerCallback(
				this.serverCallback.bind( this ),
				this.successCallback.bind( this ),
				this.errorCallback.bind( this )
			);
		}
	}

	/**
	 * @brief	Stops the worker
	 *
	 * @return	void
	 */
	stop()
	{
		if ( this.server !== null )
		{
			this.server.close();
			this.server	= null;
		}
	}
}

module.exports	= Worker;