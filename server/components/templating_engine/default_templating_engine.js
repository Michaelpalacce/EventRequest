'use strict';

const { readFile }	= require( 'fs' ).promises;

/**
 * @brief	Default templating engine that just returns the HTML directly
 */
class TemplatingEngine {
	/**
	 * @brief	Return the HTML directly
	 *
	 * @property	{String} html
	 * @property	{Object} variables
	 *
	 * @returns	{String}
	 */
	render( html, variables ) {
		return html;
	}

	/**
	 * @brief	Reads and renders a html file
	 *
	 * @property	{String} templateLocation
	 * @property	{Object} variables
	 *
	 * @return	{Promise<String>}
	 */
	async renderFile( templateLocation, variables ) {
		const data	= await readFile( templateLocation );

		return this.render( data.toString(), variables );
	}
}

module.exports	= TemplatingEngine;
