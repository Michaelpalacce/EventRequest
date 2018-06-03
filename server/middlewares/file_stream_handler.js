'use strict';

// Dependencies
const FileStream		= require( './file_streams/file_stream' );
const Mp4FileStream		= require( './file_streams/mp4_file_stream' );
const TextFileStream	= require( './file_streams/text_file_stream' );

/**
 * @brief	File streamer used to stream files
 */
class FileStreamHandler
{
	/**
	 * @param	RequestEvent event
	 * @param	Object options
	 *
	 * @TODO	ADD OPTIONS like body_parser.js
	 */
	constructor( event, options )
	{
		this.event			= event;
		this.options		= typeof options !== 'undefined' ? options : [];
		this.fileStreams	= [];

		this.sanitizeConfig();
		this.initStreams();
	}

	/**
	 * @brief	Sanitizes the given configuration options
	 *
	 * @return	void
	 */
	sanitizeConfig()
	{
		this.baseOptions		= {};
		this.options.streams	= typeof this.options.streams === 'object' ? this.options.streams : [];
		let streams				= this.options.streams;

		if (
			streams.constructor === Array
			&& ( streams.indexOf( 'default' ) !== -1 || streams.length === 0 )
		) {
			let index	= streams.indexOf( 'default' );
			if ( index !== -1 )
				streams.splice( index, 1 );

			let defaultStreams	= [
				{ instance : Mp4FileStream },
				{ instance : TextFileStream }
			];

			this.options.streams	= defaultStreams.concat( streams );
		}
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

					stream	= stream.getInstance( this.event, Object.assign( this.baseOptions, streamOptions ) );

					if ( stream instanceof FileStream )
					{
						this.fileStreams.push( stream );
					}
				}
			}
		}
		catch ( e )
		{
			console.log( e );
			this.event.setError( 'Invalid configuration provided' );
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
	FileStreamHandler	: FileStreamHandler,
	FileStream			: FileStream,
	Mp4FileStream		: Mp4FileStream,
	TextFileStream		: TextFileStream
};