'use strict';

// Dependencies
const FileStream		= require( './file_stream' );
const Mp4FileStream		= require( './mp4_file_stream' );
const TextFileStream	= require( './text_file_stream' );
const ImageFileStream	= require( './image_file_stream' );

/**
 * @brief	File streamer used to stream files
 */
class FileStreamHandler
{
	/**
	 * @param	EventRequest event
	 * @param	Object options
	 */
	constructor( event )
	{
		this.event			= event;
		this.fileStreams	= [];
		this.options		= {
			streams	: [
				{ instance : Mp4FileStream },
				{ instance : ImageFileStream },
				{ instance : TextFileStream }
			]
		};

		this.initStreams();
	}

	/**
	 * @brief	Initializes the file stream handler and adds all supported file streams
	 *
	 * @return	void
	 */
	initStreams()
	{
		try
		{
			if ( this.options.streams.constructor === Array )
			{
				for ( let index in this.options.streams )
				{
					let streamConfig	= this.options.streams[index];
					let stream			= typeof streamConfig.instance === 'function' ? streamConfig.instance : null;
					let streamOptions	= typeof streamConfig.options === 'object' ? streamConfig.options : [];

					if ( stream === null )
					{
						throw new Error( 'Invalid configuration' );
					}

					stream	= stream.getInstance( this.event, streamOptions );

					if ( stream instanceof FileStream )
					{
						this.fileStreams.push( stream );
					}
				}
			}
		}
		catch ( e )
		{
			this.event.next( 'Invalid configuration provided' );
		}
	}

	/**
	 * @brief	Get all supported file types from the added file streams
	 *
	 * @return	Array
	 */
	getSupportedTypes()
	{
		let formats	= [];
		for ( let index in this.fileStreams )
		{
			let fileStream  = this.fileStreams[index];
			formats	= formats.concat( fileStream.SUPPORTED_FORMATS );
		}

		return formats;
	}

	/**
	 * @brief	Gets the file streamer responsible for handling the given file type
	 *
	 * @details	Returns null if a file streamer is not found
	 *
	 * @param	String file
	 *
	 * @return	FileStream
	 */
	getFileStreamerForType( file )
	{
		for ( let index in this.fileStreams )
		{
			let fileStream  = this.fileStreams[index];
			if ( fileStream.supports( file ) )
			{
				return fileStream;
			}
		}

		return null;
	}
}

module.exports	= {
	FileStreamHandler,
	FileStream,
	Mp4FileStream,
	TextFileStream
};
