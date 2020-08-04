'use strict';

/**
 * @brief	PluginManager that contains all the plugins added to the site
 */
class PluginManager
{
	constructor()
	{
		this.plugins	= {};
	}

	/**
	 * @brief	Adds a plugin to the Manager
	 *
	 * @param	{PluginInterface} plugin
	 *
	 * @return	void
	 */
	addPlugin( plugin )
	{
		if ( this.isValidPlugin( plugin ) )
			this.plugins[plugin.getPluginId()]	= plugin;
		else
			throw new Error( 'app.er.pluginManager.invalidPlugin' );
	}

	/**
	 * @brief	Checks whether the given plugin id corresponds to a plugin added to the manager
	 *
	 * @param	{String} id
	 *
	 * @return	Boolean
	 */
	hasPlugin( id )
	{
		return typeof this.plugins[id] !== 'undefined';
	}

	/**
	 * @brief	Removes a plugin by id
	 *
	 * @param	{String} id
	 *
	 * @return	void
	 */
	removePlugin( id )
	{
		delete this.plugins[id];
	}

	/**
	 * @brief	Get all plugins added to the plugin manager
	 *
	 * @return	Array
	 */
	getAllPluginIds()
	{
		return Object.keys( this.plugins );
	}

	/**
	 * @brief	Returns if the given plugin is a valid plugin interface
	 *
	 * @param	{PluginInterface|Object} plugin
	 *
	 * @return	Boolean
	 */
	isValidPlugin( plugin )
	{
		return typeof plugin.getPluginId === 'function'
			&& typeof plugin.getPluginDependencies === 'function'
			&& typeof plugin.getPluginMiddleware === 'function'
			&& typeof plugin.setServerOnRuntime === 'function'
			&& typeof plugin.setOptions === 'function';
	}

	/**
	 * @brief	Gets a plugin given an id
	 *
	 * @param	{String} id
	 *
	 * @return	PluginInterface
	 */
	getPlugin( id )
	{
		if ( ! this.hasPlugin( id ) )
			throw new Error( 'app.er.pluginManager.pluginDoesNotExist' );

		return this.plugins[id];
	}
}

module.exports	= PluginManager;
