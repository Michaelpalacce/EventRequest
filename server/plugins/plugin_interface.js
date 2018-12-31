'use strict';

/**
 * @brief	Plugin interface
 *
 * @details	This class should be used to "plugin" functionality to the event_request module. This is used by the
 * 			middleware container by: MiddlewareContainer.use( customPluginContainer );
 * 			When doing this then custom functionality will be added to the system, enabling third party support
 * 			and a unified interface to implementing new functionality
 */
class PluginInterface
{
	/**
	 * @param	String pluginId
	 * @param	Object options
	 */
	constructor( pluginId, options = {} )
	{
		this.options	= options;
		this.pluginId	= pluginId;
	}

	/**
	 * @brief	Returns the pluginId
	 *
	 * @return	String
	 */
	getPluginId()
	{
		return this.pluginId;
	}

	/**
	 * @brief	Returns an array of other plugins that this one is dependent on
	 *
	 * @details	If the dependencies are not added to the server, then an error will be thrown
	 *
	 * @return	Array
	 */
	getPluginDependencies()
	{
		return [];
	}

	/**
	 * @brief	Sets new options for the plugin
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	setOptions( options )
	{
		this.options	= options;
	}

	/**
	 * @brief	Returns all the middleware that are created by the plugin
	 *
	 * @details	These will be retrieved by the server and each one will be added to the router
	 * 			They must be normal middleware objects implementing handler, route, method keys or instances of Route
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		return [];
	}
}

module.exports	= PluginInterface;
