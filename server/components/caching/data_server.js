'use strict';

const path	= require( 'path' );
const fs	= require( 'fs' );

/**
 * @var	Number
 */
const DEFAULT_TTL						= 5 * 60;
const PROJECT_ROOT						= path.parse( require.main.filename ).dir;

const DEFAULT_PERSIST_FILE				= path.join( PROJECT_ROOT, 'cache' );
const DEFAULT_PERSIST_RULE				= true;
const DEFAULT_PERSIST_INTERVAL			= 10 * 1000;
const DEFAULT_GARBAGE_COLLECT_INTERVAL	= 60 * 1000;

/**
 * @brief	A standard in memory data server
 *
 * @details	This acts as a data store. This should not be used in production! This should be extended for your own needs.
 * 			Could be implemented with Memcached or another similar Data Store Server.
 */
class DataServer
{
	constructor( options = {} )
	{
		this._configure( options );
	}

	/**
	 * @brief	Configures the DataServer.
	 *
	 * @details	This is intentionally separated from the constructor so that it could be overwritten in any other implementations of the caching.
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	_configure( options )
	{
		this.server				= {};

		this.defaultTtl			= typeof options['ttl'] === 'number'
								? options['ttl']
								: DEFAULT_TTL;

		this.persistPath		= typeof options['persistPath'] === 'string'
								? options['persistPath']
								: DEFAULT_PERSIST_FILE;

		this.persistInterval	= typeof options['persistInterval'] === 'number'
								? options['persistInterval'] * 1000
								: DEFAULT_PERSIST_INTERVAL;

		const gcInterval		= typeof options['gcInterval'] === 'number'
								? options['gcInterval'] * 1000
								: DEFAULT_GARBAGE_COLLECT_INTERVAL;

		const persist			= typeof options['persist'] === 'boolean'
								? options['persist']
								: DEFAULT_PERSIST_RULE;

		if ( persist )
		{
			if ( fs.existsSync( this.persistPath ) )
			{
				this._loadData();
				this._garbageCollect();
			}

			setInterval(()=>{
				this._garbageCollect();
				this._saveData();
			}, this.persistInterval )
		}

		setInterval(()=>{
			this._garbageCollect();
		}, gcInterval );
	}

	/**
	 * @brief	Gets the value from the server
	 *
	 * @param	String key
	 *
	 * @return	Object|null
	 */
	get( key )
	{
		return this._get( key );
	}

	/**
	 * @brief	Gets the data
	 *
	 * @param	String key
	 *
	 * @return	Object|null
	 */
	_get( key )
	{
		return this._prune( key );
	}

	/**
	 * @brief	Removes the dataSet if it is expired, otherwise returns it. Returns null if removed
	 *
	 * @param	string key
	 *
	 * @return	Object|null
	 */
	_prune( key )
	{
		const now		= new Date().getTime() / 1000;
		const dataSet	= typeof this.server[key] === 'object' && typeof this.server[key].expirationDate !== 'undefined'
						? this.server[key]
						: null;

		if ( dataSet !== null && this.server[key].expirationDate === null )
		{
			this.server[key].expirationDate	= Infinity;
		}

		if ( dataSet === null || now > dataSet.expirationDate )
		{
			this.delete( key );

			return null;
		}

		return dataSet;
	}

	/**
	 * @brief	Sets the value to the data server
	 *
	 * @param	String key
	 * @param	mixed value
	 * @param	Number ttl
	 * @param	Boolean persist
	 *
	 * @return	Object
	 */
	set( key, value, ttl = 0, persist = true )
	{
		if (
			typeof key !== 'string'
			&& typeof value !== 'object'
			&& typeof ttl !== 'number'
			&& typeof persist !== 'boolean'
		) {
			return null;
		}

		return this._set( key, value, ttl, persist )
	}

	/**
	 * @brief	Sets the data
	 *
	 * @param	String key
	 * @param	mixed value
	 * @param	Number ttl
	 * @param	Boolean persist
	 *
	 * @return	Object
	 */
	_set( key, value, ttl, persist )
	{
		const dataSet			= this._makeDataSet( key, value, ttl, persist );
		return this.server[key]	= dataSet;
	}

	/**
	 * @brief	Makes a new dataSet from the data
	 *
	 * @param	String key
	 * @param	mixed value
	 * @param	Number ttl
	 *
	 * @return	Object
	 */
	_makeDataSet( key, value, ttl, persist )
	{
		const expirationDate	= this._getExpirationDateFromTtl( ttl );
		return { key, value, ttl, expirationDate, persist };
	}

	/**
	 * @brief	Touches the given key
	 *
	 * @param	String key
	 * @param	Number ttl
	 *
	 * @return	Boolean
	 */
	touch( key, ttl = 0 )
	{
		const dataSet	= this.get( key );

		if ( dataSet === null )
		{
			return false;
		}

		ttl						= ttl === 0 ? dataSet.ttl : ttl;
		dataSet.expirationDate	= this._getExpirationDateFromTtl( ttl );
		return true;
	}

	/**
	 * @brief	Completely removes the key from the cache
	 *
	 * @param	String key
	 *
	 * @return	void
	 */
	delete( key )
	{
		this.server[key]	= undefined;
		delete this.server[key];
	}

	/**
	 * @brief	Returns how many keys there are
	 *
	 * @return	Number
	 */
	length()
	{
		return Object.keys( this.server ).length;
	}

	/**
	 * @brief	Performs Garbage collection to free up memory
	 *
	 * @return	void
	 */
	_garbageCollect()
	{
		for ( let key in this.server )
		{
			this._prune( key );
		}
	}

	/**
	 * @brief	Saves the data to a file periodically
	 *
	 * @return	void
	 */
	_saveData()
	{
		let serverData	= {};
		for ( const key in this.server )
		{
			const dataSet	= this.server[key];

			if ( dataSet.persist === true )
			{
				serverData[key]	= dataSet;
			}
		}

		const writeStream	= fs.createWriteStream( this.persistPath );
		writeStream.setDefaultEncoding( 'utf-8' );

		writeStream.write( JSON.stringify( serverData ) );
		writeStream.end();
	}

	/**
	 * @brief	Merge server data from file
	 *
	 * @return	void
	 */
	_loadData()
	{
		const buffer	= fs.readFileSync( this.persistPath );
		this._loadServerData( JSON.parse( buffer.toString() ) );
	}

	/**
	 * @brief	Loads a dumped data to the caching server
	 *
	 * @param	object serverData
	 *
	 * @return	void
	 */
	_loadServerData(serverData )
	{
		const currentServerData	= this.server;

		this.server	= { ...currentServerData, ...serverData };
	}

	/**
	 * @brief	Gets the expiration date of the record given the ttl
	 *
	 * @param	Number ttl
	 *
	 * @return	Number
	 */
	_getExpirationDateFromTtl( ttl = -1 )
	{
		if ( ttl === -1 )
		{
			return Infinity;
		}
		ttl	= ttl > 0 ? ttl : this.defaultTtl;
		return new Date().getTime() / 1000 + ttl;
	}
}

module.exports	= DataServer;