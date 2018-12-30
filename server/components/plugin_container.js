'use strict';

/**
 * @brief	Plugin container
 *
 * @details	This class should be used to "plugin" functionality to the event_request module. This is used by the
 * 			middleware container by: MiddlewareContainer.use( customPluginContainer );
 * 			When doing this then custom functionality will be added to the system, enabling third party support
 * 			and a unified interface to implementing new functionality
 */
class PluginContainer
{
	/**
	 * @param	Object options
	 */
	constructor( options = {} )
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

module.exports	= PluginContainer;
