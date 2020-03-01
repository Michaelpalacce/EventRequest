'use strict';

const PluginInterface	= require( '../plugin_interface' );
const fs				= require( 'fs' );
const path				= require( 'path' );

/**
 * @brief	Constants
 */
const PROJECT_ROOT	= path.parse( require.main.filename ).dir;
const CSS_HEADER	= 'text/css';

/**
 * @brief	Static resource plugin used to server static resources
 */
class StaticResourcesPlugin extends PluginInterface
{
	/**
	 * @brief	Sets the given path as the static path where resources can be delivered easily
	 *
	 * @details	Accepts options:
	 * 			- path - String - the path to make static - defaults to public
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		const staticPaths		= Array.isArray( this.options.paths ) ? this.options.paths : ['public'];
		const pluginMiddlewares	= [];

		staticPaths.forEach( ( staticPath )=>{
			const regExp	= new RegExp( '^(\/' + staticPath + ')' );

			pluginMiddlewares.push( {
				route	: regExp,
				handler	: ( event ) => {
					const item	= path.join( PROJECT_ROOT, event.path );

					if ( fs.existsSync( item ) )
					{
						typeof event.headers.accept === 'string'
							&& event.headers.accept.includes( CSS_HEADER )
							? event.setHeader( 'Content-Type', CSS_HEADER )
							: event.setHeader( 'Content-Type', '*/*' );

						event.send( fs.createReadStream( item ), 200 );
					}
					else
					{
						event.next( `File not found: ${item}` );
					}
				}
			} );
		});

		return pluginMiddlewares;
	}
}

module.exports	= StaticResourcesPlugin;