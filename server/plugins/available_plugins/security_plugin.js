'use strict';

const PluginInterface	= require( '../plugin_interface' );

/**
 * @brief	Security Plugin that allows you to add different HTTP security headers
 */
class SecurityPlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );
	}

	getPluginMiddleware()
	{
		return [()=>{

		}];
	}
}

module.exports	= SecurityPlugin;