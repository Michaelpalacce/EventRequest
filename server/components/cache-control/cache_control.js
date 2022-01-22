'use strict';

const AVAILABLE_CACHE_CONTROL			= ['public', 'private', 'no-cache', 'no-store'];
const AVAILABLE_EXPIRATION_DIRECTIVES	= ['max-age', 's-maxage', 'max-stale', 'min-fresh', 'stale-while-revalidate', 'stale-if-errors'];
const AVAILABLE_REVALIDATION_DIRECTIVES	= ['must-revalidate', 'proxy-revalidate', 'immutable'];
const AVAILABLE_OTHER_DIRECTIVES		= ['no-transform'];

/**
 * @brief	Builder class responsible for creating a cache control header
 */
class CacheControl {
	constructor() {
		this.options	= {};
	}

	/**
	 * @brief	Parses the options passed and sets the correct attributes
	 *
	 * @private
	 * @param	{Object} [options={}]
	 * @param	{Boolean} options.static				- flag should set a bunch of rules meant for static resources
	 * @param	{Boolean} options.cacheControl			- flag should set cache control
	 * @param	{Boolean} options.revalidation			- flag should set revalidation directive
	 * @param	{Boolean} options.other					- flag should set other directive
	 * @param	{Boolean} options.expirationDirectives	- CacheControl.addExpirationDirective
	 */
	_configure( options = {} ) {
		if ( options.static === true )
			this.setStaticRules();

		this.setCacheControl( options.cacheControl );
		this.setRevalidationDirective( options.revalidation );
		this.setOtherDirective( options.other );

		if ( typeof options.expirationDirectives === 'object' ) {
			for ( const directive in options.expirationDirectives ) {
				/* istanbul ignore next */
				if ( ! {}.hasOwnProperty.call( options.expirationDirectives, directive ) )
					continue;

				const time	= options.expirationDirectives[directive];
				this.addExpirationDirective( directive, time );
			}
		}
	}

	/**
	 * @brief	Sets a bunch of rules meant for static resources
	 */
	setStaticRules() {
		this.setCacheControl( 'public' );
		this.addExpirationDirective( 'max-age', 604800 );
		this.setRevalidationDirective( 'immutable' );
	}

	/**
	 * @brief	Sets the Cache Control directive
	 *
	 * @details	This function checks from an array of possible values and if nothing matches, does not set anything.
	 *
	 * @param	{String} directive
	 */
	setCacheControl( directive ) {
		if ( AVAILABLE_CACHE_CONTROL.indexOf( directive ) === -1 )
			return;

		this.options.cacheControl	= directive;
	}

	/**
	 * @brief	Adds an expiration directive
	 *
	 * @details	This function checks from an array of possible values and if nothing matches, does not set anything.
	 * 			This function will check if time is a Number and if it is not it will not set anything
	 *
	 * @param	{String} directive
	 * @param	{Number} time
	 */
	addExpirationDirective( directive, time ) {
		if ( AVAILABLE_EXPIRATION_DIRECTIVES.indexOf( directive ) === -1 || typeof time !== 'number' )
			return;

		if ( typeof this.options.expirationDirectives !== 'object' )
			this.options.expirationDirectives	= {};

		this.options.expirationDirectives[directive]	= time;
	}

	/**
	 * @brief	Sets the revalidation directive
	 *
	 * @details	This function checks from an array of possible values and if nothing matches, does not set anything.
	 *
	 * @param	{String} directive
	 */
	setRevalidationDirective( directive ) {
		if ( AVAILABLE_REVALIDATION_DIRECTIVES.indexOf( directive ) === -1 )
			return;

		this.options.revalidation	= directive;
	}

	/**
	 * @brief	Sets the other directive
	 *
	 * @details	This function checks from an array of possible values and if nothing matches, does not set anything.
	 *
	 * @param	{String} directive
	 */
	setOtherDirective( directive ) {
		if ( AVAILABLE_OTHER_DIRECTIVES.indexOf( directive ) === -1 )
			return;

		this.options.other	= directive;
	}

	/**
	 * @brief	Appends to the header
	 *
	 * @details	This will check if a comma needs to be added
	 *
	 * @private
	 * @param	{String} header
	 * @param	{String} value
	 *
	 * @return	{String}
	 */
	_append( header, value ) {
		if ( header !== '' )
			header	+= ', ';

		header	+= value;
		return	header;
	}

	/**
	 * @brief	Builds the cache control header
	 *
	 * @details	This function will build the cache control header and clean up the builder, so it can be reused again
	 * 			You can pass another options object that will be validated via _configure as long as it is not empty
	 *
	 * @param	{Object} [options={}]
	 * @param	{Boolean} options.static				- flag should set a bunch of rules meant for static resources
	 * @param	{Boolean} options.cacheControl			- flag should set cache control
	 * @param	{Boolean} options.revalidation			- flag should set revalidation directive
	 * @param	{Boolean} options.other					- flag should set other directive
	 * @param	{Boolean} options.expirationDirectives	- CacheControl.addExpirationDirective
	 *
	 * @return	{String}
	 */
	build( options = {} ) {
		if ( Object.keys( options ).length !== 0 )
			this._configure( options );

		let headerValue	= '';

		if ( this.options.cacheControl )
			headerValue	= this._append( headerValue, this.options.cacheControl );

		if ( this.options.expirationDirectives )
			for ( const directive in this.options.expirationDirectives ) {
				/* istanbul ignore next */
				if ( ! {}.hasOwnProperty.call( this.options.expirationDirectives, directive ) )
					continue;

				const time	= this.options.expirationDirectives[directive];
				headerValue	= this._append( headerValue, `${directive}=${time}` );
			}

		if ( this.options.revalidation )
			headerValue	= this._append( headerValue, this.options.revalidation );

		if ( this.options.other )
			headerValue	= this._append( headerValue, this.options.other );

		this.options	= {};

		return headerValue;
	}
}

CacheControl.HEADER	= 'Cache-control';

module.exports		= CacheControl;
