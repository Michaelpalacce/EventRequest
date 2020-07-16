'use strict';

const PluginInterface	= require( '../plugin_interface' );

/**
 * @brief	Cors plugin used to apply common CORS headers
 */
class CorsPlugin extends PluginInterface
{
	/**
	 * @brief	Gets the cors middleware that adds the extra CORS headers
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		const corsMiddleware	= {
			handler	: ( event ) =>
			{
				const origin		= typeof this.options.origin === 'string'
									? this.options.origin
									: '*';

				const headers		= Array.isArray( this.options.headers )
									? this.options.headers.join( ', ' )
									: '*';

				const methods		= Array.isArray( this.options.methods )
									? this.options.methods.join( ', ' )
									: 'POST, PUT, GET, DELETE, HEAD, PATCH, COPY';

				const status		= typeof this.options.status === 'number'
									? this.options.status
									: 204;

				const maxAge		= typeof this.options.maxAge === 'number'
									? this.options.maxAge
									: null;

				const credentials	= typeof this.options.credentials === 'boolean'
									? this.options.credentials
									: null;

				const exposedHeader	= Array.isArray( this.options.exposedHeaders )
									? this.options.exposedHeaders.join( ', ' )
									: null;

				event.setResponseHeader( 'Access-Control-Allow-Origin', origin );
				event.setResponseHeader( 'Access-Control-Allow-Headers', headers );

				if ( exposedHeader !== null )
				{
					event.setResponseHeader( 'Access-Control-Expose-Headers', exposedHeader );
				}

				if ( maxAge !== null )
				{
					event.setResponseHeader( 'Access-Control-Max-Age', maxAge );
				}

				if ( credentials === true )
				{
					event.setResponseHeader( 'Access-Control-Allow-Credentials', 'true' );
				}

				if ( event.method === 'OPTIONS' )
				{
					event.setResponseHeader( 'Access-Control-Allow-Methods', methods );
					event.send( '', status );
					return;
				}

				event.next();
			}
		};

		return [corsMiddleware]
	}
}

module.exports	= CorsPlugin;