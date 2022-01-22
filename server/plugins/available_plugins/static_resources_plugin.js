'use strict';

const PluginInterface	= require( '../plugin_interface' );
const MimeType			= require( '../../components/mime_type/mime_type' );
const CacheControl		= require( '../../components/cache-control/cache_control' );
const fs				= require( 'fs' );
const path				= require( 'path' );

/**
 * @brief	Constants
 */
const PROJECT_ROOT	= path.parse( require.main.filename ).dir;

/**
 * @brief	Static resource plugin used to server static resources
 */
class StaticResourcesPlugin extends PluginInterface {
	/**
	 * Defines a dynamic static resource, meaning that the path given will be taken from the project ROOT and styles will
	 * 	be searched for inside this path.
	 *
	 * 	e.g. If given /css this will be translated to /path/to/project/css BUT resources must not start with css, meaning that if
	 * 	you have a file /path/to/project/css/style.css you should pass /style.css ONLY
	 *
	 * @var	{Number} DYNAMIC
	 */
	static DYNAMIC	= 1;

	/**
	 * Defines an absolute static resource, meaning that the path given will be taken from the project ROOT
	 * e.g. if given /css this will be translated to /path/to/project/css and all resources must start with /css
	 *
	 * @var	{Number} Absolute
	 */
	static ABSOLUTE	= 2;

	setServerOnRuntime( server ) {
		this.server	= server;
	}

	/**
	 * @brief	Sets the given path as the static path where resources can be delivered easily
	 *
	 * @return	Array
	 */
	getPluginMiddleware() {
		const pluginMiddlewares	= this._getPluginMiddlewares();
		this.options			= {};

		return pluginMiddlewares;
	}

	/**
	 * Wrapper for getPluginMiddleware
	 */
	_getPluginMiddlewares() {
		const type			= typeof this.options.type === 'number'
							? this.options.type
							: StaticResourcesPlugin.DYNAMIC;

		const paths			= Array.isArray( this.options.paths )
							? this.options.paths
							: typeof this.options.paths === 'string'
								? [this.options.paths]
								: ['public'];

		const cacheControl	= typeof this.options.cache === 'object'
							? this.options.cache
							: { static: true };

		const useEtag		= typeof this.options.useEtag === 'boolean'
							? this.options.useEtag
							: false;

		const strong		= typeof this.options.strong === 'boolean'
							? this.options.strong
							: true;

		switch ( type ) {
			case StaticResourcesPlugin.DYNAMIC:
				return this._setDynamicPaths( paths, cacheControl, useEtag, strong );

			case StaticResourcesPlugin.ABSOLUTE:
				return this._setAbsolutePaths( paths, cacheControl, useEtag, strong );
		}
	}

	/**
	 * Sets paths that follow the rules defined in StaticResourcesPlugin.DYNAMIC
	 *
	 * @see		StaticResourcesPlugin.DYNAMIC
	 *
	 * @return	{Array}
	 */
	_setDynamicPaths( paths, cacheControl, useEtag, strong ) {
		const pluginMiddlewares	= [];

		paths.forEach( ( resourcePath ) => {
			pluginMiddlewares.push({
				middlewares	: this.server.er_cache.cache( cacheControl ),
				method		: 'GET',
				handler		: ( event ) => {
					const resolved		= path.join( PROJECT_ROOT, resourcePath );
					const fileToFind	= path.join( PROJECT_ROOT, resourcePath, event.path );

					// Means they used .. to go back :) we don't want this
					if ( ! fileToFind.startsWith( resolved ) )
						return event.next( { code: 'app.er.staticResources.fileNotFound', message: `File not found: ${event.path}`, status: 404 } );

					const file	= this._fromDir( resolved, fileToFind );

					if ( ! file )
						return event.next();

					if ( useEtag ) {
						const plugin			= this.server.er_etag;
						const { etag, pass }	= plugin.getConditionalResult( event, fs.statSync( file ), strong );

						event.setResponseHeader( 'ETag', etag );

						if ( ! pass )
							return event.send( '', 304 );
					}

					this._sendFile( event, file );
				}
			});
		});

		return pluginMiddlewares;
	}

	/**
	 * Sets paths that follow the rules defined in StaticResourcesPlugin.ABSOLUTE
	 *
	 * @see	StaticResourcesPlugin.ABSOLUTE
	 */
	_setAbsolutePaths( paths, cacheControl, useEtag, strong ) {
		const pluginMiddlewares	= [];

		paths.forEach( ( staticPath ) => {
			const regExp	= new RegExp( '^(/' + staticPath + ')' );
			staticPath		= path.join( PROJECT_ROOT, staticPath );

			pluginMiddlewares.push({
				route		: regExp,
				middlewares	: this.server.er_cache.cache( cacheControl ),
				method		: 'GET',
				handler		: ( event ) => {
					const item		= path.join( PROJECT_ROOT, event.path );
					let fileStat	= null;

					if ( fs.existsSync( item ) && ( fileStat = fs.statSync( item ) ).isFile() && item.indexOf( staticPath ) !== -1 ) {
						if ( useEtag ) {
							const plugin			= this.server.er_etag;
							const { etag, pass }	= plugin.getConditionalResult( event, fileStat, strong );

							event.setResponseHeader( 'ETag', etag );

							if ( ! pass )
								return event.send( '', 304 );
						}

						this._sendFile( event, item );
					}
					else {
						event.removeResponseHeader( CacheControl.HEADER );

						event.next( { code: 'app.er.staticResources.fileNotFound', message: `File not found: ${event.path}`, status: 404 } );
					}
				}
			});
		});

		return pluginMiddlewares;
	}

	/**
	 * Finds a file starting from a dir
	 * If start Path is a file, then it will be returned directly :)
	 *
	 * @property	{String} startPath
	 * @property	{String} fileToFind
	 *
	 * @return	{String|null}
	 */
	_fromDir( startPath, fileToFind ) {
		if ( ! fs.existsSync( startPath ) )
			return null;

		const files	= fs.readdirSync( startPath );

		for( let i = 0; i < files.length; i ++ ) {
			const file	= path.join( startPath, files[i] );
			const stat	= fs.lstatSync( file );

			if ( stat.isDirectory() ) {
				const foundFile	= this._fromDir( file, fileToFind );

				if ( foundFile )
					return foundFile;
			}
			else if ( file === fileToFind )
				return file;
		}

		return null;
	}

	/**
	 * Sends a given file.
	 * Sets the correct Content-Type header as well as the correct status code
	 *
	 * @property	{EventRequest} event
	 * @property	{String} file
	 */
	_sendFile( event, file ) {
		event.setResponseHeader( 'Content-Type', MimeType.findMimeType( path.extname( file ) ) ).setStatusCode( 200 );

		fs.createReadStream( file ).pipe( event.response );
	}
}

module.exports	= StaticResourcesPlugin;
