'use strict';

const DataServer	= require( './data_server' );
const os			= require( 'os' );
const fs			= require( 'fs' );
const path			= require( 'path' );

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

	/**
	 * @see	DataServer::setUp()
	 */
	setUp( options = {}, callback = ()=>{} )
	{
		if ( ! fs.existsSync( this.cachingFolder ) )
		{
			fs.mkdir( this.cachingFolder, null, callback );
		}
		else
		{
			callback( false );
		}
	}

	/**
	 * @see	DataServer::createNamespace()
	 */
	createNamespace( namespace, options = {}, callback = ()=>{} )
	{
		if ( typeof namespace !== 'string' )
		{
			callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
		}
		else
		{
			let newNamespace	= path.join( this.cachingFolder, namespace );

			this.existsNamespace( newNamespace, {}, ( exists )=>{
				if ( ! exists )
				{
					fs.mkdir( newNamespace, null, callback );
				}
				else
				{
					callback( new Error( `The namespace ${namespace} already exists!` ) );
				}
			});
		}
	}

	/**
	 * @see	DataServer::existsNamespace()
	 */
	existsNamespace( namespace, options = {}, callback = null )
	{
		if ( typeof namespace !== 'string' )
		{
			callback( new Error( `The namespace should be a string, ${typeof namespace} given.` ) );
			return;
		}

		callback( fs.existsSync( namespace ) );
	}

	/**
	 * @see	DataServer::create()
	 */
	create( namespace, recordName, ttl = 0, data = {}, options = {}, callback = null )
	{
		if ( typeof recordName !== 'string' )
		{
			callback( new Error( `Record should be a string. ${typeof recordName} given.` ) );
		}
		else
		{
			this.existsNamespace( namespace, {}, ( exists ) =>{
				if ( ! exists )
				{
					callback( new Error( `Could not create record in namespace that does not exist.` ) );
				}
				else
				{

				}
			});
		}
	}
}

module.exports	= FilesystemDataServer;