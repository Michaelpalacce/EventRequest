'use strict';

const crypto								= require( 'crypto' );
const { Stats }								= require( 'fs' );
const PluginInterface						= require( '../plugin_interface' );

const DEFAULT_IS_STRONG						= true;
const IF_NONE_MATCH_CONDITIONAL_HEADER_NAME	= 'If-None-Match';
const IF_MATCH_CONDITIONAL_HEADER_NAME		= 'If-Match';

/**
 * @brief	Etag Plugin responsible for setting an etag Header for responses.
 */
class EtagPlugin extends PluginInterface
{
	/**
	 * @param	{String} pluginId
	 * @param	{Object} options
	 */
	constructor( pluginId, options = {} ) {
		super( pluginId, options );

		this.setOptions( options );
	}

	/**
	 * @param	{Object} options
	 */
	setOptions( options = {} ) {
		this.strong	= typeof options.strong === 'boolean'
					? options.strong
					: DEFAULT_IS_STRONG;
	}

	/**
	 * @brief	Calculates the ETag for a payload
	 *
	 * @param	{String|Buffer|Stats} payload
	 * @param	{Boolean} strong
	 *
	 * @return	String
	 */
	etag( payload, strong = this.strong ) {
		const algo		= strong ? 'sha1' : 'md5';
		const prefix	= strong ? '' : 'W/';

		if ( Buffer.isBuffer( payload ) || typeof payload === 'string' )
			return `${prefix}"${crypto.createHash( algo ).update( payload ).digest( 'hex' )}"`;

		else if ( payload instanceof Stats )
			return `${prefix}"${crypto.createHash( algo ).update( `${payload.mtimeMs.toString()}-${payload.size.toString()}` ).digest( 'hex' )}"`;

		else
			throw new TypeError( 'app.er.er_etag.invalid.payload' );
	}

	/**
	 * @brief	This function checks the Request If-None-Match and If-Match headers and returns a result
	 *
	 * @details	This function will calculate
	 *
	 * @param	{EventRequest} event
	 * @param	{String|Buffer|Stats} payload
	 * @param	{Boolean} strong
	 *
	 * @return	Object
	 */
	getConditionalResult( event, payload, strong = this.strong )
	{
		const etag	= this.etag( payload, strong );
		let pass	= true;
		let header	= null;

		switch ( true )
		{
			case event.hasRequestHeader( IF_NONE_MATCH_CONDITIONAL_HEADER_NAME ):
				header	= this._extractHeaderValues( event.getRequestHeader( IF_NONE_MATCH_CONDITIONAL_HEADER_NAME ) );

				if ( header.length === 1 && header[0] === '*' )
				{
					pass	= false;
					break;
				}

				pass	= header.indexOf( etag ) === -1;
				break;

			case event.hasRequestHeader( IF_MATCH_CONDITIONAL_HEADER_NAME ):
				header	= this._extractHeaderValues( event.getRequestHeader( IF_MATCH_CONDITIONAL_HEADER_NAME ) );

				if ( header.length === 1 && header[0] === '*' )
					break;

				pass	= header.indexOf( etag ) !== -1;
				break;

			default:
				break;
		}

		return { etag, pass };
	}

	/**
	 * @brief	Conditionally sends the request depending on the IF-* conditional headers
	 *
	 * @param	{EventRequest} event
	 * @param	{String|Buffer} payload
	 * @param	{Number} code
	 * @param	{Boolean} strong
	 *
	 * @return	{void}
	 */
	conditionalSend( event, payload, code = null, strong = this.strong )
	{
		payload					= event.formatResponse( payload );
		const { pass, etag }	= this.getConditionalResult( event, payload, strong );

		event.setResponseHeader( 'ETag', etag );

		if ( ! pass )
		{
			switch ( event.method.toUpperCase() )
			{
				case 'GET':
				case 'HEAD':
					payload	= '';
					code	= 304;
					break;

				default:
					payload	= '';
					code	= 412;
					break;
			}
		}

		event.send( payload, code );
	}

	/**
	 * @copydoc	PluginInterface.getPluginMiddleware
	 *
	 * @return	{Object[]}
	 */
	getPluginMiddleware()
	{
		const middleware	= {
			handler	: ( event ) => {
				event.etag					= this.etag.bind( this );
				event.getConditionalResult	= this.getConditionalResult.bind( this, event );
				event.conditionalSend		= this.conditionalSend.bind( this, event );
				event.setEtagHeader			= ( etag ) => {
					event.setResponseHeader( 'ETag', etag );
					return event;
				};

				event.on( 'cleanUp', () => {
					event.etag					= null;
					event.getConditionalResult	= null;
					event.conditionalSend		= null;
					event.setEtagHeader			= null;
				});

				event.next();
			}
		};

		return [middleware];
	}

	/**
	 * @brief	Extracts the conditional headers values
	 *
	 * @param	{String} header
	 *
	 * @private
	 *
	 * @return	{String[]}
	 */
	_extractHeaderValues( header )
	{
		return header.split( ',' ).map( ( x ) => { return x.trim(); } );
	}
}

module.exports	= EtagPlugin;
