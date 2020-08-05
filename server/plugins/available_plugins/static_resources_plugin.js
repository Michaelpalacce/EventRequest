'use strict';

const PluginInterface	= require( '../plugin_interface' );
const fs				= require( 'fs' );
const path				= require( 'path' );

/**
 * @brief	Constants
 */
const PROJECT_ROOT	= path.parse( require.main.filename ).dir;
const CSS_HEADER	= 'text/css';
const JS_HEADER		= 'application/javascript';

/**
 * @brief	Static resource plugin used to server static resources
 */
class StaticResourcesPlugin extends PluginInterface
{
	/**
	 * @brief	Sets the given path as the static path where resources can be delivered easily
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		const staticPaths		= Array.isArray( this.options.paths )
								? this.options.paths
								: typeof this.options.paths === 'string'
								? [this.options.paths]
								: ['public'];

		const pluginMiddlewares	= [];

		staticPaths.forEach( ( staticPath ) => {
			const regExp	= new RegExp( '^(\/' + staticPath + ')' );

			pluginMiddlewares.push( {
				route	: regExp,
				handler	: ( event ) => {
					const item	= path.join( PROJECT_ROOT, event.path );

					if ( fs.existsSync( item ) )
					{
						let mimeType	= '*/*';
						switch ( path.extname( item ) )
						{
							case '.css':
								mimeType	= CSS_HEADER;
								break;

							case '.js':
								mimeType	= JS_HEADER;
								break;

							default:
								break;
						}

						event.setResponseHeader( 'Content-Type', mimeType ).setStatusCode( 200 );

						fs.createReadStream( item ).pipe( event.response );
					}
					else
					{
						event.next( { code: 'app.er.staticResources.fileNotFound', message: `File not found: ${item}`, status: 404 } );
					}
				}
			} );
		});

		return pluginMiddlewares;
	}
}

module.exports	= StaticResourcesPlugin;