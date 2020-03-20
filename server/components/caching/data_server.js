'use strict';

const path			= require( 'path' );
const fs			= require( 'fs' );
const { Loggur }	= require( '../logger/loggur' );

/**
 * @var	Number
 */
const PROJECT_ROOT						= path.parse( require.main.filename ).dir;

const DEFAULT_PERSIST_FILE				= path.join( PROJECT_ROOT, 'cache' );
const DEFAULT_PERSIST_RULE				= true;
const DEFAULT_TTL						= 300;
const DEFAULT_PERSIST_INTERVAL			= 10;
const DEFAULT_GARBAGE_COLLECT_INTERVAL	= 60;

/**
 * @brief	A standard in memory data server
 *
 * @details	This acts as a data store. This should not be used in production! This should be extended for your own needs.
 * 			Could be implemented with Memcached or another similar Data Store Server.
 * 			All operations are internally done asynchronous
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
								? options['persistInterval']
								: DEFAULT_PERSIST_INTERVAL;
		this.persistInterval	= this.persistInterval * 1000;

		let gcInterval			= typeof options['gcInterval'] === 'number'
								? options['gcInterval']
								: DEFAULT_GARBAGE_COLLECT_INTERVAL;

		gcInterval				= gcInterval * 1000;

		this.persist			= typeof options['persist'] === 'boolean'
								? options['persist']
								: DEFAULT_PERSIST_RULE;

		this.intervals			= [];

		if ( this.persist )
		{
			if ( fs.existsSync( this.persistPath ) )
			{
				this._loadData();
				this._garbageCollect();
			}
			else
			{
				fs.writeFileSync( this.persistPath, '{}' );
			}

			const persistInterval	= setInterval(()=>{
				this._garbageCollect();
				this._saveData();
			}, this.persistInterval );


			this.intervals.push( persistInterval );
		}

		const garbageCollectInterval	= setInterval(()=>{
			this._garbageCollect();
		}, gcInterval );

		this.intervals.push( garbageCollectInterval );
	}

	/**
	 * @brief	Flushes data from memory, deletes the Cache file and stops all the intervals
	 */
	stop()
	{
		for ( const interval of this.intervals )
			clearInterval( interval );

		if ( fs.existsSync( this.persistPath ) )
			fs.unlinkSync( this.persistPath );

		this.server	= {};
	}

	/**
	 * @brief	Gets the value from the server
	 *
	 * @param	String key
	 *
	 * @return	Object|null
	 */
	async get( key )
	{
		if ( typeof key !== 'string' )
		{
			return null;
		}

		return this._get( key ).catch( this._handleServerDown ) || null;
	}

	/**
	 * @brief	Any operations with the data server should reject if the data server is not responding
	 *
	 * @return	mixed
	 */
	_handleServerDown()
	{
		Loggur.log( 'The data server is not responding', Loggur.LOG_LEVELS.error )
	}

	/**
	 * @brief	Gets the data
	 *
	 * @param	String key
	 *
	 * @return	Promise
	 */
	async _get( key )
	{
		return this._prune( key );
	}

	/**
	 * @brief	Removes the dataSet if it is expired, otherwise returns it. Returns null if removed
	 *
	 * @param	string key
	 *
	 * @return	Promise
	 */
	async _prune( key )
	{
		return new Promise( async ( resolve )=>{
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
				await this.delete( key );

				return resolve( null );
			}

			return resolve( dataSet );
		});
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
	async set( key, value, ttl = 0, persist = null )
	{
		if (
			typeof key !== 'string'
			|| value == null
			|| typeof ttl !== 'number'
			|| ( typeof persist !== 'boolean' && persist !== null )
		) {
			return null;
		}

		persist	= persist === null ? this.persist : persist;

		return this._set( key, value, ttl, persist ).catch( this._handleServerDown );
	}

	/**
	 * @brief	Sets the data
	 *
	 * @details	Resolves the data if it was correctly set, otherwise resolves to null
	 *
	 * @param	String key
	 * @param	mixed value
	 * @param	Number ttl
	 * @param	Boolean persist
	 *
	 * @return	Promise
	 */
	async _set( key, value, ttl, persist )
	{
		return new Promise(( resolve )=>{
			const dataSet	= this._makeDataSet( key, value, ttl, persist );
			resolve( this.server[key] = dataSet );
		})
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
	 * @details	Checks if the arguments are correct
	 *
	 * @param	String key
	 * @param	Number ttl
	 *
	 * @return	Promise
	 */
	async touch( key, ttl = 0 )
	{
		if ( typeof key !== 'string' || typeof ttl !== 'number' )
		{
			return false;
		}

		return this._touch( key, ttl ).catch( this._handleServerDown );
	}

	/**
	 * @brief	Touches the key
	 *
	 * @param	String key
	 * @param	Number ttl
	 *
	 * @return	Promise
	 */
	async _touch( key, ttl = 0 )
	{
		return new Promise( async ( resolve )=>{
			const dataSet	= await this.get( key );

			if ( dataSet === null )
			{
				return resolve( false );
			}

			ttl						= ttl === 0 ? dataSet.ttl : ttl;
			dataSet.expirationDate	= this._getExpirationDateFromTtl( ttl );
			resolve( true );
		});
	}

	/**
	 * @brief	Completely removes the key from the server
	 *
	 * @details	Returns true on success and false on failure. If the key does not exist, false will be returned
	 *
	 * @param	String key
	 *
	 * @return	Promise
	 */
	async delete( key )
	{
		if ( typeof key === 'string' )
		{
			return this._delete( key ).catch( this._handleServerDown );
		}

		return new Promise(( resolve )=>{
			resolve( false );
		});
	}

	/**
	 * @brief	Deletes the key from the server
	 *
	 * @param	String key
	 *
	 * @return	Promise
	 */
	_delete( key )
	{
		return new Promise(( resolve )=>{
			if ( typeof this.server[key] === 'undefined' )
			{
				return resolve( false );
			}

			this.server[key]	= undefined;
			delete this.server[key];

			resolve( true );
		})
	}

	/**
	 * @brief	Returns how many keys there are
	 *
	 * @details	THIS IS USED FOR TESTING PURPOSES ONLY
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
			this._prune( key ).catch( this._handleServerDown );
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

		const tmpFile		= `${this.persistPath}.tmp`;

		const writeStream	= fs.createWriteStream( tmpFile );
		writeStream.setDefaultEncoding( 'utf-8' );

		writeStream.write( JSON.stringify( serverData ) );
		writeStream.end();

		fs.renameSync( tmpFile, this.persistPath );
	}

	/**
	 * @brief	Merge server data from file
	 *
	 * @return	void
	 */
	_loadData()
	{
		let serverData	= {};
		try
		{
			const buffer	= fs.readFileSync( this.persistPath );
			serverData		= JSON.parse( buffer.toString() );
		}
		catch ( e )
		{
		}

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