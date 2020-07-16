'use strict';

// Dependencies
const VideoFileStream	= require( './video_file_stream' );
const AudioFileStream	= require( './audio_file_stream' );
const TextFileStream	= require( './text_file_stream' );
const ImageFileStream	= require( './image_file_stream' );

module.exports			= {
	/**
	 * @brief	Gets the file streamer responsible for handling the given file type
	 *
	 * @details	Returns null if a file streamer is not found
	 *
	 * @param	{String} file
	 *
	 * @return	FileStream
	 */
	getFileStreamerForType	: function( file )
	{
		const fileStreams	= [
			new VideoFileStream(),
			new AudioFileStream(),
			new ImageFileStream(),
			new TextFileStream()
		];

		for ( const index in fileStreams )
		{
			const fileStream	= fileStreams[index];
			if ( fileStream.supports( file ) )
			{
				return fileStream;
			}
		}

		return null;
	}
};
