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
const CONTENT_DISPOSITION_INDEX					= 0;
const CONTENT_TYPE_INDEX						= 1;
const CONTENT_LENGTH_HEADER						= 'content-length';
const CONTENT_TYPE_HEADER						= 'content-type';
const BOUNDARY_REGEX							= /boundary=(\S+[^\s])/;
const CONTENT_DISPOSITION						= 'content-disposition';
const CONTENT_DISPOSITION_NAME_CHECK_REGEX		= /\b(name=)/;
const CONTENT_DISPOSITION_FILENAME_CHECK_REGEX	= /\b(filename=)/;
const CONTENT_DISPOSITION_NAME_REGEX			= /\bname="([^"]+)"/;
const CONTENT_DISPOSITION_FILENAME_REGEX		= /\bfilename="([^"]+)"/;
const CONTENT_TYPE_GET_TYPE_REGEX				= /Content-Type:\s+(.+)$/;
const BUFFER_REDUNDANCY							= 70;
const SYSTEM_EOL								= os.EOL;
const SYSTEM_EOL_LENGTH							= SYSTEM_EOL.length;
const REDUNDANT_EMPTY_LINE_LENGTH				= SYSTEM_EOL_LENGTH;
const DEFAULT_BUFFER_ENCODING					= 'ascii';
const DEFAULT_BOUNDARY_PREFIX					= '--';
const DEFAULT_BUFFER_SIZE						= 5242880; // 5 MB
const MULTIPART_PARSER_SUPPORTED_TYPE			= 'multipart/form-data';
const RANDOM_NAME_LENGTH						= 20;
const DATA_TYPE_FILE							= 'file';
const DATA_TYPE_PARAMETER						= 'parameter';

let STATE_START					= 0;
let STATE_START_BOUNDARY		= 1;
let STATE_HEADER_FIELD_START	= 2;
let STATE_HEADERS_DONE			= 3;
let STATE_PART_DATA_START		= 4;
let STATE_PART_DATA				= 5;
let STATE_CLOSE_BOUNDARY		= 6;
let STATE_END					= 7;

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
		this.extendedMilliseconds	= this.options.extendedMilliseconds || 1000;
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
			name				: '',
			contentType			: '',
			size				: 0,
			state				: STATE_START,
			buffer				: Buffer.alloc( 0 )
		}
	}

	/**
	 * @brief	Upgrades the given data part and adds it DATA_TYPE_FILE properties
	 *
	 * @param	Object part
	 *
	 * @return	void
	 */
	upgradeToFileTypePart( part )
	{
		part.file		= null;
		part.filePath	= null;
		part.type		= DATA_TYPE_FILE;
	}

	/**
	 * @brief	Upgrades the given data part and adds it DATA_TYPE_PARAMETER properties
	 *
	 * @param	Object part
	 *
	 * @return	void
	 */
	upgradeToParameterTypePart( part )
	{
		part.type	= DATA_TYPE_PARAMETER;
		part.data	= Buffer.alloc( 0 );
	}

	/**
	 * @brief	Removes data part properties to prepare the part for exposure
	 *
	 * @param	Object part
	 *
	 * @return	void
	 */
	stripDataFromParts()
	{
		this.clearUpLastPart();

		for ( let index in this.parts )
		{
			let part	= this.parts[index];
			delete part.buffer;
			delete part.file;
			delete part.state;
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
		console.log( part.type );
		console.log( part.file !== null );
		if ( part.type === DATA_TYPE_PARAMETER )
		{
			part.data	= Buffer.concat( [part.data, buffer] );
		}
		else if ( part.type === DATA_TYPE_FILE && part.file !== null )
		{
			part.file.write( buffer );
		}
		else
		{
			this.handleError( 'Could not flush buffer!' );
		}

		part.size	+= buffer.length;
	}

	extractChunkData( chunk )
	{
		console.log( chunk.toString('ascii') );
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
					console.log( 'STATE_START' );
					part.state	= STATE_START_BOUNDARY;
					continue;
				case STATE_START_BOUNDARY:
					console.log( 'STATE_START_BOUNDARY' );
					bufferLength	= part.buffer.length;

					console.log( bufferLength );
					console.log( boundary.length );
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
					console.log( 'STATE_HEADER_FIELD_START' );
					let lineCount				= 0;
					let contentTypeLine			= null;
					let contentDispositionLine	= null;
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

					console.log( 'contentDispositionLine', contentDispositionLine );
					console.log( 'contentTypeLine', contentTypeLine );

					if ( contentDispositionLine === null || contentTypeLine === null || lineCount < 2 )
					{
						if ( this.hasFinished() )
						{
							this.handleError( 'Content Disposition or Content Type not sent' );
						}
						return;
					}

					// Should be in the beginning of the payload, so set state
					part.state		= STATE_HEADERS_DONE;

					// Get ContentDisposition data
					let filenameCheck	= contentDispositionLine.match( CONTENT_DISPOSITION_FILENAME_CHECK_REGEX );
					let nameCheck		= contentDispositionLine.match( CONTENT_DISPOSITION_NAME_CHECK_REGEX );
					let filename		= null;
					let name			= null;

					if ( filenameCheck !== null )
					{
						filename	= contentDispositionLine.match( CONTENT_DISPOSITION_FILENAME_REGEX );

						if ( filename === null )
						{
							this.handleError( 'Filename provided is invalid' );
						}

						filename	= filename[1];
					}

					if ( nameCheck !== null )
					{
						name	= contentDispositionLine.match( CONTENT_DISPOSITION_NAME_REGEX );

						if ( name === null )
						{
							this.handleError( 'Name provided is invalid' );
							return;
						}
						else
						{
							name	= name[1];
						}
					}
					else
					{
						this.handleError( 'Name provided is invalid' );
						return;
					}

					part.buffer		= part.buffer.slice( idxStart );

					if ( filename !== null && name !== null )
					{
						// File input being parsed
						this.upgradeToFileTypePart( part );
						part.buffer		= part.buffer.slice( SYSTEM_EOL_LENGTH );
						part.filePath	= path.join( this.tempDir, this.getRandomFileName( RANDOM_NAME_LENGTH ) );
						part.name		= filename;
					}
					else if ( name !== null )
					{
						// Multipart form param being parsed
						console.log( name );
						this.upgradeToParameterTypePart( part );
						part.name	= name;
					}
					else
					{
						this.handleError( 'Could not parse Content Disposition' );
						return;
					}

					continue;
				case STATE_HEADERS_DONE:
					console.log( 'STATE_HEADERS_DONE' );
					part.state		= STATE_PART_DATA_START;
					continue;

				case STATE_PART_DATA_START:
					console.log( 'STATE_PART_DATA_START' );
					if ( part.type === DATA_TYPE_FILE )
					{
						if ( part.file === null )
						{
							part.file	= fs.createWriteStream( part.filePath, { flag : 'a' } );
							console.log( 'OPENED FILE TO WRITE: ', part.filePath );
						}
						else
						{
							this.handleError( 'Tried to create a new write stream' );
							return;
						}
					}

					part.state	= STATE_PART_DATA;
					continue;

				case STATE_PART_DATA:
					console.log( 'STATE_PART_DATA' );
					boundaryOffset	= part.buffer.indexOf( boundary );

					console.log( boundaryOffset );
					if ( boundaryOffset === -1 )
					{
						if ( this.hasFinished() )
						{
							this.handleError( 'Invalid end of data' );
							return;
						}

						// Flush out the buffer and set it to an empty buffer so next time we set the data correctly
						// leave buffer is used as a redundancy check
						let leaveBuffer		= 5;
						let bufferToFlush	= part.buffer.slice( 0, part.buffer.length - leaveBuffer );
						this.flushBuffer( part, bufferToFlush );
						part.buffer	= part.buffer.slice( part.buffer.length - leaveBuffer );
						return;
					}
					else
					{
						this.flushBuffer( part, part.buffer.slice( 0, boundaryOffset - SYSTEM_EOL_LENGTH ) );
						if ( part.file != null )
						{
							part.file.end();
						}

						part.buffer	= part.buffer.slice( boundaryOffset );
						part.state	= STATE_CLOSE_BOUNDARY;
						continue;
					}
					break;

				case STATE_CLOSE_BOUNDARY:
					console.log( 'STATE_CLOSE_BOUNDARY' );
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
					part.buffer	= part.buffer.slice( boundaryOffset );
					continue;

				case STATE_END:

					let nextPart	= this.formPart();
					nextPart.buffer	= part.buffer;
					part			= nextPart;

					this.parts.push( nextPart );
					break;

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
		this.event		= event;

		this.integrityCheck( ( err, headerData ) =>{
			if ( ! err && headerData )
			{
				this.headerData	= headerData;
				this.callback	= callback;

				this.attachEvents();
			}
			else
			{
				callback( err );
			}
		});
	}

	/**
	 * @brief	Integrity check the event header data and payload length
	 *
	 * @brief	Returns an error and header data in the callback
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	integrityCheck( callback )
	{
		let headerData;
		if ( ! ( headerData = MultipartFormParser.getHeaderData( this.event.headers ) ) )
		{
			callback( 'Could not retrieve the header data' );
			return;
		}

		if ( this.maxPayload !== 0 && this.maxPayload < headerData.contentLength )
		{
			callback( 'Max Payload data reached' );
			return;
		}

		callback( false, headerData );
	}

	/**
	 * @brief	Attach events to the callback
	 *
	 * @return	void
	 */
	attachEvents()
	{
		let self	= this;
		this.event.request.on( 'data', ( chunk ) =>
		{
			if ( ! this.hasFinished() )
			{
				self.onDataReceivedCallback( chunk );
			}
		});

		this.event.request.on( 'end', () => {
			console.log( 'end' );
			this.eventEmitter.emit( 'end' );
		});

		this.eventEmitter.on( 'error', ( err )=>{
			this.parsingError	= true;
			this.callback( err );
		});

		this.eventEmitter.on( 'end', ()=>{
			this.ended	= true;
			this.stripDataFromParts();
			this.callback( false, this.parts );
		});
	}

	/**
	 * @brief	Removes the last part of the parts if it has not been finished
	 *
	 * @return	void
	 */
	clearUpLastPart()
	{
		let lastPart	= this.getPartData();

		if ( lastPart.state !== STATE_END )
		{
			this.parts.pop();
		}
	}
}

// Export the module
module.exports	= MultipartFormParser;
