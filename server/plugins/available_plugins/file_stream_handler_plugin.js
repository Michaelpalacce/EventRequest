'use strict';

const PluginInterface	= require( '../plugin_interface' );
const fileStreamHandler	= require( '../../components/file_streams/file_stream_handler' );

/**
 * @brief	File stream handler responsible for attaching FileStreams to the eventRequest
 */
class FileStreamHandlerPlugin extends PluginInterface
{
	/**
	 * @brief	Attaches the function stream file to the event
	 *
	 * @param	{EventRequest} event
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
		 * @param	{String} file
		 * @param	{Object} [options={}]
		 *
		 * @return	ReadableStream | null
		 */
		event.getFileStream	= function( file, options = {} )
		{
			const fileStream	= this.fileStreamHandler.getFileStreamerForType( file );

			if ( fileStream !== null )
			{
				return fileStream.getFileStream( event, file, options );
			}
			else
			{
				return null;
			}
		};
		/**
		 * @brief	Streams files
		 *
		 * @details	The file must be the absolute path to the file to be streamed
		 *
		 * @param	{String }file
		 * @param	{Object} [options={}]
		 * @param	{Function }errCallback
		 *
		 * @return	void
		 */
		event.streamFile	= function( file, options = {}, errCallback )
		{
			const fileStream	= event.getFileStream( file, options );

			if ( fileStream !== null )
			{
				fileStream.pipe( event.response );
			}
			else
			{
				if ( typeof errCallback !== 'function' )
				{
					this.next( 'Could not find a FileStream that supports that format', 400 )
				}
				else
				{
					errCallback();
				}
			}
		};
	}

	/**
	 * @brief	Gets the plugin middlewares to attach to the event request
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		return [{
			handler	: ( event ) => {
				event.fileStreamHandler	= fileStreamHandler;

				this.attachFunctions( event );

				event.on( 'cleanUp', ()=>{
					event.fileStreamHandler	= undefined;
					event.getFileStream		= undefined;
					event.streamFile		= undefined;
				} );

				event.next();
			}
		}];
	}
}

module.exports	= FileStreamHandlerPlugin;
