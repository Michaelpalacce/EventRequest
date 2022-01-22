'use strict';

const PluginInterface	= require( '../plugin_interface' );

/**
 * @brief	Plugin used to apply common CORS headers
 */
class CorsPlugin extends PluginInterface {
	/**
	 * @param	{String} pluginId
	 * @param	{Object} options
	 */
	constructor( pluginId, options = {} ) {
		super( pluginId, options );
		this.setOptions( options );
	}

	/**
	 * @param	{Object} options
	 */
	setOptions( options = {} ) {
		super.setOptions( options );

		this.origin			= Array.isArray( this.options.origin ) || typeof this.options.origin === 'string'
							? this.options.origin
							: '*';

		this.headers		= Array.isArray( this.options.headers )
							? this.options.headers.join( ', ' )
							: '*';

		this.methods		= Array.isArray( this.options.methods )
							? this.options.methods.join( ', ' )
							: 'POST, PUT, GET, DELETE, HEAD, PATCH, COPY';

		this.status			= typeof this.options.status === 'number'
							? this.options.status
							: 204;

		this.maxAge			= typeof this.options.maxAge === 'number'
							? this.options.maxAge
							: null;

		this.credentials	= typeof this.options.credentials === 'boolean'
							? this.options.credentials
							: null;

		this.exposedHeader	= Array.isArray( this.options.exposedHeaders )
							? this.options.exposedHeaders.join( ', ' )
							: null;
	}

	/**
	 * @brief	Applies all the CORS headers to the response
	 *
	 * @param	{EventRequest} event
	 */
	applyCors( event ) {
		if ( ! Array.isArray( this.origin ) ) {
			if ( this.origin === 'er_dynamic' )
				event.setResponseHeader( 'Access-Control-Allow-Origin', event.getRequestHeader( 'origin' ) || '*' );
			else
				event.setResponseHeader( 'Access-Control-Allow-Origin', this.origin );
		}
		else {
			const requestOrigin	= event.getRequestHeader( 'origin' );

			if ( this.origin.includes( requestOrigin ) )
				event.setResponseHeader( 'Access-Control-Allow-Origin', requestOrigin );
			else
				event.setResponseHeader( 'Access-Control-Allow-Origin', this.origin[0] || '*' );
		}

		event.setResponseHeader( 'Access-Control-Allow-Headers', this.headers );

		if ( this.exposedHeader !== null )
			event.setResponseHeader( 'Access-Control-Expose-Headers', this.exposedHeader );

		if ( this.maxAge !== null )
			event.setResponseHeader( 'Access-Control-Max-Age', this.maxAge );

		if ( this.credentials === true )
			event.setResponseHeader( 'Access-Control-Allow-Credentials', 'true' );

		if ( event.method === 'OPTIONS' ) {
			event.setResponseHeader( 'Access-Control-Allow-Methods', this.methods );
			event.send( '', this.status );
			return;
		}

		event.next();
	}

	/**
	 * @brief	Gets the cors middleware that adds the extra CORS headers
	 *
	 * @return	{Array}
	 */
	getPluginMiddleware() {
		return [{ handler : this.applyCors.bind( this ) }];
	}
}

module.exports	= CorsPlugin;
