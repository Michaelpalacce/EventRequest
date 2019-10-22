'use strict';

const PluginInterface	= require( '../plugin_interface' );
const fs				= require( 'fs' );
const path				= require( 'path' );

/**
 * @brief	Templating engine plugin that attaches a render functionality to the eventRequest
 */
class TemplatingEnginePlugin extends PluginInterface
{
	/**
	 * @brief	Attaches a render function to the event request
	 *
	 * @param	EventRequest eventRequest
	 *
	 * @return	void
	 */
	attachRenderFunction( eventRequest )
	{
		/**
		 * @brief	Renders the template given
		 *
		 * @param	String templateName
		 * @param	Object variables
		 * @param	Callable callback
		 *
		 * @return	String
		 */
		eventRequest.render	= function( templateName, variables = {}, callback = ()=>{} )
		{
			this.emit( 'render', { templateName, variables, callback } );

			templateName	= typeof templateName === 'string' && templateName.length > 0
							? templateName + '.html'
							: false;

			if ( templateName !== false )
			{
				let templatePath	= path.join( this.templateDir, templateName );

				fs.readFile( templatePath, 'utf8', ( err, html ) => {
					if ( ! err && html && html.length > 0  && ! this.isFinished() )
					{
						let result	= this.templatingEngine.render( html, variables );
						this.send( result, 200, true );
						callback( false );
					}
					else
					{
						this.sendError( 'Error while rendering', 500 );
						callback( err );
					}
				});
			}
			else
			{
				this.sendError( 'Error while rendering', 500 );
				callback( 'Error while rendering' )
			}
		}
	}

	/**
	 * @brief	Attaches the templating engine and template dir to the event request
	 *
	 * @details	Also adds a render function to the eventRequest
	 * 			Accepted options:
	 * 			- engine - Object - Instance of a templating engine that has a method render defined that accepts
	 * 				html as first argument, object of variables as second and a callback as third
	 * 			- templateDir - string - the directory where all the templates are stored
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		let templatingEngine	= typeof this.options.engine !== 'undefined'
								&& typeof this.options.engine.render !== 'undefined'
								? this.options.engine
								: false;

		let templateDir			= typeof this.options.templateDir !== 'undefined'
								? this.options.templateDir
								: false;

		if ( templatingEngine === false || templateDir === false )
		{
			throw new Error( 'Invalid templating config provided.' );
		}

		let pluginMiddleware	= {
			handler	: ( event ) =>{
				event.templateDir		= templateDir;
				event.templatingEngine	= templatingEngine;

				event.on( 'cleanUp', ()=>{
					event.templateDir		= undefined;
					event.templatingEngine	= undefined;
				} );

				this.attachRenderFunction( event );
				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= TemplatingEnginePlugin;