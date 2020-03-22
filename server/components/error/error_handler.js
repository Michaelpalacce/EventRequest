'use strict';

/**
 * @brief	Error handler responsible for handling errors thrown by the EventRequest
 */
class ErrorHandler
{
	/**
	 * @brief	Handle the error
	 *
	 * @param	EventRequest event
	 * @param	mixed error
	 * @param	Number code
	 *
	 * @return	void
	 */
	handleError( event, error, code = 500 )
	{
		event.emit( 'on_error', this._getErrorToEmit( error ) );

		this._sendError( event, this._formatError( error ), code );
	}

	/**
	 * @brief	Gets the error to be emitted
	 *
	 * @param	error Error
	 *
	 * @return	mixed
	 */
	_getErrorToEmit( error )
	{
		if ( error instanceof Error )
		{
			error	= error.stack;
		}

		return error;
	}

	/**
	 * @brief	Formats the error in a presentable format
	 *
	 * @param	error Error
	 *
	 * @return	Object
	 */
	_formatError( error )
	{
		if ( error instanceof Error )
		{
			error	= error.message;
		}

		return { error };
	}

	/**
	 * @brief	Sends the error
	 *
	 * @param	event EventRequest
	 * @param	error mixed
	 * @param	code Number
	 *
	 * @return	void
	 */
	_sendError( event, error, code )
	{
		if ( ! event.isFinished() )
		{
			event.send( error, code );
		}
	}
}

module.exports	= ErrorHandler;
