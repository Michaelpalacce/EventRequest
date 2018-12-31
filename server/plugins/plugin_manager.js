'use strict';

const PluginInterface	= require( './plugin_interface' );

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
		if ( plugin instanceof PluginInterface && ! this.hasPlugin( plugin.getPluginId() ) )
		{
			this.plugins[plugin.getPluginId()]	= plugin;
		}
		else
		{
			throw new Error( 'Cannot add plugin' );
		}
	}

	/**
	 * @brief	Checks whether the given plugin id corresponds to a plugin added to the manager
	 *
	 * @param	String id
	 *
	 * @return	Boolean
	 */
	hasPlugin( id )
	{
		return this.plugins[id] != null;
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
	 * @brief	Gets a plugin given an id
	 *
	 * @param	String id
	 *
	 * @return	PluginInterface
	 */
	getPlugin( id )
	{
		if ( ! this.hasPlugin( id ) )
		{
			throw new Error( 'Plugin cannot be found' );
		}

		return this.plugins[id];
	}
}

module.exports	= PluginManager;
