'use strict';

const DataServer	= require( './data_server' );
const os			= require( 'os' );

/**
 * @brief	Simple caching server that stores cache on the file system
 */
class FilesystemDataServer extends DataServer
{
	constructor( options = {} )
	{
		super( options );
	}

	/**
	 * @see	DataServer::sanitize()
	 */
	sanitize( options )
	{
		this.cachingFolder	= typeof options.cachingFolder === 'string'
							? options.cachingFolder
							: os.tmpdir();
	}
}