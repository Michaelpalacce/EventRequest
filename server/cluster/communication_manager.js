'use strict';

// Dependencies
const cluster			= require( 'cluster' );
const Loggur			= require( './../logger/loggur' );
const { LOG_LEVELS }	= require( './../logger/components/log' );

/**
 * @brief	Communication manager to handle the messages send by the workers to the master
 */
class CommunicationManager
{
	constructor( options = {} )
	{
		this.options	= options;
		this.workers	= [];
	}

	/**
	 * @brief	Called when the worker exits
	 *
	 * @param	Worker worker
	 *
	 * @return	void
	 */
	handleExit( deadWorker )
	{
		Loggur.log({
			level	: LOG_LEVELS.warning,
			message	: `Worker ${deadWorker.id} exited with pid: ${deadWorker.process.pid}`
		});

		this.workers.forEach( ( worker, position ) => {
			if ( worker.id === deadWorker.id )
			{
				// Replace worker with new one
				let workerToRemove	= this.workers.splice( position, 1, cluster.fork() );
				workerToRemove		= null;
			}
		});

		deadWorker	= null;
	}

	/**
	 * @brief	Calls when the worker disconnects
	 *
	 * @param	Worker worker
	 *
	 * @return	void
	 */
	handleDisconnect( worker )
	{
		// DO nothing here
	}

	/**
	 * @brief	Called when the worker comes online
	 *
	 * @details	Start the server
	 *
	 * @param	String message
	 *
	 * @return	void
	 */
	handleOnline( worker )
	{
		worker.send( 'start' );
	}

	/**
	 * @brief	Handle the error thrown by a worker
	 *
	 * @param	Error message
	 *
	 * @return	void
	 */
	handleError( message )
	{
		// Do nothing
	}

	/**
	 * @brief	Handle the message sent by the worker
	 *
	 * @param	Worker worker
	 * @param	mixed message
	 *
	 * @return	void
	 */
	handleMessage( worker, message )
	{
		// Workers should not send messages to the master
	}

	/**
	 * @brief	Attach event listeners for the workers
	 *
	 * @param	Array workers
	 *
	 * @return	void
	 */
	attachListeners( workers )
	{
		this.workers	= workers;
		
		cluster.on( 'exit', ( worker, code, signal ) =>{
			this.handleExit( worker )
		});

		cluster.on( 'disconnect', ( worker ) => {
			this.handleDisconnect( worker );
		});

		cluster.on( 'online', ( worker ) => {
			this.handleOnline( worker );
		});

		cluster.on( 'error', ( workerError ) => {
			this.handleError( workerError );
		});

		cluster.on( 'message', ( worker, message ) => {
			this.handleMessage( worker, message );
		});
	}
}

module.exports	= CommunicationManager;
