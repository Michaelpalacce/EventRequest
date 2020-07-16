'use strict';

/**
 * @brief	Plugin interface
 *
 * @details	This class should be used to "plugin" functionality to the event_request module.
 */
class PluginInterface
{
	/**
	 * @param	{String} pluginId
	 * @param	{Object} [options={}]
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
	 * @brief	Function that is called when applying the plugin to the server
	 *
	 * @details	This method should attach to any events dispatched by the server
	 *
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
	}

	/**
	 * @brief	Sets new options for the plugin
	 *
	 * @param	{Object} options
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
