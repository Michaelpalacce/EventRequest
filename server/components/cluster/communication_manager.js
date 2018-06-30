'use strict';

// Dependencies
const cluster					= require( 'cluster' );
const { Loggur, LOG_LEVELS }	= require( '../logger/loggur' );

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
	exitAllWorkers()
	{
		this.workers.forEach( ( worker, position ) => {
			worker.send( 'die' );
		});
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

		this.replaceWorker( deadWorker, cluster.fork() );

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
	 * @param	Worker worker
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
			// One is the process willingly dying
			if ( code !== 1)
			{
				this.handleExit( worker )
			}
			else
			{
				this.replaceWorker( worker, false );
			}
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

	/**
	 * @brief	Replaces the worker with another
	 *
	 * @param	Worker workerToReplace
	 * @param	mixedreplaceWith
	 *
	 * @return	void
	 */
	replaceWorker( workerToReplace, replaceWith )
	{
		this.workers.forEach( ( worker, position ) => {
			if ( worker.id === workerToReplace.id )
			{
				if ( replaceWith !== false )
				{
					this.workers.splice( position, 1, replaceWith );
				}
				else
				{
					this.workers.splice( position, 1 );
				}
			}
		});
	}
}

module.exports	= CommunicationManager;
