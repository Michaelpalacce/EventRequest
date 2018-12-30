'use strict';

const PluginInterface	= require( './../components/plugin_interface' );

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
	 * @param	PluginInterface plugin
	 *
	 * @return	void
	 */
	addPlugin( plugin )
	{
		if ( plugin instanceof PluginInterface )
		{
			this.plugins[plugin.getPluginId()]	= plugin;
		}
	}

	/**
	 * @brief	Removes a plugin by id
	 *
	 * @param	String id
	 *
	 * @return	void
	 */
	removePlugin( id )
	{
		this.plugins[id]	= undefined;
	}
}

module.exports	= PluginManager;