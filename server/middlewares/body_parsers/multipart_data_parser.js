'use strict';

// Dependencies
const os	= require( 'os' );
const path	= require( 'path' );
const fs	= require( 'fs' );

/**
 * @brief	Constants
 */
const CONTENT_DISPOSITION_INDEX				= 0;
const CONTENT_TYPE_INDEX					= 1;
const CONTENT_LENGTH_HEADER					= 'content-length';
const CONTENT_TYPE_HEADER					= 'content-type';
const BOUNDARY_REGEX						= /boundary=(\S+[^\s])/;
const CONTENT_DISPOSITION_NAME_REGEX		= /\bname="(.+)"/;
const CONTENT_DISPOSITION_FILENAME_REGEX	= /\bfilename="(.+)"/;
const BUFFER_REDUNDANCY						= 70;
const SYSTEM_EOL							= os.EOL;
const SYSTEM_EOL_LENGTH						= SYSTEM_EOL.length;
const REDUNDANT_EMPTY_LINE_LENGTH			= SYSTEM_EOL_LENGTH;
const DEFAULT_BUFFER_ENCODING				= 'ascii';
const DEFAULT_BOUNDARY_PREFIX				= '--';
const DEFAULT_BUFFER_SIZE					= 5242880; // 5 MB
const MULTIPART_PARSER_SUPPORTED_TYPE		= 'multipart/form-data';
const PARSER_ID								= 'MultipartFormParser';

/**
 * @brief	FormParser used to parse multipart data
 *
 * @TODO	Figure out how to get the offset of the buffer value without regex
 */
class MultipartFormParser
{
	/**
	 * @param	BodyParser bodyParser
	 * @param	Object options
	 * 			Accepts options:
	 * 			- BufferSize - Number - The size of the buffer when reading
	 * 			( smaller means slower but more memory efficient)
	 * 			- extendedTimeout - Boolean - Sets whether the event. timeout will be extended when receiving the body
	 * 			- extendedMilliseconds - Number - The amount of milliseconds to extend the event timeout with
	 * 			- maxPayload - Number - Maximum payload in bytes to parse if set to 0 means infinite
	 * 			- tempDir - String - The directory where to keep the uploaded files before moving
	 * 			- saveFiles - Boolean - This will save the files in the specified tempDir if not it will only keep
	 * 			them as a buffer ( This modifies the files set in event. Each file will no longer have a 'chunk' set within it
	 * 			but a new param: path will be provided which will point to the exact spot of the file on the OS )
	 */
	constructor( bodyParser, options = {} )
	{
		this.bodyParser				= bodyParser;
		this.bufferSize				= options.BufferSize || DEFAULT_BUFFER_SIZE;
		this.extendedTimeout		= options.extendedTimeout == undefined ? false : options.extendedTimeout;
		this.extendedMilliseconds	= options.extendedMilliseconds || 10;
		this.maxPayload				= options.maxPayload || 0;
		this.tempDir				= options.tempDir || os.tmpdir();
		this.saveFiles				= options.saveFiles || false;
	}

	/**
	 * @brief	Gets the id of the parser used to reference it by
	 *
	 * @return	String
	 */
	static getId()
	{
		return PARSER_ID;
	}

	/**
	 * @brief	Return if the current body type is supported by the current body parser
	 *
	 * @param	RequestEvent event
	 *
	 * @return	Boolean
	 */
	supports( event )
	{
		let contentType	= event.headers[CONTENT_TYPE_HEADER];
		return typeof contentType === 'string' && contentType.match( MULTIPART_PARSER_SUPPORTED_TYPE ) !== null
	}

	/**
	 * @brief	Get header data from event
	 *
	 * @details	Will return false on error
	 *
	 * @param	Object headers
	 *
	 * @return	Object|Boolean
	 */
	static getHeaderData( headers )
	{
		let contentType		= typeof headers[CONTENT_TYPE_HEADER] === 'string'
							? headers[CONTENT_TYPE_HEADER]
							: false;
		let contentLength	= typeof headers[CONTENT_LENGTH_HEADER] === 'string'
							? parseInt( headers[CONTENT_LENGTH_HEADER] )
							: false;

		if ( contentType === false || contentLength === false )
		{
			return false;
		}

		let boundary	= contentType.match( BOUNDARY_REGEX );

		if ( boundary === null )
		{
			return false;
		}

		return {
			contentLength	: contentLength,
			boundary		: boundary[1]
		}
	}

	/**
	 * @brief	Separate the payload given in boundary chunks
	 *
	 * @param	Buffer chunk
	 * @param	Object headerData
	 *
	 * @return	Object
	 */
	separateChunks( chunk, headerData )
	{
		let boundary		= DEFAULT_BOUNDARY_PREFIX + headerData.boundary;
		let currentPosition	= 0;
		let parts			= [];
		let sizeToSlice		= currentPosition + this.bufferSize + BUFFER_REDUNDANCY;
		let read;

		while ( read = chunk.slice( currentPosition, currentPosition + sizeToSlice ), read.length !== 0 )
		{
			let offset	= read.indexOf( boundary );

			if ( offset > this.bufferSize || offset === -1 )
			{
				currentPosition	+= this.bufferSize;
				continue;
			}

			let partPosition	= currentPosition + offset;
			parts.push( partPosition );
			currentPosition		= partPosition + boundary.length;
		}

		let chunks	= [];

		for ( let i = 0; i < parts.length; ++ i )
		{
			if ( ( i + 1 ) !== parts.length )
			{
				let currentPart		= parts[i];
				let nextPart		= parts[i + 1];
				chunks.push( chunk.slice(
					currentPart + headerData.boundary.length + SYSTEM_EOL_LENGTH + REDUNDANT_EMPTY_LINE_LENGTH,
					nextPart - REDUNDANT_EMPTY_LINE_LENGTH
				));
			}
		}

		return chunks;
	}

	/**
	 * @brief	Extracts all the data from the split chunks
	 *
	 * @param	Array chunks
	 *
	 * @return	Object
	 */
	extractChunkDataFromChunks( chunks )
	{
		let chunkData	= {
			files		: [],
			bodyData	: {}
		};

		for ( let index in chunks )
		{
			let chunk					= chunks[index];
			let lineCount				= 0;
			let currentPosition			= 0;
			let leftOver				= '';
			let contentTypeLine			= '';
			let contentDispositionLine	= '';
			let read, line, idxStart, idx;

			// Loop just in case but it should not have to loop more than once
			dataLoop:
				while ( ( read	= chunk.slice( currentPosition, 5242880 ) ), read.length !== 0 )
				{
					leftOver	+= read.toString( DEFAULT_BUFFER_ENCODING );
					idxStart	= 0;

					// Ideally should not happen
					if ( idx = leftOver.indexOf( SYSTEM_EOL, idxStart ) === -1 )
					{
						break;
					}

					while ( ( idx = leftOver.indexOf( SYSTEM_EOL, idxStart ) ) !== -1 )
					{
						line	= leftOver.substring( idxStart, idx );

						if ( lineCount === CONTENT_DISPOSITION_INDEX )
						{
							contentDispositionLine	= line;
						}
						else if ( lineCount === CONTENT_TYPE_INDEX )
						{
							contentTypeLine	= line
						}
						else
						{
							break dataLoop;
						}

						idxStart	= idx + SYSTEM_EOL_LENGTH;
						++ lineCount;
					}

					leftOver	= leftOver.substring( idxStart );
				}

			let metadataToRemove	= contentDispositionLine.length + SYSTEM_EOL_LENGTH;

			if ( contentTypeLine.length !== 0 )
			{
				// metadata to remove in case of a file upload
				metadataToRemove	+= contentTypeLine.length + SYSTEM_EOL_LENGTH + REDUNDANT_EMPTY_LINE_LENGTH;
			}
			else
			{
				// Metadata to remove in case of a multipart form param
				metadataToRemove	+= REDUNDANT_EMPTY_LINE_LENGTH;
			}

			let filename	= contentDispositionLine.match( CONTENT_DISPOSITION_FILENAME_REGEX );
			let name		= contentDispositionLine.match( CONTENT_DISPOSITION_NAME_REGEX );
			filename		= filename === null ? filename : filename[1];
			name			= name === null ? name : name[1];

			if ( filename !== null && name !== null )
			{
				// File input being parsed
				chunk			= chunk.slice( metadataToRemove );
				let filePath	= path.join( this.tempDir, filename );
				let data		= {};

				if ( this.saveFiles )
				{
					if ( ! fs.writeFileSync( filePath, chunk , 'binary' ) )
					{
						continue;
					}

					data	= {
						filename	: filename,
						path		: filePath
					};
				}
				else
				{
					data	= {
						filename	: filename,
						chunk		: chunk
					};
				}
				chunkData.files.push( data );
			}
			else if ( name !== null )
			{
				// Multipart form param being parsed
				chunkData.bodyData[name]	= chunk.slice( metadataToRemove ).toString( DEFAULT_BUFFER_ENCODING );
			}
		}

		return chunkData;
	}

	/**
	 * @brief	Called when a chunk of data is received
	 *
	 * @param	Array chunks - all the currently received chunks
	 * @param	RequestEvent event
	 *
	 * @return	void
	 */
	onDataCallback( chunks, event )
	{
		if ( this.extendedTimeout )
		{
			event.extendTimeout( this.extendedMilliseconds );
		}
	}

	/**
	 * @brief	Called when the body has been fully received
	 *
	 * @param	Buffer rawPayload
	 * @param	Object headerData
	 * @param	Function callback
	 *
	 * @return	void
	 */
	onEndCallback( rawPayload, headerData, callback )
	{
		if ( rawPayload.length === headerData.contentLength )
		{
			let chunks		= this.separateChunks( rawPayload, headerData );
			if ( chunks.length === 0 )
			{
				callback( 'No chunks found' );
			}
			else
			{
				let chunkData	= this.extractChunkDataFromChunks( chunks );
				callback( false, chunkData.bodyData, chunkData.files );
			}
		}
		else
		{
			callback( 'Provided content-length did not match payload length' );
		}
	}

	/**
	 * @brief	Parse the payload
	 *
	 * @param	Object headers
	 * @param	Buffer rawPayload
	 * @param	Function callback
	 *
	 * @return	void
	 */
	parse( event, callback )
	{
		let headerData;
		if ( ! ( headerData = MultipartFormParser.getHeaderData( event.headers ) ) )
		{
			callback( 'Could not retrieve the header data' );
			return;
		}

		if ( this.maxPayload !== 0 && this.maxPayload < headerData.contentLength )
		{
			callback( 'Max Payload data reached' );
			return;
		}

		let onDataCallbackCallback	= ( chunk ) =>{
			this.onDataCallback( chunk, event );
		};

		this.bodyParser.attachEvents( onDataCallbackCallback, ( rawPayload ) =>{
			this.onEndCallback( rawPayload, headerData, ( err, bodyData, files ) =>{
				if ( err )
				{
					callback( 'Could not parse data' );
				}
				else
				{
					event.extra.files	= files;
					event.body			= bodyData;
					files				= null;
					bodyData			= null;
					callback( false );
				}
			});
		});
	}
}

// Export the module
module.exports	= MultipartFormParser;


