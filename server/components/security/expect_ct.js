'use strict';

/**
 * @brief	Specifies the number of seconds after reception of the Expect-CT header field during which
 * 			the user agent should regard the host from whom the message was received as a known Expect-CT host.
 *
 * @details	One day in seconds
 *
 * @var		{Number}
 */
const DEFAULT_MAX_AGE			= 86400;
const DEFAULT_ENFORCE			= true;
const DEFAULT_REPORT_URI		= '';

/**
 * @brief	Name of the Expect-CT header
 *
 * @var		{String}
 */
const HEADER_NAME				= 'Expect-CT';

// Option keys
const OPTIONS_MAX_AGE_KEY		= 'maxAge';
const OPTIONS_ENFORCE_KEY		= 'enforce';
const OPTIONS_REPORT_URI_KEY	= 'reportUri';

// Header keys
const MAX_AGE_KEY				= 'max-age';
const ENFORCE_KEY				= 'enforce';
const REPORT_URI_KEY			= 'report-uri';

/**
 * @brief	Formats an Expect-CT header
 */
class ExpectCT {
	constructor( options = {} ) {
		this.parseOptions( options );
	}

	/**
	 * @brief	Parses the options given to the ExpectCT class
	 *
	 * @param	{Object} [options={}]
	 */
	parseOptions( options = {} ) {
		this.setEnabled( options.enabled );

		this.maxAge		= typeof options[OPTIONS_MAX_AGE_KEY] === 'number'
						? options[OPTIONS_MAX_AGE_KEY]
						: DEFAULT_MAX_AGE;

		this.reportUri	= typeof options[OPTIONS_REPORT_URI_KEY] === 'string'
						? options[OPTIONS_REPORT_URI_KEY]
						: DEFAULT_REPORT_URI;

		this.isEnforce	= typeof options[OPTIONS_ENFORCE_KEY] === 'boolean'
						? options[OPTIONS_ENFORCE_KEY]
						: DEFAULT_ENFORCE;
	}

	/**
	 * @brief	Sets the component's to either be enabled or not
	 *
	 * @param	{Boolean} [enabled=true]
	 */
	setEnabled( enabled = true ) {
		this.enabled	= typeof enabled === 'boolean' ? enabled : true;
	}

	/**
	 * @brief	Sets the enforce flag
	 *
	 * @param	{Boolean} [enforce=true]
	 */
	enforce( enforce = true ) {
		this.isEnforce	= typeof enforce === 'boolean' ? enforce : this.isEnforce;
	}

	/**
	 * @brief	Sets the enforce flag
	 *
	 * @param	{Number} maxAge
	 */
	setMaxAge( maxAge ) {
		this.maxAge	= typeof maxAge === 'number' ? maxAge : this.maxAge;
	}

	/**
	 * @brief	Sets the reportUri
	 *
	 * @param	{String} reportUri
	 */
	setReportUri( reportUri ) {
		this.reportUri	= typeof reportUri === 'string' ? reportUri : this.reportUri;
	}

	/**
	 * @brief	Returns the header name
	 *
	 * @return	{String}
	 */
	getHeader() {
		return HEADER_NAME;
	}

	/**
	 * @brief	Builds the header
	 *
	 * @return	{String}
	 */
	build() {
		if ( ! this.enabled )
			return '';

		let headerContent	= `${MAX_AGE_KEY}=${this.maxAge}`;

		if ( this.isEnforce === true )
			headerContent	+= `, ${ENFORCE_KEY}`;

		if ( this.reportUri !== '' )
			headerContent	+= `, ${REPORT_URI_KEY}="${this.reportUri}"`;

		return headerContent;
	}
}

module.exports	= ExpectCT;
