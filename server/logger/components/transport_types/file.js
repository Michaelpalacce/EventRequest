'use strict';

// Dependencies
const Transport	= require( './transport' );
const fs		= require( 'fs' );
const os		= require( 'os' );
const path		= require( 'path' );

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
			this.fileStream	= this.getWriteStream( this.filePath );

			this.fileStream.on( 'finish', () => {
				this.fileStream	= null;
			});
		}
	}

	/**
	 * @brief	Get a new write stream for the given path
	 *
	 * @param	String filePath
	 *
	 * @return	WriteStream
	 */
	getWriteStream( filePath )
	{
		let folder	= path.dirname( filePath );

		if ( ! fs.existsSync( folder ) )
		{
			fs.mkdirSync( folder );
		}

		return fs.createWriteStream( filePath, {
			flags		: 'a',
			autoClose	: true
		});
	}

	/**
	 * @brief	Logs the log in a file
	 *
	 * @param	Log log
	 *
	 * @return	void
	 */
	log( log )
	{
		let message		= log.getMessage();
		let uniqueId	= log.getUniqueId();
		let timestamp	= log.getTimestamp();
		timestamp		= new Date( timestamp * 1000 );

		message			=  uniqueId + ' :: ' + timestamp + ' : ' + message;

		if ( this.fileStream !== null )
		{
			this.fileStream.write( message + SYSTEM_EOL, 'utf8', ( err ) =>{
				if ( err )
				{
					console.error( 'Could not write to file' );
				}
			});
		}
	}
}

module.exports	= File;