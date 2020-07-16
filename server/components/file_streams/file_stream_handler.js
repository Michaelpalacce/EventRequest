'use strict';

// Dependencies
const VideoFileStream	= require( './video_file_stream' );
const AudioFileStream	= require( './audio_file_stream' );
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
				{ instance : VideoFileStream },
				{ instance : AudioFileStream },
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

				if ( typeof stream.supports === 'function' && typeof stream.getFileStream === 'function' )
				{
					this.fileStreams.push( stream );
				}
			}
		}
	}

	/**
	 * @brief	Gets the file streamer responsible for handling the given file type
	 *
	 * @details	Returns null if a file streamer is not found
	 *
	 * @param	{String} file
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
	AudioFileStream,
	VideoFileStream,
	TextFileStream
};
