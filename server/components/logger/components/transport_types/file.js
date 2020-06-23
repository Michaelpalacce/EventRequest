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
	 * @param	options Object
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
		const file	= path.parse( this.filePath );

		if ( ! fs.existsSync( file.dir ) )
		{
			fs.mkdirSync( file.dir );
		}

		if ( this.fileStream === null || ! fs.existsSync( this.getFileName() ) )
		{
			if ( this.fileStream instanceof WriteStream )
			{
				this.fileStream.end();
			}

			this.fileStream	= fs.createWriteStream( this.getFileName(), {
				flags		: 'a',
				autoClose	: true
			});

			this.fileStream.on( 'error',( error )=>{} )
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
	 * @param	log Log
	 *
	 * @return	String
	 */
	format( log )
	{
		const message	= log.getMessage();
		const uniqueId	= log.getUniqueId();
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
	 * @param	log Log
	 * @param	resolve Function
	 * @param	reject Function
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
