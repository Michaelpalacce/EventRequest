'use strict';

const PluginInterface	= require( '../plugin_interface' );
const CacheControl		= require( '../../components/cache-control/cache_control' );

/**
 * @brief	Cache control plugin responsible for building and setting a Cache-control header
 */
class CacheControlPlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );

		this.builder	= new CacheControl();
	}

	/**
	 * @brief	Dynamic Middleware that will add a cache header to the current request with the options provided
	 *
	 * @param	{Object} [options={}]
	 *
	 * @return	Function
	 */
	cache( options = {} )
	{
		const header	= this.builder.build( options );

		if ( header !== '' )
			return ( event ) => event.setResponseHeader( CacheControl.HEADER, header ).next();
		else
			return ( event ) => event.next();
	}

	/**
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		return [this.cache( this.options )];
	}
}

module.exports	= CacheControlPlugin;