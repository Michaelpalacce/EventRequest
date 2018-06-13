'use strict';

/**
 * @brief	Communication manager to handle the messages send by the workers to the master
 */
class CommunicationManager
{
	constructor( options = {} )
	{
		this.options	= options;
	}
	
	handleError( message, callback )
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
	handleMessage( worker, message, callback )
	{
	}
}

module.exports	= CommunicationManager;