'use strict';

/**
 * @brief	Error handler responsible for handling errors thrown by the EventRequest
 */
class ErrorHandler
{
	constructor()
	{
		this.defaultCase	= { callback: this._defaultCase.bind( this ), status: 500, code: ErrorHandler.GENERAL_ERROR_CODE };
		this.cases			= new Map();
	}

	/**
	 * @brief	Handles an error
	 *
	 * @param	{EventRequest} event
	 * @param	{*} errorToHandle
	 * @param	{Number} errStatusCode
	 * @param	{Boolean} emitError
	 *
	 * @return	void
	 */
	handleError( event, errorToHandle = null, errStatusCode = 500, emitError = true )
	{
		let errorCase	= null;
		let code;
		let error;
		let message;
		let status;
		let headers;
		let emit;

		if ( typeof errorToHandle === 'object' && typeof errorToHandle.code === 'string' )
		{
			code	= errorToHandle.code;
			error	= errorToHandle.error || null;
			message	= errorToHandle.message || errorToHandle.error || null;
			status	= errorToHandle.status || errStatusCode;
			headers	= errorToHandle.headers || {};
			emit	= errorToHandle.emit || emitError;
		}
		else
		{
			code	= ErrorHandler.GENERAL_ERROR_CODE;
			error	= errorToHandle;
			status	= errStatusCode;
			headers	= {};
			emit	= emitError;

			if ( errorToHandle instanceof Error )
			{
				errorCase	= this.getCase( errorToHandle.message );

				if ( errorCase !== null )
					code	= errorToHandle.message;
				else
					message	= errorToHandle.message;
			}
			else if ( typeof errorToHandle === 'string' )
			{
				errorCase	= this.getCase( errorToHandle );

				if ( errorCase !== null )
					code	= errorToHandle;
				else
					message	= errorToHandle;
			}
			else
			{
				message	= errorToHandle;
			}
		}

		if ( errorCase === null )
			errorCase	= this.getCase( code ) || this.defaultCase;

		const callback	= errorCase.callback;

		message			= this._formatError( message || errorCase.error )
		status			= status || errorCase.status;

		const toEmit	= { code, status };

		if ( message !== null && message !== undefined )
			toEmit.message	= message;

		if ( error !== null && error !== undefined )
			toEmit.error	= error;

		if ( emit )
			event.emit( 'on_error', toEmit );

		callback( { event, code, status, message, error, headers } );
	}

	/**
	 * @brief	Adds a new expectation for a specific errorCode
	 *
	 * @details	In case the errorCode is thrown somewhere then the
	 *
	 * @param	{String} errorCode
	 * @param	{*} error
	 * @param	{Function} callback
	 * @param	{Number} status
	 *
	 * @return	void
	 */
	addCase( errorCode, { error, callback, status } )
	{
		if ( ! this.validateErrorCode( errorCode ) )
			return;

		if ( typeof callback !== 'function' )
			callback	= this.defaultCase.callback;
		if ( typeof error !== 'string' )
			error	= this.defaultCase.error;
		if ( typeof status !== 'number' )
			status	= this.defaultCase.status;

		this.cases.set( errorCode, { error, callback, status, code: errorCode } );
	}

	/**
	 * @brief	Validates that the provided errorCode is a string and does not have any white space characters
	 *
	 * @param	{String} errorCode
	 *
	 * @return	{Boolean}
	 */
	validateErrorCode( errorCode )
	{
		return typeof errorCode === 'string' && errorCode.match( /\s/g ) === null;
	}

	/**
	 * @brief	Returns the expectation that contains the errorCode and message
	 *
	 * @param	{String} errorCode
	 *
	 * @return	{Object|null}
	 */
	getCase( errorCode )
	{
		if ( ! this.validateErrorCode( errorCode ) )
			return null;

		while ( true )
		{
			if ( this.cases.has( errorCode ) )
				return this.cases.get( errorCode );

			const parts	= errorCode.split( '.' );
			parts.pop();

			if ( parts.length === 0 )
				return this.defaultCase;

			errorCode	= parts.join( '.' );
		}
	}

	/**
	 * @brief	Fallback case that will be called whenever there is no case for the given error code OR the case match does not have a callback
	 *
	 * @details	This callback will set any headers provided
	 * 			This callback will set the status code given
	 * 			This callback will format an appropriate message in case of an error
	 *
	 * @param	{EventRequest} event
	 * @param	{String} errorCode
	 * @param	{Number} status
	 * @param	{*} error
	 * @param	{*} message
	 * @param	{Object} headers
	 *
	 * @private
	 *
	 * @return	void
	 */
	_defaultCase( { event, code, status, error, message, headers } )
	{
		if ( event.isFinished() )
			return;

		const response		= { error: { code } };

		if ( message !== null && message !== undefined )
			response.error.message	= message;

		for ( const key in headers )
		{
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( headers, key ) )
				continue;

			event.setResponseHeader( key, headers[key] );
		}

		event.send( response, status );
	}

	/**
	 * @brief	Formats the error in a presentable format
	 *
	 * @param	{*} error
	 *
	 * @return	Object
	 */
	_formatError( error )
	{
		if ( error instanceof Error )
			error	= error.message;

		return error;
	}
}

ErrorHandler.GENERAL_ERROR_CODE	= 'app.general';

module.exports					= ErrorHandler;
