'use strict';

const PluginInterface			= require( '../plugin_interface' );
const fs						= require( 'fs' );
const path						= require( 'path' );
const DefaultTemplatingEngine	= require( '../../components/templating_engine/default_templating_engine' );
const PROJECT_ROOT				= path.parse( require.main.filename ).dir;
const DEFAULT_TEMPLATING_DIR	= path.join( PROJECT_ROOT, './public' );

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
		 * @param	Callable errorCallback
		 *
		 * @return	Promise
		 */
		eventRequest.render	= function( templateName, variables = {}, errorCallback = null )
		{
			const renderPromise	= new Promise(( resolve,reject )=>{
				templateName	= typeof templateName === 'string' && templateName.length > 0
								? templateName + '.html'
								: false;

				if ( templateName !== false )
				{
					const templatePath	= path.join( this.templateDir, templateName );

					fs.readFile( templatePath, 'utf8', ( err, html ) => {
						if ( ! err && html && html.length > 0  && ! this.isFinished() )
						{
							try
							{
								const result	= this.templatingEngine.render( html, variables );

								this.emit( 'render', { templateName, variables } );

								this.setHeader( 'Content-Type', 'text/html' );
								this.send( result, 200 );
								resolve();
							}
							catch ( e )
							{
								reject( e );
							}
						}
						else
						{
							reject( err );
						}
					});
				}
				else
				{
					reject( 'Error while rendering' )
				}
			});

			renderPromise.catch( errorCallback === null ? eventRequest.next : errorCallback );

			return renderPromise;
		}
	}

	/**
	 * @brief	Attaches the templating engine and template dir to the event request
	 *
	 * @details	Also adds a render function to the eventRequest
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		const templatingEngine	= typeof this.options.engine !== 'undefined'
								&& typeof this.options.engine.render !== 'undefined'
								? this.options.engine
								: new DefaultTemplatingEngine();

		const templateDir		= typeof this.options.templateDir !== 'undefined'
								? this.options.templateDir
								: DEFAULT_TEMPLATING_DIR;

		const pluginMiddleware	= {
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