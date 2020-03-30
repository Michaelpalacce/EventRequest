'use strict';

const PluginInterface	= require( '../plugin_interface' );
const CSP				= require( '../../components/security/content_security_policy' );
const HSTS				= require( '../../components/security/http_strict_transport_security' );

/**
 * @brief	Security Plugin that allows you to add different HTTP security headers
 */
class SecurityPlugin extends PluginInterface
{
	constructor( pluginId, options = null )
	{
		if ( options === null )
		{
			options	= {
				build: true,
				csp: { xss: true }
			};
		}

		super( pluginId, options );
	}

	/**
	 * @brief	Attaches all the security modules
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		const middlewares	= [];

		middlewares.push(( event )=>{
			event.$security		= {
				modules	: {
					csp		: new CSP( typeof this.options.csp === 'object' ? this.options.csp : {} ),
					hsts	: new HSTS( typeof this.options.hsts === 'object' ? this.options.hsts : {} ),
				}
			};

			event.$security.build	= ()=>{
				for ( const index in event.$security.modules )
				{
					const module	= event.$security.modules[index];

					event.setHeader( module.getHeader(), module.build() );
				}
			};

			if ( this.options.build === true )
			{
				event.$security.build();
			}

			event.next();
		});

		return middlewares;
	}
}

module.exports	= SecurityPlugin;