'use strict';

const PluginInterface	= require( './../plugin_interface' );
const BodyParserHandler	= require( './../../components/body_parsers/body_parser_handler' );

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

		this.parserClass		= parser;
		this.parserOptions		= options;
		this.shouldAttach		= false;

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
	 * @brief	Creates the server body parsers if they do not exist
	 *
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.server	= server;

		if ( typeof this.server.pluginBag.parsers === 'undefined' )
		{
			this.server.pluginBag.parsers	= [];
			this.shouldAttach				= true;
		}

		this.server.pluginBag.parsers.push({
			ParserClass:		this.parserClass,
			parserOptions:		this.parserOptions
		});
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
				{
					event.next();
					return;
				}

				event.body	= {};

				event.on( 'cleanUp', () => {
					event.body	= undefined;
				});

				const bodyParserHandler	= new BodyParserHandler();

				for ( const index in this.server.pluginBag.parsers )
				{
					/* istanbul ignore next */
					if ( ! {}.hasOwnProperty.call( this.server.pluginBag.parsers, index ) )
						continue;

					const parser							= this.server.pluginBag.parsers[index];
					const { parserOptions, ParserClass }	= parser;

					bodyParserHandler.addParser( new ParserClass( parserOptions ) );
				}

				bodyParserHandler.parseBody( event ).then( ( parsedData ) => {
					event.body		= typeof parsedData.body === 'undefined' ? {} : parsedData.body;
					event.rawBody	= typeof parsedData.rawBody === 'undefined' ? {} : parsedData.rawBody;

					event.next();
				} ).catch( event.next );
			}
		};

		return this.shouldAttach ? [pluginMiddleware] : [];
	}
}

module.exports	= BodyParserPlugin;