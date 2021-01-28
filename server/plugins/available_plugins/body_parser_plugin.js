'use strict';

const PluginInterface	= require( './../plugin_interface' );

class BodyParserPlugin extends PluginInterface
{
	/**
	 * @param	{JsonBodyParser|MultipartDataParser|RawBodyParser|FormBodyParser} parser
	 * @param	{String} pluginId
	 * @param	{Object} [options={}]
	 */
	constructor( parser, pluginId, options = {} )
	{
		super( pluginId, options );

		this.parserClass	= parser;
		this.parserOptions	= options;

		this.setOptions( options );
	}

	/**
	 * @brief	Set the parser if given
	 *
	 * @param	{Object} [options={}]
	 *
	 * @return	void
	 */
	setOptions( options = {} )
	{
		super.setOptions( options );

		this.parserOptions	= options;
	}

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
		const pluginMiddleware	= {
			handler	: ( event ) =>
			{
				if ( event.body !== null && event.body !== undefined )
					return event.next();

				const ParserClass	= this.parserClass;
				const parser		= new ParserClass( this.parserOptions );

				if ( parser.supports( event ) )
				{
					event.body		= {};
					event.rawBody	= {};

					event.on( 'cleanUp', () => {
						event.body		= undefined;
						event.rawBody	= undefined;
					});

					parser.parse( event ).then( ( parsedData ) => {
						event.body		= typeof parsedData.body === 'undefined' ? {} : parsedData.body;
						event.rawBody	= typeof parsedData.rawBody === 'undefined' ? {} : parsedData.rawBody;

						event.next();
					} ).catch( event.next );
					return ;
				}

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= BodyParserPlugin;