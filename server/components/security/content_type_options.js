'use strict';

/**
 * @brief	Name of the X-Content-Type-Options header
 *
 * @var		String
 */
const HEADER_NAME	= 'X-Content-Type-Options';

/**
 * @brief	Formats a ContentTypeOptions header
 */
class ContentTypeOptions
{
	constructor( options = {} )
	{
		this.parseOptions( options );
	}

	/**
	 * @brief	Parses the options given to the ContentTypeOptions class
	 *
	 * @param	{Object} options
	 *
	 * @return	void
	 */
	parseOptions( options = {} )
	{
		this.setEnabled( options.enabled );
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

		return 'nosniff';
	}
}

module.exports	= ContentTypeOptions;