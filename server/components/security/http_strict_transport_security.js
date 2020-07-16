'use strict';

/**
 * @brief	Time in seconds for which the browser should remember that this site should be accessed through https
 *
 * @details	One year in seconds
 *
 * @var		Number
 */
const DEFAULT_MAX_AGE					= 31536000;
const DEFAULT_INCLUDE_SUB_DOMAINS		= false;
const DEFAULT_PRELOAD					= false;

/**
 * @brief	Name of the HSTS header
 *
 * @var		String
 */
const HEADER_NAME						= 'Strict-Transport-Security';

// Option keys
const OPTIONS_MAX_AGE_KEY				= 'maxAge';
const OPTIONS_PRELOAD_KEY				= 'preload';
const OPTIONS_INCLUDE_SUB_DOMAINS_KEY	= 'includeSubDomains';

// Header keys
const MAX_AGE_KEY						= 'max-age';
const INCLUDE_SUB_DOMAINS_KEY			= 'includeSubDomains';
const PRELOAD_KEY						= 'preload';

/**
 * @brief	Formats a HSTS header
 */
class HttpStrictTransportSecurity
{
	constructor( options = {} )
	{
		this.parseOptions( options );
	}

	/**
	 * @brief	Parses the options given to the HSTS class
	 *
	 * @param	{Object} [options={}]
	 *
	 * @return	void
	 */
	parseOptions( options = {} )
	{
		this.setEnabled( options.enabled );

		this.maxAge					= typeof options[OPTIONS_MAX_AGE_KEY] === 'number'
									? options[OPTIONS_MAX_AGE_KEY]
									: DEFAULT_MAX_AGE;

		this.doIncludeSubDomains	= typeof options[OPTIONS_INCLUDE_SUB_DOMAINS_KEY] === 'boolean'
									? options[OPTIONS_INCLUDE_SUB_DOMAINS_KEY]
									: DEFAULT_INCLUDE_SUB_DOMAINS;

		this.doPreload			 	= typeof options[OPTIONS_PRELOAD_KEY] === 'boolean'
									? options[OPTIONS_PRELOAD_KEY]
									: DEFAULT_PRELOAD;
	}

	/**
	 * @brief	Sets the component's to either be enabled or not
	 *
	 * @param	{Boolean} [enabled=true]
	 *
	 * @return	void
	 */
	setEnabled( enabled = true )
	{
		this.enabled	= typeof enabled === 'boolean' ? enabled : true;
	}

	/**
	 * @brief	Sets the component's to either be preloaded or not
	 *
	 * @param	{Boolean} [preload=true]
	 *
	 * @return	void
	 */
	preload( preload = true )
	{
		this.doPreload	= typeof preload === 'boolean' ? preload : this.doPreload;
	}

	/**
	 * @brief	Sets the enforce flag
	 *
	 * @param	{Number} maxAge
	 *
	 * @return	void
	 */
	setMaxAge( maxAge )
	{
		this.maxAge	= typeof maxAge === 'number' ? maxAge : this.maxAge;
	}

	/**
	 * @brief	Enable or disable includeSubDomains
	 *
	 * @param	{Boolean} [include=true]
	 *
	 * @return	void
	 */
	includeSubDomains( include = true )
	{
		this.doIncludeSubDomains	= typeof include === 'boolean' ? include : this.doIncludeSubDomains;
	}

	/**
	 * @brief	Returns the header name
	 *
	 * @return	String
	 */
	getHeader()
	{
		return HEADER_NAME;
	}

	/**
	 * @brief	Builds the header
	 *
	 * @return	String
	 */
	build()
	{
		if ( ! this.enabled )
			return '';

		let headerContent	= `${MAX_AGE_KEY}=${this.maxAge};`;

		if ( this.doIncludeSubDomains === true )
			headerContent	+= ` ${INCLUDE_SUB_DOMAINS_KEY};`;

		if ( this.doPreload === true )
			headerContent	+= ` ${PRELOAD_KEY};`;

		return headerContent;
	}
}

module.exports	= HttpStrictTransportSecurity;