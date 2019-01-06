'use strict';

const PluginInterface		= require( './../plugin_interface' );
const { BodyParserHandler }	= require( './../../components/body_parsers/body_parser_handler' );

class BodyParserPlugin extends PluginInterface
{
	/**
	 * @brief	Adds a body parsing middleware
	 *
	 * @details	This plugin can be configured multiple times if needed and reused. If other plugins have similar functionality
	 * 			this plugin will not overwrite their properties
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		let pluginMiddleware	= {
			handler	: ( event ) =>
			{
				if ( event.body == null )
				{
					event.body	= {};

					event.on( 'cleanUp', ()=>{
						event.body	= undefined;
					} );
				}

				let bodyParserHandler	= new BodyParserHandler( event, this.options );
				bodyParserHandler.parseBody( event.next );
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= BodyParserPlugin;