'use strict';

// Dependencies
const fs				= require( 'fs' );
const path				= require( 'path' );
const TemplatingEngine	= require( './../../templating_engine' );

/**
 * @brief	Constants
 */
const DEFAULT_TEMPLATE_DIR	= '/templates';

/**
 * @brief	A simple templating engine
 */
class Templater extends TemplatingEngine
{
	constructor( options )
	{
		super( options );
	}

	/**
	 * @brief	Sanitize the config to check if everything is present
	 *
	 * @param	Object option
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		this.templateDir	= typeof options.templateDir === 'string'
							? options.templateDir
							: DEFAULT_TEMPLATE_DIR;
	}

	/**
	 * @brief	Renders the given template
	 *
	 * @details	Uses a simple {{ }} to implement simple JS functionality
	 * 			Callback will be called when rendering is finished with an error if any
	 *
	 * @param	String templateName
	 * @param	Object variables
	 * @param	Function callback
	 *
	 * @return	void
	 */
	render( templateName, variables, callback )
	{
		templateName	= typeof templateName === 'string' && templateName.length > 0
						? templateName + '.html'
						: false;

		if ( ! templateName )
		{
			callback( 'ERROR WHILE RENDERING' );
		}

		let templatePath	= path.join( this.templateDir, templateName );

		fs.readFile( templatePath, 'utf8', ( err, str ) => {
			if ( ! err && str && str.length > 0 )
			{
				callback( false, this.parseTemplate( str, variables ) );
			}
			else
			{
				callback( 'ERROR WHILE RENDERING' );
			}
		});
	}

	/**
	 * @brief	Pre processes the given template
	 *
	 * @param	String template
	 * @param	Object templateVariables
	 *
	 * @return	String
	 */
	parseTemplate( template, templateVariables )
	{

		return template;
	}
}

// Export the module
module.exports	= Templater;
