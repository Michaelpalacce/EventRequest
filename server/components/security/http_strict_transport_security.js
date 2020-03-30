'use strict';

/**
 * @brief	Time in seconds for which the browser should remember that this site should be accessed through https
 *
 * @details	One year in seconds
 *
 * @var		Number
 */
const DEFAULT_MAX_AGE					= 31536000;
const DEFAULT_INCLUDE_SUB_DOMAINS		= true;
const DEFAULT_PRELOAD					= true;

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
	 * @param	options Object
	 *
	 * @return	void
	 */
	parseOptions( options = {} )
	{
		this.maxAge				= typeof options[OPTIONS_MAX_AGE_KEY] === 'number'
								? options[OPTIONS_MAX_AGE_KEY]
								: DEFAULT_MAX_AGE;

		this.includeSubDomains	= typeof options[OPTIONS_INCLUDE_SUB_DOMAINS_KEY] === 'number'
								? options[OPTIONS_INCLUDE_SUB_DOMAINS_KEY]
								: DEFAULT_INCLUDE_SUB_DOMAINS;

		this.preload		 	= typeof options[OPTIONS_PRELOAD_KEY] === 'number'
								? options[OPTIONS_PRELOAD_KEY]
								: DEFAULT_PRELOAD;
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
		let headerContent	= `${MAX_AGE_KEY}=${this.maxAge};`;

		if ( this.includeSubDomains === true )
			headerContent	+= ` ${INCLUDE_SUB_DOMAINS_KEY};`;

		if ( this.preload === true )
			headerContent	+= ` ${PRELOAD_KEY};`;

		return headerContent;
	}
}

module.exports	= HttpStrictTransportSecurity;