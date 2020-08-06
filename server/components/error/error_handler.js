'use strict';

/**
 * @brief	Error handler responsible for handling errors thrown by the EventRequest
 */
class ErrorHandler
{
	constructor()
	{
		this.namespaces			= new Map();
		this.defaultNamespace	= {
			callback	: this._defaultCase.bind( this ),
			status		: 500,
			code		: ErrorHandler.GENERAL_ERROR_CODE,
			emit		: true,
			message		: undefined,
			headers		: undefined,
			formatter	: ( { code, message } ) => {
				const response	= { error: { code } };

				if ( message !== null && message !== undefined )
					response.error.message	= message;

				return response;
			}
		};
	}

	/**
	 * @brief	Handles an error
	 *
	 * @param	{EventRequest} event
	 * @param	{*} [errorToHandle=null]
	 * @param	{Number} [errStatusCode=null]
	 * @param	{Boolean} [emitError=null]
	 *
	 * @return	Promise: void
	 */
	async handleError( event, errorToHandle = null, errStatusCode = null, emitError = null )
	{
		let errorNamespace	= null;
		let code;
		let error;
		let message;
		let status;
		let headers;
		let emit;
		let formatter;

		if ( errorToHandle !== null && typeof errorToHandle === 'object' && typeof errorToHandle.code === 'string' )
		{
			code		= errorToHandle.code;
			error		= errorToHandle.error || null;
			message		= errorToHandle.message || errorToHandle.error || null;
			status		= errorToHandle.status || errStatusCode;
			headers		= errorToHandle.headers || null;
			formatter	= typeof errorToHandle.formatter === 'function' ? errorToHandle.formatter : null;
			emit		= typeof errorToHandle.emit === 'boolean' ? errorToHandle.emit : emitError;
		}
		else
		{
			code	= ErrorHandler.GENERAL_ERROR_CODE;
			error	= errorToHandle;
			status	= errStatusCode;
			headers	= null;
			emit	= emitError;

			if ( errorToHandle instanceof Error )
			{
				errorNamespace	= this.getNamespace( errorToHandle.message );

				if ( errorNamespace !== null )
					code	= errorToHandle.message;
				else
					message	= errorToHandle.message;
			}
			else if ( typeof errorToHandle === 'string' )
			{
				errorNamespace	= this.getNamespace( errorToHandle );

				if ( errorNamespace !== null )
					code	= errorToHandle;
				else
					message	= errorToHandle;
			}
			else
			{
				message	= errorToHandle;
			}
		}

		if ( errorNamespace === null )
			errorNamespace	= this.getNamespace( code ) || this.defaultNamespace;

		const callback	= errorNamespace.callback;

		message			= this._formatError( message || errorNamespace.message );
		status			= status || errorNamespace.status;
		emit			= typeof emit === 'boolean' ? emit : errorNamespace.emit;
		headers			= headers || errorNamespace.headers || {};
		formatter		= formatter || errorNamespace.formatter;

		await callback( { event, code, status, message, error, headers, emit, formatter } );
	}

	/**
	 * @brief	Adds a new namespace
	 *
	 * @param	{String} code
	 * @param	{*} message
	 * @param	{Function} callback
	 * @param	{Number} status
	 * @param	{Boolean} emit
	 * @param	{Object} headers
	 * @param	{Function} formatter
	 *
	 * @return	void
	 */
	addNamespace( code, { message, callback, status, emit, headers, formatter } = {} )
	{
		if ( ! this.validateNamespaceCode( code ) )
			return;

		if ( typeof callback !== 'function' )
			callback	= this.defaultNamespace.callback;
		if ( typeof message !== 'string' )
			message	= this.defaultNamespace.message;
		if ( typeof status !== 'number' )
			status	= this.defaultNamespace.status;
		if ( typeof emit !== 'boolean' )
			emit	= this.defaultNamespace.emit;
		if ( typeof headers !== 'object' )
			headers	= this.defaultNamespace.headers;
		if ( typeof formatter !== 'function' )
			formatter	= this.defaultNamespace.formatter;

		this.namespaces.set( code, { message, callback, status, emit, code, headers, formatter } );
	}

	/**
	 * @brief	Validates that the provided errorCode is a string and does not have any white space characters
	 *
	 * @param	{String} errorCode
	 *
	 * @return	{Boolean}
	 */
	validateNamespaceCode( errorCode )
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
	getNamespace( errorCode )
	{
		if ( ! this.validateNamespaceCode( errorCode ) )
			return null;

		while ( true )
		{
			if ( this.namespaces.has( errorCode ) )
				return this.namespaces.get( errorCode );

			const parts	= errorCode.split( '.' );
			parts.pop();

			if ( parts.length === 0 )
				return this.defaultNamespace;

			errorCode	= parts.join( '.' );
		}
	}

	/**
	 * @brief	Fallback namespace that will be called whenever there is no namespace for the given error code OR the namespace match does not have a callback
	 *
	 * @details	This callback will set any headers provided
	 * 			This callback will set the status code given
	 * 			This callback will format an appropriate message in case of an error
	 * 			This callback emit an error IF needed
	 *
	 * @param	{EventRequest} event
	 * @param	{String} errorCode
	 * @param	{Number} status
	 * @param	{*} error
	 * @param	{*} message
	 * @param	{Object} headers
	 * @param	{Boolean} emit
	 * @param	{Function} formatter
	 *
	 * @private
	 *
	 * @return	Promise: void
	 */
	async _defaultCase( { event, code, status, error, message, headers, emit, formatter } )
	{
		if ( event.isFinished() )
			return;

		const toEmit	= { code, status, headers };

		if ( message !== null && message !== undefined )
			toEmit.message	= message;

		if ( error !== null && error !== undefined )
			toEmit.error	= error;

		if ( emit )
			event.emit( 'on_error', toEmit );

		for ( const key in headers )
		{
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( headers, key ) )
				continue;

			event.setResponseHeader( key, headers[key] );
		}

		const result	= formatter( { event, code, status, error, message, headers, emit } );

		if ( result instanceof Promise )
			event.send( await result, status );
		else
			event.send( result, status );
	}

	/**
	 * @brief	Formats the error in a presentable format
	 *
	 * @param	{*} error
	 *
	 * @return	*
	 */
	_formatError( error )
	{
		if ( error instanceof Error )
			return error.message;

		return error;
	}
}

ErrorHandler.GENERAL_ERROR_CODE	= 'app.general';

module.exports					= ErrorHandler;
