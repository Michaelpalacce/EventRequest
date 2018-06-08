'use strict';

// Dependencies
const os			= require( 'os' );
const path			= require( 'path' );
const fs			= require( 'fs' );
const BodyParser	= require( './body_parser' );
const events		= require( 'events' );

const EventEmitter	= events.EventEmitter;

/**
 * @brief	Constants
 */
const CONTENT_DISPOSITION_INDEX				= 0;
const CONTENT_TYPE_INDEX					= 1;
const CONTENT_LENGTH_HEADER					= 'content-length';
const CONTENT_TYPE_HEADER					= 'content-type';
const BOUNDARY_REGEX						= /boundary=(\S+[^\s])/;
const CONTENT_DISPOSITION					= 'content-disposition';
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
const RANDOM_NAME_LENGTH					= 20;
const DATA_TYPE_FILE						= 'file';

let STATE_START						= 0;
let STATE_START_BOUNDARY			= 1;
let STATE_HEADER_FIELD_START		= 2;
let STATE_HEADERS_DONE				= 3;
let STATE_PART_DATA_START			= 4;
let STATE_PART_DATA					= 5;
let STATE_CLOSE_BOUNDARY			= 6;
let STATE_END						= 7;

/**
 * @brief	FormParser used to parse multipart data
 *
 * @TODO	Figure out how to get the offset of the buffer value without regex
 */
class MultipartFormParser extends BodyParser
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
	constructor( options = {} )
	{
		super( options );

		this.bufferSize				= this.options.BufferSize || DEFAULT_BUFFER_SIZE;
		this.extendedTimeout		= this.options.extendedTimeout == undefined ? false : this.options.extendedTimeout;
		this.extendedMilliseconds	= this.options.extendedMilliseconds || 10;
		this.maxPayload				= this.options.maxPayload || 0;
		this.tempDir				= this.options.tempDir || os.tmpdir();
		this.saveFiles				= this.options.saveFiles || false;

		this.payloadLength			= 0;
		this.eventEmitter			= new EventEmitter();
		this.parsingError			= false;
		this.ended					= false;
		this.parts					= [];
	}

	/**
	 * @brief	Form a part with default properties
	 *
	 * @return	Object
	 */
	formPart()
	{
		return {
			type				: '',
			filePath			: null,
			fileName			: '',
			file				: null,
			size				: 0,
			state				: STATE_START,
			buffer				: Buffer.alloc( 0 )
		}
	}

	/**
	 * @brief	Get the current part data
	 *
	 * @return	Object
	 */
	getPartData()
	{
		let length	= this.parts.length;
		if ( length > 0 )
		{
			return this.parts[length - 1];
		}
		else
		{
			this.parts.push( this.formPart() );
			return this.parts[0];
		}
	}

	/**
	 * @brief	Callback called when data is received by the server
	 *
	 * @param	Buffer chunk
	 *
	 * @return	void
	 */
	onDataReceivedCallback( chunk )
	{
		this.payloadLength	+= chunk.length;

		if ( this.extendedTimeout )
		{
			this.event.extendTimeout( this.extendedMilliseconds );
		}

		try
		{
			this.extractChunkData( chunk );
		}
		catch ( e )
		{
			this.eventEmitter.emit( 'error', e );
		}
	}

	/**
	 * @brief	Flushes the given buffer to the part.file stream
	 *
	 * @param	Object part
	 * @param	Buffer buffer
	 *
	 * @return	void
	 */
	flushBuffer( part, buffer )
	{
		if ( part.file === null )
		{
			this.handleError( 'Cannot flush buffer to a file stream that does not exist.' );
		}
		else
		{
			part.file.write( buffer );
			part.size	+= buffer.length;
		}
	}

	extractChunkData( chunk )
	{
		let boundary		= DEFAULT_BOUNDARY_PREFIX + this.headerData.boundary;
		let part			= this.getPartData();
		let boundaryOffset	= 0;
		let bufferLength	= 0;
		part.buffer			= Buffer.concat( [part.buffer, chunk] );

		while ( true )
		{
			switch ( part.state )
			{
				case STATE_START:
					part.state	= STATE_START_BOUNDARY;
				case STATE_START_BOUNDARY:
					bufferLength	= part.buffer.length;

					if ( bufferLength < boundary.length )
					{
						if ( this.hasFinished() )
						{
							this.handleError( 'Could not get the starting boundary' );
						}
						return;
					}

					boundaryOffset	= part.buffer.indexOf( boundary );
					if ( boundaryOffset === -1 )
					{
						this.handleError( 'Boundary data not set' );
						return;
					}

					part.state	= STATE_HEADER_FIELD_START;
					part.buffer	= part.buffer.slice( boundaryOffset + boundary.length + SYSTEM_EOL_LENGTH );
					continue;

				case STATE_HEADER_FIELD_START:
					let lineCount				= 0;
					let contentTypeLine			= '';
					let contentDispositionLine	= '';
					let read					= part.buffer.toString( 'ascii' );
					let idxStart				= 0;

					let line, idx;

					while ( ( idx = read.indexOf( SYSTEM_EOL, idxStart ) ) !== -1 )
					{
						line	= read.substring( idxStart, idx );

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
							break;
						}

						idxStart	= idx + SYSTEM_EOL_LENGTH;
						++ lineCount;
					}

					if ( contentDispositionLine === '' || contentTypeLine === '' )
					{
						if ( this.hasFinished() )
						{
							this.handleError( 'Content Disposition or Content Type not sent' );
						}
						return;
					}

					// Should be in the beginning of the payload
					part.buffer		= part.buffer.slice( idxStart + SYSTEM_EOL_LENGTH );
					part.state		= STATE_HEADERS_DONE;

					let filename	= contentDispositionLine.match( CONTENT_DISPOSITION_FILENAME_REGEX );
					let name		= contentDispositionLine.match( CONTENT_DISPOSITION_NAME_REGEX );
					filename		= filename === null ? filename : filename[1];
					name			= name === null ? name : name[1];

					if ( filename !== null && name !== null )
					{
						// File input being parsed
						part.filePath	= path.join( this.tempDir, this.getRandomFileName( RANDOM_NAME_LENGTH ) );
						part.fileName	= filename;
						part.type		= DATA_TYPE_FILE;
					}
					else if ( name !== null )
					{
						console.log( name );
						// Multipart form param being parsed do nothing yet
					}
					else
					{
						this.handleError( 'Could not parse Content Disposition' );
						return;
					}

					continue;
				case STATE_HEADERS_DONE:
					part.state		= STATE_PART_DATA_START;

				case STATE_PART_DATA_START:
					if ( part.type === DATA_TYPE_FILE )
					{
						if ( part.file === null )
						{
							part.file	= fs.createWriteStream( part.filePath, { flag : 'a' } );
							part.state	= STATE_PART_DATA;
							console.log( 'OPENED FILE TO WRITE: ', part.filePath );
						}
						else
						{
							this.handleError( 'Tried to create a new write stream' );
							return;
						}
					}
					else
					{
						part.state	= STATE_END;
						return;
					}

				case STATE_PART_DATA:
					boundaryOffset	= part.buffer.indexOf( boundary );

					if ( boundaryOffset === -1 )
					{
						if ( this.hasFinished() )
						{
							this.handleError( 'Invalid end of data' );
							return;
						}

						// Flush out the buffer and set it to an empty buffer so next time we set the data correctly
						let leaveBuffer	= 10;
						this.flushBuffer( part, part.buffer.slice( 0, part.buffer.length - leaveBuffer ) );
						part.buffer	= part.buffer.slice( part.buffer.length - leaveBuffer );
						return;
					}
					else
					{
						part.file.write( part.buffer.slice( 0, boundaryOffset - SYSTEM_EOL_LENGTH ) );
						part.file.end();

						part.buffer	= part.buffer.slice( boundaryOffset );
						part.state	= STATE_CLOSE_BOUNDARY;
						continue;
					}
					break;

				case STATE_CLOSE_BOUNDARY:

					bufferLength	= part.buffer.length;

					if ( bufferLength < boundary.length )
					{
						if ( this.hasFinished() )
						{
							this.handleError( 'Could not get the starting boundary' );
						}
						return;
					}

					boundaryOffset	= part.buffer.indexOf( boundary );
					if ( boundaryOffset === -1 )
					{
						this.handleError( 'Boundary data not set' );
						return;
					}

					part.state	= STATE_END;
					part.buffer	= part.buffer.slice( boundaryOffset + boundary.length + SYSTEM_EOL_LENGTH + SYSTEM_EOL_LENGTH );
					continue;

				case STATE_END:
					console.log( STATE_END );
					console.log( part.buffer.length );
					if ( part.buffer.length > 0 )
					{
						part.state	= STATE_START;
					}
					else
					{
						// End of parsing
						delete part.file;
						delete part.buffer;
						this.eventEmitter.emit( 'parsingComplete', this.getPartData() )
					}

					return;
				default:
					this.handleError( 'Invalid state' );
					return;
			}
		}
	}

	/**
	 * @brief	Check if the body parsing has finished
	 *
	 * @return	Boolean
	 */
	hasFinished()
	{
		return this.event.isFinished() || this.parsingError === true || this.ended === true;
	}

	/**
	 * @brief	Emits an event with an error
	 *
	 * @param	mixed message
	 *
	 * @return	void
	 */
	handleError( message )
	{
		throw new Error( message );
	}

	/**
	 * @brief	Get a random file name given a size
	 *
	 * @param	Number size
	 *
	 * @return	String
	 */
	getRandomFileName( size )
	{
		let text		= "";
		let possible	= "abcdefghijklmnopqrstuvwxyz0123456789";

		for ( let i = 0; i < size; ++ i )
			text	+= possible.charAt( Math.floor( Math.random() * possible.length ) );

		return text;
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
		let start	= Date.now();
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

		this.headerData	= headerData;
		this.event		= event;

		this.eventEmitter.on( 'error', ( err )=>{
			callback( err );
			this.parsingError	= true;
		});

		this.eventEmitter.on( 'end', ()=>{
			this.ended	= true;
		});

		this.eventEmitter.on( 'parsingComplete', ( files )=>{
			console.log( files );
			callback( false );
		});

		let self			= this;
		event.request.on( 'data', ( chunk ) =>
		{
			if ( ! this.hasFinished() )
			{
				self.onDataReceivedCallback( chunk );
			}
		});

		event.request.on( 'end', () => {
			if ( ! this.hasFinished() )
			{
				this.eventEmitter.emit( 'end' );
				// Clean up
			}
		});
	}
}

// Export the module
module.exports	= MultipartFormParser;



//
// /**
//  * @brief	Separate the payload given in boundary chunks
//  *
//  * @param	Buffer chunk
//  * @param	Object headerData
//  *
//  * @return	Object
//  */
// separateChunks( chunk, headerData )
// {
// 	let boundary		= DEFAULT_BOUNDARY_PREFIX + headerData.boundary;
// 	let currentPosition	= 0;
// 	let parts			= [];
// 	let sizeToSlice		= currentPosition + this.bufferSize + BUFFER_REDUNDANCY;
// 	let read;
//
// 	while ( read = chunk.slice( currentPosition, currentPosition + sizeToSlice ), read.length !== 0 )
// 	{
// 		let offset	= read.indexOf( boundary );
//
// 		if ( offset > this.bufferSize || offset === -1 )
// 		{
// 			currentPosition	+= this.bufferSize;
// 			continue;
// 		}
//
// 		let partPosition	= currentPosition + offset;
// 		parts.push( partPosition );
// 		currentPosition		= partPosition + boundary.length;
// 	}
//
// 	let chunks	= [];
//
// 	for ( let i = 0; i < parts.length; ++ i )
// 	{
// 		if ( ( i + 1 ) !== parts.length )
// 		{
// 			let currentPart		= parts[i];
// 			let nextPart		= parts[i + 1];
// 			chunks.push( chunk.slice(
// 				currentPart + headerData.boundary.length + SYSTEM_EOL_LENGTH + REDUNDANT_EMPTY_LINE_LENGTH,
// 				nextPart - REDUNDANT_EMPTY_LINE_LENGTH
// 			));
// 		}
// 	}
//
// 	return chunks;
// }

// /**
//  * @brief	Extracts all the data from the split chunks
//  *
//  * @param	Array chunks
//  *
//  * @return	Object
//  */
// extractChunkDataFromChunks( chunks )
// {
// 	let chunkData	= {
// 		files		: [],
// 		bodyData	: {}
// 	};
//
// 	for ( let index in chunks )
// 	{
// 		let chunk					= chunks[index];
// 		let lineCount				= 0;
// 		let currentPosition			= 0;
// 		let leftOver				= '';
// 		let contentTypeLine			= '';
// 		let contentDispositionLine	= '';
// 		let read, line, idxStart, idx;
//
// 		// Loop just in case but it should not have to loop more than once
// 		dataLoop:
// 			while ( ( read	= chunk.slice( currentPosition, 5242880 ) ), read.length !== 0 )
// 			{
// 				leftOver	+= read.toString( DEFAULT_BUFFER_ENCODING );
// 				idxStart	= 0;
//
// 				// Ideally should not happen
// 				if ( idx = leftOver.indexOf( SYSTEM_EOL, idxStart ) === -1 )
// 				{
// 					break;
// 				}
//
// 				while ( ( idx = leftOver.indexOf( SYSTEM_EOL, idxStart ) ) !== -1 )
// 				{
// 					line	= leftOver.substring( idxStart, idx );
//
// 					if ( lineCount === CONTENT_DISPOSITION_INDEX )
// 					{
// 						contentDispositionLine	= line;
// 					}
// 					else if ( lineCount === CONTENT_TYPE_INDEX )
// 					{
// 						contentTypeLine	= line
// 					}
// 					else
// 					{
// 						break dataLoop;
// 					}
//
// 					idxStart	= idx + SYSTEM_EOL_LENGTH;
// 					++ lineCount;
// 				}
//
// 				leftOver	= leftOver.substring( idxStart );
// 			}
//
// 		let metadataToRemove	= contentDispositionLine.length + SYSTEM_EOL_LENGTH;
//
// 		if ( contentTypeLine.length !== 0 )
// 		{
// 			// metadata to remove in case of a file upload
// 			metadataToRemove	+= contentTypeLine.length + SYSTEM_EOL_LENGTH + REDUNDANT_EMPTY_LINE_LENGTH;
// 		}
// 		else
// 		{
// 			// Metadata to remove in case of a multipart form param
// 			metadataToRemove	+= REDUNDANT_EMPTY_LINE_LENGTH;
// 		}
//
// 		let filename	= contentDispositionLine.match( CONTENT_DISPOSITION_FILENAME_REGEX );
// 		let name		= contentDispositionLine.match( CONTENT_DISPOSITION_NAME_REGEX );
// 		filename		= filename === null ? filename : filename[1];
// 		name			= name === null ? name : name[1];
//
// 		if ( filename !== null && name !== null )
// 		{
// 			// File input being parsed
// 			chunk			= chunk.slice( metadataToRemove );
// 			let filePath	= path.join( this.tempDir, filename );
// 			let data		= {};
//
// 			if ( this.saveFiles )
// 			{
// 				if ( ! fs.writeFileSync( filePath, chunk , 'binary' ) )
// 				{
// 					continue;
// 				}
//
// 				data	= {
// 					filename	: filename,
// 					path		: filePath
// 				};
// 			}
// 			else
// 			{
// 				data	= {
// 					filename	: filename,
// 					chunk		: chunk
// 				};
// 			}
// 			chunkData.files.push( data );
// 		}
// 		else if ( name !== null )
// 		{
// 			// Multipart form param being parsed
// 			chunkData.bodyData[name]	= chunk.slice( metadataToRemove ).toString( DEFAULT_BUFFER_ENCODING );
// 		}
// 	}
//
// 	return chunkData;
// }