'use strict';

const PluginInterface					= require( './plugin_interface' );
const FileStreamHandlers				= require( './../components/file_streams/file_stream_handler' );
const { FileStreamHandler, FileStream }	= FileStreamHandlers;
const { Mp4FileStream, TextFileStream }	= FileStreamHandlers;

/**
 * @brief	File stream handler responsible for attaching FileStreams to the eventRequest
 */
class FileStreamHandlerPlugin extends PluginInterface
{
	/**
	 * @brief	Attaches the function stream file to the event
	 *
	 * @param	EventRequest event
	 *
	 * @return	void
	 */
	attachFunctions( event )
	{
		/**
		 * @brief	Streams files
		 *
		 * @details	The file must be the absolute path to the file to be streamed
		 *
		 * @param	String file
		 * @param	Object options
		 *
		 * @return	void
		 */
		event.streamFile	= function( file, options )
		{
			let fileStream	= this.fileStreamHandler.getFileStreamerForType( file );

			if ( fileStream !== null && fileStream instanceof FileStream )
			{
				fileStream.stream( file, options );
			}
			else
			{
				this.next( 'Could not find a FileStream that supports that format' )
			}
		}
	}

	/**
	 * @brief	Gets the plugin middlewares to attach to the event request
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		let pluginMiddleware	= ( event ) => {
			event.fileStreamHandler	= new FileStreamHandler( event );

			this.attachFunctions( event );

			event.next();
		};

		return [pluginMiddleware];
	}
}

module.exports	= FileStreamHandlerPlugin;
