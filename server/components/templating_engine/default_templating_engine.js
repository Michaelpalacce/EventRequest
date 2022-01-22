'use strict';

const { readFile }	= require( 'fs' ).promises;

/**
 * @brief	Default templating engine that just returns the HTML directly
 */
class TemplatingEngine {
	/**
	 * @brief	Return the HTML directly
	 *
	 * @param	{String} html
	 * @param	{Object} variables
	 *
	 * @returns	{String}
	 */
	render( html, variables ) {
		return html;
	}

	/**
	 * @brief	Reads and renders a html file
	 *
	 * @param	{String} templateLocation
	 * @param	{Object} variables
	 *
	 * @return	{String}
	 */
	async renderFile( templateLocation, variables ) {
		const data	= await readFile( templateLocation );

		return this.render( data.toString(), variables );
	}
}

module.exports	= TemplatingEngine;
