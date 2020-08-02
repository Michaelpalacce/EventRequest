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

		this.processors			= Array.isArray( options.processors )
								? options.processors
								: [Transport.processors.time(), Transport.processors.stack(), Transport.processors.line()];

		this.formatter			= typeof options.formatter === 'function'
								? options.formatter
								: Transport.formatters.plain( { noRaw: true } );

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
			this.fileStream	= fs.createWriteStream( this.getFileName(), { flags : 'a', autoClose : true } );

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
	 * @brief	Logs the log in a file
	 *
	 * @param	{Array} data
	 * @param	{Function} resolve
	 * @param	{Function} reject
	 *
	 * @return	void
	 */
	_log( data, resolve, reject )
	{
		const writeStream	= this.getWriteStream();
		let hasError		= false;

		for ( const message of data )
			writeStream.write( message + SYSTEM_EOL, 'utf8', ( err ) => {
				if ( err )
				{
					hasError	= true;
					reject( err );
				}
			});

		if ( ! hasError )
			resolve();
	}
}

module.exports	= File;
