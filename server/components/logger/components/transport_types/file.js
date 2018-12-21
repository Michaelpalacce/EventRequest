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
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		super.sanitizeConfig( options );

		this.filePath	= typeof options.filePath === "string"
						? path.join( path.dirname( require.main.filename ), options.filePath )
						: false;

		this.fileStream	= null;

		if ( this.filePath )
		{
			this.getWriteStream();
		}
	}

	/**
	 * @brief	Get a new write stream for the given path
	 *
	 * @return	WriteStream
	 */
	getWriteStream()
	{
		let file	= path.parse( this.filePath );

		if ( ! fs.existsSync( file.dir ) )
		{
			fs.mkdirSync( file.dir );
		}

		let fileName	= this.getFileName();

		if ( this.fileStream === null || ! fs.existsSync( fileName ) )
		{
			if ( this.fileStream instanceof WriteStream )
			{
				this.fileStream.end();
			}

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
	 * @param	Object file
	 *
	 * @return	String
	 */
	getFileName()
	{
		let file	= path.parse( this.filePath );
		return file.dir + '/' + file.name + this.getCurrentDayTimestamp() + file.ext;
	}

	/**
	 * @brief	Gets the beginning of the current day
	 *
	 * @return	Number
	 */
	getCurrentDayTimestamp()
	{
		let now			= new Date();
		let startOfDay	= new Date( now.getFullYear(), now.getMonth(), now.getDate() );
		return startOfDay / 1000;
	}

	/**
	 * @brief	Format the given log
	 *
	 * @param	Log log
	 *
	 * @return	String
	 */
	format( log )
	{
		let message		= log.getMessage();
		let uniqueId	= log.getUniqueId();
		let timestamp	= log.getTimestamp();
		timestamp		= new Date( timestamp * 1000 );
		timestamp		= Intl.DateTimeFormat( 'en-GB', {
			hour12	: false,
			year	: '2-digit',
			month	: '2-digit',
			day		: '2-digit',
			hour	: '2-digit',
			minute	: '2-digit',
			second	: '2-digit'
		}).format( timestamp );

		return uniqueId + ' - ' + timestamp + ': ' + message;
	}

	/**
	 * @brief	Logs the log in a file
	 *
	 * @param	Log log
	 * @param	Function resolve
	 * @param	Function reject
	 *
	 * @return	Promise
	 */
	_log( log, resolve, reject )
	{
		let message	= this.format( log );

		this.getWriteStream().write( message + SYSTEM_EOL, 'utf8', ( err ) =>{
			if ( err )
			{
				reject( err );
			}
			else
			{
				resolve();
			}
		});
	}
}

module.exports	= File;
