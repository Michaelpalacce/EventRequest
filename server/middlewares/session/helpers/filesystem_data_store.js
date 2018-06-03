'use strict';

/**
 * Library for storing and editing data
 */

// Dependencies
const fs	= require( 'fs' );
const path	= require( 'path' );

// Container for the module ( to be exported )
let lib						= {};

// Base directory of the data folder
const PROJECT_ROOT			= path.parse( require.main.filename ).dir;
lib.baseDir					= path.join( PROJECT_ROOT, '/.data' );

/**
 * @brief	Write data to a file
 *
 * @param	String dir
 * @param	String file
 * @param	mixed data
 * @param	Function callback
 *
 * @return	void
 */
lib.create	= ( dir, file, data, callback ) => {
	file			= file + '.json';
	let filePath	= path.join( lib.baseDir, dir, file );

	// Open the file for writing
	fs.open( filePath, 'wx', ( err, fileDescriptor ) => {
		if ( ! err && fileDescriptor )
		{
			// Convert data to string
			let stringData	= JSON.stringify( data );

			// Write to file and close it
			fs.writeFile( fileDescriptor, stringData, ( err ) =>
			{
				if ( ! err )
				{
					fs.close( fileDescriptor, ( err ) => {
						if ( ! err )
						{
							callback( false );
						}
						else
						{
							callback( 'Error closing new file' )
						}
					});
				}
				else
				{
					callback( 'Error writing to new file' );
				}
			});
		}
		else
		{
			callback( 'Could not create new file, it may already exist' );
		}
	});
};

/**
 * @brief	Read a file
 *
 * @param	String dir
 * @param	String file
 * @param	Function callback
 *
 * @return	void
 */
lib.read	= ( dir, file, callback ) =>
{
	file			= file + '.json';
	let filePath	= path.join( lib.baseDir, dir, file );

	fs.readFile( filePath, 'utf8', ( err, data ) => {
		if ( ! err && data )
		{
			callback( false, JSON.parse( data ) );
		}
		else
		{
			callback( err, data );
		}
	});
};

/**
 * @brief	Update a file
 *
 * @param	String dir
 * @param	String file
 * @param	mixed data
 * @param	Function callback
 *
 * @return	void
 */
lib.update	= ( dir, file, data, callback ) =>
{
	file			= file + '.json';
	let filePath	= path.join( lib.baseDir, dir, file );

	// Open the file for writing
	fs.open( filePath, 'r+', ( err, fileDescriptor ) => {
		if ( ! err && fileDescriptor )
		{
			// Convert the data to a string
			let stringData	= JSON.stringify( data );

			// Truncate the file
			fs.ftruncate( fileDescriptor, ( err ) => {
				if ( ! err )
				{
					// Write to the file and close it
					fs.writeFile( fileDescriptor, stringData, ( err ) => {
						if ( ! err )
						{
							fs.close( fileDescriptor, ( err ) => {
								if ( ! err )
								{
									callback( false );
								}
								else
								{
									callback( 'Error while trying to close the file' )
								}
							});
						}
						else
						{
							callback( 'Error writing to existing file' );
						}
					});
				}
				else
				{
					callback( 'Could not truncate the file' )
				}
			});
		}
		else
		{
			callback( 'Could not open  the file for update. It may not exist yet.' );
		}
	});
};

/**
 * @brief	Delete a file
 *
 * @param	String dir
 * @param	String file
 * @param	Function callback
 *
 * @return	void
 */
lib.delete	= ( dir, file, callback ) => {
	file			= file + '.json';
	let filePath	= path.join( lib.baseDir, dir, file );

	fs.unlink( filePath, ( err ) =>{
		if ( ! err )
		{
			callback( false );
		}
		else
		{
			callback( 'Error deleting file' )
		}
	});
};

// Export the module
module.exports	= lib;
