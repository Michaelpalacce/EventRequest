'use strict';

// Dependencies
const os				= require( 'os' );
const path				= require( 'path' );
const fs				= require( 'fs' );
const BodyParser		= require( './body_parser' );

/**
 * @brief	Constants
 */
const CONTENT_DISPOSITION_INDEX					= 0;
const CONTENT_TYPE_INDEX						= 1;
const CONTENT_LENGTH_HEADER						= 'content-length';
const CONTENT_TYPE_HEADER						= 'content-type';
const BOUNDARY_REGEX							= /boundary=(\S+[^\s])/;
const CONTENT_DISPOSITION_NAME_CHECK_REGEX		= /\b(name=)/;
const CONTENT_DISPOSITION_FILENAME_CHECK_REGEX	= /\b(filename=)/;
const CONTENT_DISPOSITION_NAME_REGEX			= /\bname="([^"]+)"/;
const CONTENT_DISPOSITION_FILENAME_REGEX		= /\bfilename="([^"]+)"/;
const CONTENT_TYPE_GET_TYPE_REGEX				= /Content-Type:\s+(.+)$/;
const SYSTEM_EOL								= os.EOL;
const SYSTEM_EOL_LENGTH							= SYSTEM_EOL.length;
const DEFAULT_BUFFER_ENCODING					= 'ascii';
const DEFAULT_BOUNDARY_PREFIX					= '--';
const MULTIPART_PARSER_SUPPORTED_TYPE			= 'multipart/form-data';
const RANDOM_NAME_LENGTH						= 20;
const DATA_TYPE_FILE							= 'file';
const DATA_TYPE_PARAMETER						= 'parameter';

let STATE_START									= 0;
let STATE_START_BOUNDARY						= 1;
let STATE_HEADER_FIELD_START					= 2;
let STATE_HEADERS_DONE							= 3;
let STATE_PART_DATA_START						= 4;
let STATE_PART_DATA								= 5;
let STATE_CLOSE_BOUNDARY						= 6;
let STATE_END									= 7;

const ERROR_INVALID_STATE						= 101;
const ERROR_INCORRECT_END_OF_STREAM				= 102;
const ERROR_COULD_NOT_FLUSH_BUFFER				= 103;
const ERROR_INVALID_METADATA					= 104;
const ERROR_RESOURCE_TAKEN						= 106;

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
	 * 			- maxPayload - Number - Maximum payload in bytes to parse if set to 0 means infinite
	 * 			- tempDir - String - The directory where to keep the uploaded files before moving
	 */
	constructor( options = {} )
	{
		super( options );

		this.maxPayload		= this.options.maxPayload || 0;
		this.tempDir		= this.options.tempDir || os.tmpdir();

		this.parts			= [];
		this.parsingError	= false;
		this.ended			= false;

		this.event			= null;
		this.callback		= null;
		this.headerData		= null;
		this.boundary		= null;

		this.setUpTempDir();
	}

	/**
	 * @brief	Clean up
	 *
	 * @return	void
	 */
	terminate()
	{
		this.removeAllListeners();
		this.parts			= null;
	}

	/**
	 * @brief	Will Create the temporary directory if it does not exist already
	 *
	 * @return	void
	 */
	setUpTempDir()
	{
		if ( ! fs.existsSync( this.tempDir ) )
		{
			fs.mkdirSync( this.tempDir );
		}
	}

	/**
	 * @brief	Form a part with default properties
	 *
	 * @return	Object
	 */
	formPart()
	{
		return {
			name		: '',
			contentType	: '',
			size		: 0,
			state		: STATE_START,
			buffer		: Buffer.alloc( 0 )
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
		part.file	= null;
		part.path	= null;
		part.type	= DATA_TYPE_FILE;
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
			part.buffer	= null;
			part.state	= null;

			if ( typeof part.file !== 'undefined' && typeof part.file.end === 'function' )
			{
				part.file.end();
			}

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
		try
		{
			this.extractChunkData( chunk );
		}
		catch ( e )
		{
			this.emit( 'onError', e.message );
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
			this.handleError( ERROR_COULD_NOT_FLUSH_BUFFER );
		}

		part.size	+= buffer.length;
	}

	/**
	 * @brief	Extracts chunk data as they come in
	 *
	 * @param	Buffer chunk
	 *
	 * @return	void
	 */
	extractChunkData( chunk )
	{
		let boundaryOffset	= 0;
		let part			= this.getPartData();
		part.buffer			= Buffer.concat( [part.buffer, chunk] );

		while ( true )
		{
			switch ( part.state )
			{
				case STATE_START:
					// Starting 
					part.state	= STATE_START_BOUNDARY;
					break;
				case STATE_START_BOUNDARY:
					// Receive chunks until we find the first boundary if the end has been finished, throw an error
					boundaryOffset	= part.buffer.indexOf( this.boundary );
					if ( boundaryOffset === -1 )
					{
						if ( this.hasFinished() )
						{
							this.handleError( ERROR_INCORRECT_END_OF_STREAM );
						}

						return;
					}

					// Get the data after the boundary on the next line -> + SYSTEM_EOL_LENGTH
					part.buffer	= part.buffer.slice( boundaryOffset + this.boundary.length + SYSTEM_EOL_LENGTH );
					part.state	= STATE_HEADER_FIELD_START;
					break;
				case STATE_HEADER_FIELD_START:
					let lineCount				= 0;
					let contentTypeLine			= null;
					let contentDispositionLine	= null;
					let read					= part.buffer.toString( DEFAULT_BUFFER_ENCODING );
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

					// Receive chunks until we read the two rows of metadata if end is reached, throw an error
					if ( contentDispositionLine === null || contentTypeLine === null || lineCount < 2 )
					{
						if ( this.hasFinished() )
						{
							this.handleError( ERROR_INVALID_METADATA );
						}
						return;
					}

					// Should be in the beginning of the payload, so set state

					// Extract data
					let filenameCheck	= contentDispositionLine.match( CONTENT_DISPOSITION_FILENAME_CHECK_REGEX );
					let nameCheck		= contentDispositionLine.match( CONTENT_DISPOSITION_NAME_CHECK_REGEX );
					let filename		= null;
					let name			= null;

					if ( filenameCheck !== null )
					{
						filename	= contentDispositionLine.match( CONTENT_DISPOSITION_FILENAME_REGEX );

						if ( filename === null )
						{
							this.handleError( ERROR_INVALID_METADATA );
						}

						filename	= filename[1];
					}

					if ( nameCheck !== null )
					{
						name	= contentDispositionLine.match( CONTENT_DISPOSITION_NAME_REGEX );

						if ( name === null )
						{
							this.handleError( ERROR_INVALID_METADATA );
						}
						else
						{
							name	= name[1];
						}
					}
					else
					{
						this.handleError( ERROR_INVALID_METADATA );
					}

					// Cut until after the two lines
					part.buffer	= part.buffer.slice( idxStart );

					let contentType	= contentTypeLine.match( CONTENT_TYPE_GET_TYPE_REGEX );
					if ( contentType !== null )
					{
						// Cut the extra empty line in this case
						part.buffer			= part.buffer.slice( SYSTEM_EOL_LENGTH );
						// Set the file content type
						part.contentType	= contentType[1];
					}

					if ( filename !== null && name !== null )
					{
						// File input being parsed
						this.upgradeToFileTypePart( part );
						part.path		= path.join( this.tempDir, this.getRandomFileName( RANDOM_NAME_LENGTH ) );
						part.name		= filename;
					}
					else if ( name !== null )
					{
						// Multipart form param being parsed
						this.upgradeToParameterTypePart( part );
						part.name	= name;
					}
					else
					{
						this.handleError( ERROR_INVALID_METADATA );
						return;
					}

					part.state	= STATE_HEADERS_DONE;
					break;
				case STATE_HEADERS_DONE:
					part.state		= STATE_PART_DATA_START;
					break;
				case STATE_PART_DATA_START:
					if ( part.type === DATA_TYPE_FILE )
					{
						if ( part.file === null )
						{
							part.file	= fs.createWriteStream( part.path, { flag : 'a' } );
						}
						else
						{
							this.handleError( ERROR_RESOURCE_TAKEN );
							return;
						}
					}

					part.state	= STATE_PART_DATA;
					break;
				case STATE_PART_DATA:
					boundaryOffset	= part.buffer.indexOf( this.boundary );
					if ( boundaryOffset === -1 )
					{
						if ( this.hasFinished() )
						{
							this.handleError( ERROR_INCORRECT_END_OF_STREAM );
						}

						// Flush out the buffer and set it to an empty buffer so next time we set the data correctly
						// leave buffer is used as a redundancy check
						let leaveBuffer		= 5;
						let bufferToFlush	= part.buffer.slice( 0, part.buffer.length - leaveBuffer );
						this.flushBuffer( part, bufferToFlush );
						part.buffer	= part.buffer.slice( part.buffer.length - leaveBuffer );

						// Fetch more data
						return;
					}
					else
					{
						this.flushBuffer( part, part.buffer.slice( 0, boundaryOffset - SYSTEM_EOL_LENGTH ) );
						if ( part.type === DATA_TYPE_FILE )
						{
							part.file.end();
						}

						part.buffer	= part.buffer.slice( boundaryOffset );
						part.state	= STATE_CLOSE_BOUNDARY;
					}
					break;
				case STATE_CLOSE_BOUNDARY:
					boundaryOffset	= part.buffer.indexOf( this.boundary );
					if ( boundaryOffset === -1 )
					{
						if ( this.hasFinished() )
						{
							this.handleError( ERROR_INCORRECT_END_OF_STREAM );
						}

						return;
					}

					part.state	= STATE_END;
					part.buffer	= part.buffer.slice( boundaryOffset );
					break;
				case STATE_END:
					let nextPart	= this.formPart();
					nextPart.buffer	= part.buffer;
					part			= nextPart;

					this.parts.push( nextPart );
					break;
				default:
					this.handleError( ERROR_INVALID_STATE );
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
		this.callback	= callback;

		this.integrityCheck( ( err, headerData ) =>{
			if ( ! err && headerData )
			{
				this.headerData	= headerData;
				this.boundary	= DEFAULT_BOUNDARY_PREFIX + this.headerData.boundary;

				this.attachEvents();
				this.absorbStream();
			}
			else
			{
				this.terminate();
				this.callback( err );
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
		this.on( 'onError', ( err )=>{
			this.parsingError	= true;
			this.callback( err );
		});

		this.on( 'end', ()=>{
			this.ended	= true;
			this.stripDataFromParts();
			this.separateParts();
			this.callback( false, this.parts );
		});

		this.event.on( 'cleanUp', () => {
			this.cleanUpItems();
			this.terminate();
		});
	}

	/**
	 * @brief	CLean up items
	 *
	 * @return	void
	 */
	cleanUpItems()
	{
		if ( typeof this.parts.files !== 'undefined' )
		{
			this.parts.files.forEach( ( part ) =>{
				if ( part.type === DATA_TYPE_FILE && part.path !== 'undefined' && fs.existsSync( part.path ) )
				{
					fs.unlinkSync( part.path )
				}
			});
		}
		else
		{
			this.parts.forEach( ( part ) =>{
				if ( part.type === DATA_TYPE_FILE && part.path !== 'undefined' && fs.existsSync( part.path ) )
				{
					if ( typeof part.file !== 'undefined' && typeof part.file.end === 'function' )
					{
						part.file.end();
					}

					fs.unlinkSync( part.path )
				}
			});
		}
	}

	/**
	 * @brief	Separates and organizes the parts into files and properties
	 *
	 * @return	void
	 */
	separateParts()
	{
		let parts	= {
			'files'			: []
		};
		this.parts.forEach( ( part ) =>{
			if ( part.type === DATA_TYPE_FILE )
			{
				parts.files.push( part );
			}

			if ( part.type === DATA_TYPE_PARAMETER )
			{
				if ( typeof parts[part.name] === 'undefined' )
				{
					parts[part.name]	= part.data.toString();
				}
			}
		});

		this.parts	= parts;
	}

	/**
	 * @brief	Absorbs the incoming payload stream
	 *
	 * @return	void
	 */
	absorbStream()
	{
		this.event.clearTimeout();

		let self	= this;
		this.event.request.on( 'data', ( chunk ) =>
		{
			if ( ! this.hasFinished() )
			{
				self.onDataReceivedCallback( chunk );
			}
		});

		this.event.request.on( 'end', () => {
			if ( ! this.hasFinished() )
			{
				this.emit( 'end' );
			}
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
