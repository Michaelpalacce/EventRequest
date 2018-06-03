'use strict';

// Dependencies
const fs				= require( 'fs' );
const path				= require( 'path' );
const TemplatingEngine	= require( './../templating_engine' );

/**
 * @brief	A simple templating engine
 */
class BaseTemplatingEngine extends TemplatingEngine
{
	constructor( options )
	{
		super( options );
		this.templateDir	= options.templateDir;

		this.sanitizeConfig()
	}

	/**
	 * @brief	Sanitize the config to check if everything is present
	 *
	 * @return	void
	 */
	sanitizeConfig()
	{
		if ( ! this.templateDir )
		{
			throw new Error( 'Invalid configuration provided' );
		}
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
		templateName	= typeof templateName === 'string' && templateName.length > 0 ? templateName + '.html' : false;

		if ( ! templateName )
		{
			callback( 'ERROR WHILE RENDERING' );
		}

		let templatePath	= path.join( this.templateDir, templateName );

		fs.readFile( templatePath, 'utf8', ( err, str ) => {
			if ( ! err && str && str.length > 0 )
			{
				callback( false, this.parseRenderedTemplate( str, variables ) );
			}
			else
			{
				callback( 'ERROR WHILE RENDERING' );
			}
		});
	}

	/**
	 * @brief	Returns a match
	 *
	 * @param	line
	 * @param	js ! Optional
	 *
	 * @return	String
	 */
	getMatch( line, js = null )
	{
		let reExp	= /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;
		let code	= '';
		js	? ( code += line.match( reExp ) ? line + '\n' : 'r.push(' + line + ');\n' ) :
			( code += line !== '' ? 'r.push("' + line.replace( /"/g, '\\"' ) + '");\n' : '' );

		return code;
	}

	/**
	 * @see	TemplatingEngine::render();
	 */
	parseRenderedTemplate( template, variables )
	{
		let re	= /<%([^%>]+)?%>/g, code = 'var r=[];\n', cursor = 0, match;

		while( match = re.exec( template ) )
		{
			code	+= this.getMatch( template.slice( cursor, match.index ) );
			code	+= this.getMatch( match[1], true );
			cursor	= match.index + match[0].length;
		}
		code	+= this.getMatch( template.substr( cursor, template.length - cursor ) );
		code	+= 'return r.join("");';

		let result	= new Function( code.replace( /[\r\t\n]/g, '' ) ).apply( variables );
		return result;
	}
}

// Export the module
module.exports	= BaseTemplatingEngine;
