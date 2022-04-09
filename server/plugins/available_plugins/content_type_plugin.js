'use strict';

const PluginInterface	= require( '../plugin_interface' );
const MimeType			= require( '../../components/mime_type/mime_type' );
const path				= require( 'path' );

const DEFAULT_CONTENT_TYPE	= 'application/json';
const CONTENT_TYPE_HEADER	= 'Content-Type';
const DEFAULT_ENCODING		= 'UTF-8';

/**
 * @brief	Content type plugin responsible for setting the Content-Type header in the request if it's not set
 */
class ContentTypePlugin extends PluginInterface {
	/**
	 * @brief	Modifies the content type if it is not set.
	 *
	 * @details	Bound to event instead of ContentTypePlugin, so we can use `this` to reference the EventRequest
	 */
	onEventSend( event ) {
		const type	= event.response.getHeader( CONTENT_TYPE_HEADER );

		if ( ! type )
			event.setResponseHeader( CONTENT_TYPE_HEADER, this.defaultContentType );
	}

	/**
	 * @param	{Object} options
	 * @param	{String} options.defaultContentType	- The default Content-Type to set. If not passed, defaults to application/json
	 */
	setOptions( options = {} ) {
		super.setOptions( options );

		this.defaultContentType	= typeof this.options.defaultContentType === 'string'
								? this.options.defaultContentType
								: DEFAULT_CONTENT_TYPE;
	}

	/**
	 * @return	{Array}
	 */
	getPluginMiddleware() {
		return [( event ) => {
			const sendCallback	= () => {
				return this.onEventSend( event );
			};

			event.on( 'send', sendCallback );

			/**
			 * @brief	Attaches a contentType method to set the content type of the response
			 *
			 * @details	This will automatically set the charset
			 *
			 * @return	{EventRequest}
			 */
			event.contentType	= function ( contentType, charset = DEFAULT_ENCODING ) {
				event.setResponseHeader( CONTENT_TYPE_HEADER, `${contentType}; charset=${charset}` );

				return event;
			};

			/**
			 * @brief	Gives you the ability to set the content type by passing the FileName
			 *
			 * @param	{String} fileName
			 * @param	{String} charset
			 *
			 * @returns	{EventRequest}
			 */
			event.contentTypeFromFileName	= function ( fileName, charset = null ) {
				this.contentType( MimeType.findMimeType( path.extname( fileName ) ), charset );

				return event;
			}

			event.on( 'cleanUp', () => {
				event.contentType				= undefined;
				event.contentTypeFromFileName	= undefined;
				event.off( 'send', sendCallback );
			});

			event.next();
		}];
	}
}

module.exports	= ContentTypePlugin;
