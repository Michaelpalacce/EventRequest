'use strict';

// Dependencies
const fs				= require( 'fs' );
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
	 * @property	{String} file
	 *
	 * @return	VideoFileStream|AudioFileStream|ImageFileStream|TextFileStream|null
	 */
	getFileStreamerForType	: ( file ) => {
		const fileStreams	= [
			new VideoFileStream(),
			new AudioFileStream(),
			new ImageFileStream(),
			new TextFileStream()
		];

		if ( typeof file !== 'string' || ! fs.existsSync( file ) )
			return null;

		for ( const fileStream of fileStreams )
			if ( fileStream.supports( file ) )
				return fileStream;

		return null;
	}
};
