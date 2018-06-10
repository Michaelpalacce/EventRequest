'use strict';

/**
 * @brief	Message manager to handle the messages send by the workers to the master
 */
class MessageManager
{
	constructor()
	{
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
		console.log( worker.id );
		console.log( message );
	}
}

module.exports	= MessageManager;