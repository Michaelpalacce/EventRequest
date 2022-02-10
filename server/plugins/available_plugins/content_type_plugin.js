'use strict';

const PluginInterface	= require( '../plugin_interface' );

/**
 * @brief	Content type plugin responsible for setting the Content-Type header in the request if it's not set
 */
class ContentTypePlugin extends PluginInterface {
	/**
	 * @return	{Array}
	 */
	getPluginMiddleware() {
		return [( event ) => {
			// Figure out the content type
			event.on( 'send', () => {
				const type	= event.response.getHeader( 'Content-Type' );

				if ( ! type )
					event.setResponseHeader( 'Content-Type', 'application/json' );
			});

			/**
			 * @brief	Attaches a contentType method to set the content type of the response
			 *
			 * @details	This will automatically set the charset
			 *
			 * @return	{EventRequest}
			 */
			event.contentType	= function ( contentType, charset = 'UTF-8' ) {
				event.setResponseHeader( 'Content-Type', `${contentType}; charset=${charset}` );

				return event;
			};

			event.on( 'cleanUp', () => {

			});

			event.next();
		}];
	}
}

module.exports	= ContentTypePlugin;
