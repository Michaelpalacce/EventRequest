'use strict';

const PluginInterface			= require( '../plugin_interface' );
const path						= require( 'path' );
const DefaultTemplatingEngine	= require( '../../components/templating_engine/default_templating_engine' );

const PROJECT_ROOT				= path.parse( require.main.filename ).dir;
const DEFAULT_TEMPLATING_DIR	= path.join( PROJECT_ROOT, './public' );
const DEFAULT_TEMPLATE_EXT		= 'html';

/**
 * @brief	Templating engine plugin that attaches a render functionality to the eventRequest
 */
class TemplatingEnginePlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );

		this.templatingEngine	= null;
		this.templateDir		= null;
		this.templateExtension	= null;

		this.setOptions( options );
	}

	/**
	 * @brief	Attaches a render function to the event request
	 *
	 * @param	{EventRequest} eventRequest
	 *
	 * @return	void
	 */
	attachRenderFunction( eventRequest )
	{
		/**
		 * @brief	Renders the template given
		 *
		 * @param	{String} templateName
		 * @param	{Object} variables
		 *
		 * @return	Promise
		 */
		eventRequest.render	=  ( templateName, variables = {} ) => {
			return new Promise( async ( resolve,reject ) => {
				templateName	= typeof templateName === 'string' && templateName.length > 0
								? `${templateName}.${this.templateExtension}`
								: `index.${this.templateExtension}`;

				this.render( path.resolve( path.join( this.templateDir, templateName ) ), variables ).then( ( result )=>{
					if ( result && result.length > 0  && ! eventRequest.isFinished() )
					{
						eventRequest.setResponseHeader( 'Content-Type', 'text/html' ).send( result );

						resolve();
					}
					else
					{
						reject( { code: 'app.err.templatingEngine.errorRendering' } );
					}
				}).catch( reject );
			});
		};
	}

	/**
	 * @details	The render function should return a promise
	 * 			The render function should accept the template location as a first argument and the variables as second
	 * 			The templateDir must be a real directory, relative and absolute paths are ok
	 * 			The templateExtension can be anything extension e.g. 'html', 'ejs'. The dot must not be added
	 * 			Note that when you pass a function, if that function uses 'this' anywhere it will point to the templatingEnginePlugin
	 * 				due to the way JS behaves. Consider binding the function to the correct instance before passing:
	 * 				https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind
	 *
	 * @param	{Object} options
	 */
	setOptions( options )
	{
		const defaultTemplatingEngine	= new DefaultTemplatingEngine();

		this.render						= typeof options.render === 'function'
										? options.render
										: defaultTemplatingEngine.renderFile.bind( defaultTemplatingEngine );

		this.templateDir				= typeof options.templateDir === 'string'
										? options.templateDir
										: DEFAULT_TEMPLATING_DIR;

		this.templateExtension			= typeof options.templateExtension === 'string'
										? options.templateExtension
										: DEFAULT_TEMPLATE_EXT;
	}

	/**
	 * @brief	Attaches the templating engine and template dir to the event request
	 *
	 * @details	Also adds a render function to the eventRequest
	 *
	 * @return	{Array}
	 */
	getPluginMiddleware()
	{
		const pluginMiddleware	= {
			handler	: ( event ) => {
				this.attachRenderFunction( event );

				event.on( 'cleanUp', () => {
					event.render	= undefined;
				});

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= TemplatingEnginePlugin;