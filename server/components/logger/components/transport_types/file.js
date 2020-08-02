'use strict';

// Dependencies
const Transport		= require( './transport' );
const fs			= require( 'fs' );
const WriteStream	= fs.WriteStream;
const os			= require( 'os' );
const path			= require( 'path' );

/**
 * @brief	Constants
 */
const SYSTEM_EOL	= os.EOL;

/**
 * @brief	File transport
 */
class File extends Transport
{
	constructor( options = {} )
	{
		super( options );
	}

	/**
	 * @brief	Sanitizes the config
	 *
	 * @details	Accepted options:
	 * 			- filePath - String - the location of the file to log to -> if it is not provided the transport will not log
	 * 			- splitToNewLines - Boolean - Whether the new lines in the message should be evaluated as new lines and split or do we want to log the entire message on one line
	 *
	 * @param	{Object} options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		super.sanitizeConfig( options );

		this.filePath			= typeof options.filePath === "string"
								? options.filePath
								: null;

		this.splitToNewLines	= typeof options.splitToNewLines === "boolean"
								? options.splitToNewLines
								: true;

		this.fileStream			= null;

		if ( ! this.filePath )
			throw new Error( 'app.er.logging.transport.file.fileLogPathNotProvided' );
	}

	/**
	 * @brief	Get a new write stream for the given path
	 *
	 * @return	WriteStream
	 */
	getWriteStream()
	{
		const file	= path.parse( this.filePath );

		if ( ! fs.existsSync( file.dir ) )
			fs.mkdirSync( file.dir );

		if ( this.fileStream === null || ! fs.existsSync( this.getFileName() ) )
		{
			this.fileStream	= fs.createWriteStream( this.getFileName(), {
				flags		: 'a',
				autoClose	: true
			});
		}

		return this.fileStream;
	}

	/**
	 * @brief	Gets the file name with added timestamp
	 *
	 * @return	String
	 */
	getFileName()
	{
		const file	= path.parse( this.filePath );
		return file.dir + '/' + file.name + this.getCurrentDayTimestamp() + file.ext;
	}

	/**
	 * @brief	Gets the beginning of the current day
	 *
	 * @return	Number
	 */
	getCurrentDayTimestamp()
	{
		const now			= new Date();
		const startOfDay	= new Date( now.getFullYear(), now.getMonth(), now.getDate() );
		return startOfDay / 1000;
	}

	/**
	 * @brief	Format the given log
	 *
	 * @param	{Log} log
	 *
	 * @return	String
	 */
	format( log )
	{
		const message	= log.getMessage();
		const uniqueId	= log.getUniqueId();

		return uniqueId + ' - ' + this._getTimestamp( log ) + ': ' + message;
	}

	/**
	 * @brief	Logs the log in a file
	 *
	 * @param	{Log} log
	 * @param	{Function} resolve
	 * @param	{Function} reject
	 *
	 * @return	void
	 */
	_log( log, resolve, reject )
	{
		let message			= this.format( log );
		const writeStream	= this.getWriteStream();

		if ( this.splitToNewLines )
		{
			let hit	= true;

			while ( hit )
			{
				hit	= false;
				const lineEnds	= ['\r\n', '\\r\\n', '\n', '\\n', '\r', '\\r'];

				for ( const lineEnd of lineEnds )
				{
					const lineEndPosition	= message.indexOf( `${lineEnd}` );

					if ( lineEndPosition !== -1 )
					{
						writeStream.write( message.slice( 0, lineEndPosition ) + SYSTEM_EOL, 'utf8' );
						message	= message.slice( lineEndPosition + lineEnd.length );
						hit		= true;
					}
				}
			}
		}

		writeStream.write( message + SYSTEM_EOL, 'utf8', ( err ) => {
			if ( err )
				reject( err );
			else
				resolve();
		});
	}
}

module.exports	= File;
