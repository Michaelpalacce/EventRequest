'use strict';

const PluginInterface	= require( './../plugin_interface' );
const BodyParserHandler	= require( './../../components/body_parsers/body_parser_handler' );

class BodyParserPlugin extends PluginInterface
{
	/**
	 * @param	BodyParser parser
	 * @param	String pluginId
	 * @param	Object options
	 */
	constructor( parser, pluginId, options = {} )
	{
		super( pluginId, options );

		this.parserClass		= parser;
		this.parser				= null;
		this.bodyParserHandler	= null;
		this.shouldAttach		= false;

		this.setOptions( options );
	}

	/**
	 * @brief	Set the parser if given
	 *
	 * @param	options
	 *
	 * @return	void
	 */
	setOptions( options = {} )
	{
		super.setOptions( options );

		this.parser	= new this.parserClass( options );
	}

	/**
	 * @brief	Creates the server body parsers if they do not exist
	 *
	 * @param	Server server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		this.server	= server;

		if ( typeof this.server.pluginBag.bodyParserHandler === 'undefined' )
		{
			this.bodyParserHandler					= new BodyParserHandler();
			this.server.pluginBag.bodyParserHandler	= this.bodyParserHandler;
			this.shouldAttach	= true;
		}
		else
		{
			this.bodyParserHandler	= this.server.pluginBag.bodyParserHandler;
		}

		if ( this.parser )
		{
			this.bodyParserHandler.addParser( this.parser );
		}
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

				this.bodyParserHandler.parseBody( event ).then(( data )=>{
					event.body	= data;
					event.next();
				}).catch( event.next );
			}
		};

		return this.shouldAttach ? [pluginMiddleware] : [];
	}
}

module.exports	= BodyParserPlugin;