'use strict';

const PluginInterface	= require( '../plugin_interface' );
const CacheControl		= require( '../../components/cache-control/cache_control' );
const fs				= require( 'fs' );
const path				= require( 'path' );

/**
 * @brief	Constants
 */
const PROJECT_ROOT	= path.parse( require.main.filename ).dir;
const CSS_HEADER	= 'text/css';
const JS_HEADER		= 'application/javascript';
const SVG_HEADER	= 'image/svg+xml';

/**
 * @brief	Static resource plugin used to server static resources
 */
class StaticResourcesPlugin extends PluginInterface
{
	setServerOnRuntime( server )
	{
		this.server	= server;
	}

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

		const cacheControl		= typeof this.options.cache === 'object'
								? this.options.cache
								: { static: true };

		const pluginMiddlewares	= [];

		staticPaths.forEach( ( staticPath ) => {
			const regExp	= new RegExp( '^(/' + staticPath + ')' );
			staticPath		= path.join( PROJECT_ROOT, staticPath );

			pluginMiddlewares.push({
				route		: regExp,
				middlewares	: this.server.er_cache.cache( cacheControl ),
				handler		: ( event ) => {
					const item	= path.join( PROJECT_ROOT, event.path );

					if ( fs.existsSync( item ) && fs.statSync( item ).isFile() && item.indexOf( staticPath ) !== -1 )
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

							case '.svg':
								mimeType	= SVG_HEADER;
								break;

							default:
								break;
						}

						event.setResponseHeader( 'Content-Type', mimeType ).setStatusCode( 200 );

						fs.createReadStream( item ).pipe( event.response );
					}
					else
					{
						event.removeResponseHeader( CacheControl.HEADER );

						event.next( { code: 'app.er.staticResources.fileNotFound', message: `File not found: ${event.path}`, status: 404 } );
					}
				}
			});
		});

		this.options	= {};

		return pluginMiddlewares;
	}
}

module.exports	= StaticResourcesPlugin;