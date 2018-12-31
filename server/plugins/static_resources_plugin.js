'use strict';

const PluginInterface	= require( './plugin_interface' );
const fs				= require( 'fs' );
const path				= require( 'path' );

/**
 * @brief	Constants
 */
const PROJECT_ROOT		= path.parse( require.main.filename ).dir;

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
		let staticPath			= typeof this.options.path === 'string' ? this.options.path : 'public';
		let regExp				= new RegExp( '^(\/' + staticPath + ')' );

		let pluginMiddleware	= {
			route	: regExp,
			handler	: ( event ) => {
				let item		= path.join( PROJECT_ROOT, event.path );
				let cssHeader	= 'text/css';

				if ( fs.existsSync( item ) )
				{
					typeof event.headers.accept === 'string' && event.headers.accept.includes( cssHeader )
						? event.setHeader( 'Content-Type', cssHeader )
						: event.setHeader( 'Content-Type', '*/*' );

					event.send( fs.createReadStream( item ), 200 );
				}
				else
				{
					event.next( `File not found: ${item}` );
				}
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= StaticResourcesPlugin;