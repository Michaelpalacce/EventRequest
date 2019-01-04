'use strict';

/**
 * @brief	Error handler responsible for handling errors thrown by the EventRequest
 */
class ErrorHandler
{
	/**
	 * @brief	Formats the error in a presentable format
	 *
	 * @param	mixed error
	 *
	 * @return	String
	 */
	formatError( error )
	{
		if ( typeof error === 'string' )
		{
			error	= { 'error' : error };
		}

		if ( typeof message === 'object' )
		{
			error	= JSON.stringify( error );
		}

		return error;
	}
	/**
	 * @brief	Handle the error
	 *
	 * @param	EventRequest event
	 * @param	mixed error
	 * @param	Number code
	 *
	 * @return	void
	 */
	handleError( event, error, code )
	{
		let errorToSend	= error;
		let errorToEmit	= error;

		if ( error instanceof Error )
		{
			errorToEmit	= error.stack;
			errorToSend	= error.message;
		}

		event.emit( 'error', errorToEmit );

		errorToSend	= this.formatError( errorToSend );

		if ( ! event.isFinished() )
		{
			event.send( errorToSend, code );
		}
	}
}

module.exports	= ErrorHandler;
