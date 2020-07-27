'use strict';

// Dependencies
const os				= require( 'os' );
const path				= require( 'path' );
const fs				= require( 'fs' );
const { promisify }		= require( 'util' );
const { EventEmitter }	= require( 'events' );
const { Loggur }		= require( '../logger/loggur' );
const { makeId }		= require( '../helpers/unique_id' );
const unlink			= promisify( fs.unlink );

/**
 * @brief	Constants
 */
const CONTENT_DISPOSITION_INDEX					= 0;
const CONTENT_TYPE_INDEX						= 1;
const CONTENT_LENGTH_HEADER						= 'content-length';
const CONTENT_TYPE_HEADER						= 'content-type';
const BOUNDARY_REGEX							= /boundary=(\S+[^\s])/;
const CONTENT_DISPOSITION_NAME_CHECK_REGEX		= /\bname="([^"]+)"/;
const CONTENT_DISPOSITION_FILENAME_CHECK_REGEX	= /\bfilename="([^"]+)"/;
const CONTENT_TYPE_GET_TYPE_REGEX				= /Content-Type:\s+(.+)$/;
const DEFAULT_BUFFER_ENCODING					= 'utf8';
const DEFAULT_BOUNDARY_PREFIX					= '--';
const MULTIPART_PARSER_SUPPORTED_TYPE			= 'multipart/form-data';
const RANDOM_NAME_LENGTH						= 128;
const DATA_TYPE_FILE							= 'file';
const DATA_TYPE_PARAMETER						= 'parameter';

const STATE_START								= 0;
const STATE_START_BOUNDARY						= 1;
const STATE_HEADER_FIELD_START					= 2;
const STATE_PART_DATA_START						= 4;
const STATE_PART_DATA							= 5;
const STATE_END									= 7;

const ERROR_INVALID_STATE						= 101;
const ERROR_COULD_NOT_FLUSH_BUFFER				= 103;
const ERROR_INVALID_METADATA					= 104;

/**
 * @brief	FormParser used to parse multipart data
 */
class MultipartDataParser extends EventEmitter
{
	/**
	 * @param	{Object} options
	 * 				Accepts options:
	 * 					- maxPayload - Number - Maximum payload in bytes to parse if set to 0 means infinite
	 * 					- tempDir - String - The directory where to keep the uploaded files before moving
	 * 					- cleanUpItemsTimeoutMS - String - After what time should the files be deleted if any. Defaults to 100
	 */
	constructor( options = {} )
	{
		super();
		this.setMaxListeners( 0 );

		this.maxPayload				= options.maxPayload || 0;
		this.tempDir				= options.tempDir || os.tmpdir();
		this.cleanUpItemsTimeoutMS	= options.cleanUpItemsTimeoutMS || 100;

		this.EOL					= null;
		this.EOL_LENGTH				= null;

		this.parts					= [];
		this.parsingError			= false;
		this.ended					= false;

		this.event					= null;
		this.headerData				= null;
		this.boundary				= null;

		this.setUpTempDir();
	}

	/**
	 * @brief	Clean up
	 *
	 * @return	void
	 */
	terminate()
	{
		this.cleanUpItems();
		this.removeAllListeners();

		this.parsingError	= false;
		this.ended			= false;

		this.event			= null;
		this.headerData		= null;
		this.boundary		= null;
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
		};
	}

	/**
	 * @brief	Upgrades the given data part and adds it DATA_TYPE_FILE properties
	 *
	 * @param	{Object} part
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
	 * @param	{Object} part
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
	 * @return	void
	 */
	stripDataFromParts()
	{
		this.clearUpLastPart();

		for ( const index in this.parts )
		{
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( this.parts, index ) )
				continue;

			const part	= this.parts[index];
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
		const length	= this.parts.length;
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
	 * @brief	Determines the OS line end and sets it for future use
	 *
	 * @param	{Buffer} chunk
	 *
	 * @return	void
	 */
	determineEOL( chunk )
	{
		const data		= chunk.toString( DEFAULT_BUFFER_ENCODING );
		const lineEnds	= ['\r\n', '\n', '\r'];
		const boundry	= this.boundary.substr( 2 );

		for ( const lineEnd of lineEnds )
		{
			if ( data.indexOf( `${boundry}${lineEnd}` ) !== -1 )
			{
				this.EOL		= lineEnd;
				this.EOL_LENGTH	= lineEnd.length;
				return;
			}
		}

		this.EOL		= '\r\n';
		this.EOL_LENGTH	= this.EOL.length;
	}

	/**
	 * @brief	Callback called when data is received by the server
	 *
	 * @param	{Buffer} chunk
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
	 * @param	{Object} part
	 * @param	{Buffer} buffer
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
	 * @param	{Buffer} chunk
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
					part.state	= STATE_START_BOUNDARY;
					break;

				case STATE_START_BOUNDARY:
					// Receive chunks until we find the first boundary if the end has been finished, throw an error
					boundaryOffset	= part.buffer.indexOf( this.boundary );
					if ( boundaryOffset === -1 || part.buffer.length < boundaryOffset + this.boundary.length + 10 )
						return;

					if ( this.EOL === null )
						this.determineEOL( part.buffer );

					// Get the data after the boundary on the next line -> + this.EOL_LENGTH
					part.buffer	= part.buffer.slice( boundaryOffset + this.boundary.length + this.EOL_LENGTH );
					part.state	= STATE_HEADER_FIELD_START;

					break;
				case STATE_HEADER_FIELD_START:
					let lineCount				= 0;
					let contentTypeLine			= null;
					let contentDispositionLine	= null;
					let read					= part.buffer.toString( DEFAULT_BUFFER_ENCODING );
					let idxStart				= 0;

					let line, idx;

					while ( ( idx = read.indexOf( this.EOL, idxStart ) ) !== -1 )
					{
						line	= read.substring( idxStart, idx );

						if ( line === '' && lineCount === 0 )
						{
							idxStart	= idx + this.EOL_LENGTH;
							continue;
						}

						if ( lineCount === CONTENT_DISPOSITION_INDEX )
						{
							contentDispositionLine	= line;
						}
						else if ( lineCount === CONTENT_TYPE_INDEX )
						{
							contentTypeLine	= line;
						}
						else
						{
							break;
						}

						idxStart	= idx + this.EOL_LENGTH;
						++ lineCount;
					}

					// Receive chunks until we read the two rows of metadata if end is reached, throw an error
					if ( contentDispositionLine === null || contentTypeLine === null || lineCount < 2 )
					{
						/* istanbul ignore next */
						if ( this.hasFinished() )
							this.handleError( ERROR_INVALID_METADATA );
						return;
					}

					// Extract data
					let filenameCheck	= contentDispositionLine.match( CONTENT_DISPOSITION_FILENAME_CHECK_REGEX );
					let nameCheck		= contentDispositionLine.match( CONTENT_DISPOSITION_NAME_CHECK_REGEX );

					if ( filenameCheck !== null )
						filenameCheck	= filenameCheck[1];

					if ( nameCheck !== null )
						nameCheck	= nameCheck[1];
					else
						this.handleError( ERROR_INVALID_METADATA );

					// Cut until after the two lines
					part.buffer	= part.buffer.slice( idxStart );

					let contentType	= contentTypeLine.match( CONTENT_TYPE_GET_TYPE_REGEX );
					if ( contentType !== null )
					{
						if ( part.buffer.indexOf( this.EOL ) === 0 )
						{
							// Cut the extra empty line in this case
							part.buffer			= part.buffer.slice( this.EOL_LENGTH );
						}

						// Set the file content type
						part.contentType	= contentType[1];
					}

					// The else is impossible to go to, but is added in case something is changed
					/* istanbul ignore else */
					if ( filenameCheck !== null && nameCheck !== null )
					{
						// File input being parsed
						this.upgradeToFileTypePart( part );
						part.path	= path.join( this.tempDir, makeId( RANDOM_NAME_LENGTH ) );
						part.name	= filenameCheck;
					}
					else if ( nameCheck !== null )
					{
						// Multipart form param being parsed
						this.upgradeToParameterTypePart( part );
						part.name	= nameCheck;
					}
					else
					{
						this.handleError( ERROR_INVALID_METADATA );
						return;
					}

					part.state	= STATE_PART_DATA_START;
					break;

				case STATE_PART_DATA_START:
					if ( part.type === DATA_TYPE_FILE && part.file === null )
						part.file	= fs.createWriteStream( part.path, { flag : 'a', autoClose : true } );

					part.state	= STATE_PART_DATA;
					break;

				case STATE_PART_DATA:
					boundaryOffset	= part.buffer.indexOf( this.boundary );
					if ( boundaryOffset === -1 )
					{
						// Flush out the buffer and set it to an empty buffer so next time we set the data correctly
						// leave buffer is used as a redundancy check
						let leaveBuffer		= this.boundary.length + 10;
						let bufferToFlush	= part.buffer.slice( 0, Math.max( part.buffer.length - leaveBuffer, 0 ) );
						this.flushBuffer( part, bufferToFlush );
						part.buffer	= part.buffer.slice( Math.max( part.buffer.length - leaveBuffer, 0 ) );

						// Fetch more data
						return;
					}
					else
					{
						this.flushBuffer( part, part.buffer.slice( 0, Math.max( boundaryOffset - this.EOL_LENGTH, 0 ) ) );
						if ( part.type === DATA_TYPE_FILE )
							part.file.end();

						part.buffer	= part.buffer.slice( boundaryOffset );
						part.state	= STATE_END;
					}
					break;
				case STATE_END:
					let nextPart	= this.formPart();
					nextPart.buffer	= part.buffer;
					part			= nextPart;

					this.parts.push( nextPart );
					break;

					/* istanbul ignore next */
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
		return this.event === null || this.event.isFinished() || this.parsingError === true || this.ended === true;
	}

	/**
	 * @brief	Emits an event with an error
	 *
	 * @param	{*} message
	 *
	 * @return	void
	 */
	handleError( message )
	{
		throw new Error( message );
	}

	/**
	 * @brief	Return if the current body type is supported by the current body parser
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	Boolean
	 */
	supports( event )
	{
		const contentType	= event.getRequestHeader( CONTENT_TYPE_HEADER );
		return typeof contentType === 'string' && contentType.match( MULTIPART_PARSER_SUPPORTED_TYPE ) !== null;
	}

	/**
	 * @brief	Get header data from event
	 *
	 * @details	Will return false on error
	 *
	 * @param	{Object} headers
	 *
	 * @return	Object|Boolean
	 */
	static getHeaderData( headers )
	{
		const contentType	= typeof headers[CONTENT_TYPE_HEADER] === 'string'
							? headers[CONTENT_TYPE_HEADER]
							: false;

		const contentLength	= typeof headers[CONTENT_LENGTH_HEADER] !== 'undefined'
							? parseInt( headers[CONTENT_LENGTH_HEADER] )
							: false;

		if ( contentType === false || contentLength === false )
		{
			return false;
		}

		const boundary	= contentType.match( BOUNDARY_REGEX );

		if ( boundary === null )
			return false;

		return {
			contentLength,
			boundary	: boundary[1]
		};
	}

	/**
	 * @brief	Parses the body
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	Promise
	 */
	parse( event )
	{
		return new Promise(( resolve, reject ) => {
			this.event		= event;

			this.integrityCheck( ( err, headerData ) => {
				if ( ! err && headerData )
				{
					this.headerData	= headerData;
					this.boundary	= DEFAULT_BOUNDARY_PREFIX + this.headerData.boundary;

					this.on( 'onError', ( err ) => {
						this.parsingError	= true;
						reject( err );
					});

					this.on( 'end', () => {
						this.ended	= true;
						this.stripDataFromParts();
						this.separateParts();

						resolve( { body: this.parts, rawBody: {} } );
					});

					this.event.on( 'cleanUp', () => {
						this.terminate();
					});

					this.absorbStream();
				}
				else
				{
					reject( err );
					this.terminate();
				}
			});
		});
	}

	/**
	 * @brief	Integrity check the event header data and payload length
	 *
	 * @brief	Returns an error and header data in the callback
	 *
	 * @param	{Function} callback
	 *
	 * @return	void
	 */
	integrityCheck( callback )
	{
		let headerData	= MultipartDataParser.getHeaderData( this.event.headers );
		if ( ! headerData )
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
	 * @brief	CLean up items
	 *
	 * @return	void
	 */
	cleanUpItems()
	{
		setTimeout(() => {
			if ( typeof this.parts.$files !== 'undefined' )
			{
				this.parts.$files.forEach( ( part ) => {
					if ( part.type === DATA_TYPE_FILE && part.path !== 'undefined' && fs.existsSync( part.path ) )
						this._removeFile( part.path );
				});
			}
			else
			{
				this.parts.forEach( ( part ) => {
					if ( part.type === DATA_TYPE_FILE && typeof part.path !== 'undefined' && fs.existsSync( part.path ) )
					{
						if ( typeof part.file !== 'undefined' && typeof part.file.end === 'function' )
							part.file.end();

						this._removeFile( part.path );
					}
				});
			}

			this.parts	= null;
		}, this.cleanUpItemsTimeoutMS );
	}

	/**
	 * @brief	Extracted for testing purposes
	 *
	 * @details	I can't simulate an error when unlinking so this test is ignored for now
	 *
	 * @param	{String} absFilePath
	 */
	_removeFile( absFilePath )
	{
		/* istanbul ignore next */
		unlink( absFilePath ).catch(( e ) => {
			Loggur.log( e, Loggur.LOG_LEVELS.info );
		});
	}

	/**
	 * @brief	Separates and organizes the parts into files and properties
	 *
	 * @return	void
	 */
	separateParts()
	{
		const parts	= {
			$files	: []
		};

		this.parts.forEach( ( part ) => {
			if ( part.type === DATA_TYPE_FILE )
				parts.$files.push( part );

			if ( part.type === DATA_TYPE_PARAMETER && typeof parts[part.name] === 'undefined' )
				parts[part.name]	= part.data.toString();
		});

		if ( parts.$files.length === 0 )
			delete parts.$files;

		this.parts	= parts;

		if ( Object.keys( this.parts ).length === 0 )
			this.parts	= [];
	}

	/**
	 * @brief	Absorbs the incoming payload stream
	 *
	 * @return	void
	 */
	absorbStream()
	{
		this.event.request.on( 'data', ( chunk ) => {

			if ( ! this.hasFinished() )
				this.onDataReceivedCallback( chunk );

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
		const lastPart	= this.getPartData();

		if ( lastPart.state !== STATE_END )
			this.parts.pop();
	}
}

// Export the module
module.exports	= MultipartDataParser;
