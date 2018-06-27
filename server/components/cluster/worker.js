'use strict';

// Dependencies
const cluster	= require( 'cluster' );

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
	 * @param	Server server
	 */
	constructor( server )
	{
		this.server				= server;
		this.httpServer			= null;

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
				process.exit( 1 );
				break;
			default:
				break;
		}
	}

	/**
	 * @brief	Called when the server is successfully created
	 *
	 * @return	void
	 */
	successCallback()
	{
		// Do nothing
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
	 * @brief	Starts the worker and together with it the web server
	 *
	 * @return	void
	 */
	start()
	{
		if ( this.httpServer === null )
		{
			this.httpServer	= this.server.setUpNewServer(
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
		if ( this.httpServer !== null )
		{
			this.httpServer.close();
			this.httpServer	= null;
		}
	}
}

module.exports	= Worker;