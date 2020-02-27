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
	constructor()
	{
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
		if ( this.options.streams.constructor === Array )
		{
			for ( const index in this.options.streams )
			{
				const streamConfig	= this.options.streams[index];
				const streamOptions	= typeof streamConfig.options === 'object' ? streamConfig.options : [];
				let stream			= typeof streamConfig.instance === 'function' ? streamConfig.instance : null;

				if ( stream === null )
				{
					throw new Error( 'Invalid configuration' );
				}

				stream	= stream.getInstance( streamOptions );

				if ( stream instanceof FileStream )
				{
					this.fileStreams.push( stream );
				}
			}
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
		for ( const index in this.fileStreams )
		{
			formats	= formats.concat( this.fileStreams[index].SUPPORTED_FORMATS );
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
		for ( const index in this.fileStreams )
		{
			const fileStream	= this.fileStreams[index];
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
