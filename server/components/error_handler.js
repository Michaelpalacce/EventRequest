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
	 * @param	RequestEvent event
	 * @param	mixed error
	 * @param	Number code
	 *
	 * @return	void
	 */
	handleError( event, error, code )
	{
		if ( error instanceof Error )
		{
			error	= error.stack;
		}

		event.emit( 'error', error );

		error	= this.formatError( error );

		if ( ! event.isFinished() )
		{
			event.send( error, code );
		}
	}
}

module.exports	= ErrorHandler;
