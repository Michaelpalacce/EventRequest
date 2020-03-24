'use strict';

const path				= require( 'path' );
const fs				= require( 'fs' );
const { Loggur }		= require( '../logger/loggur' );
const { promisify }		= require( 'util' );
const { EventEmitter }	= require( 'events' );

const unlink			= promisify( fs.unlink );

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
class DataServer extends EventEmitter
{
	constructor( options = {} )
	{
		super();
		this.setMaxListeners( 0 );

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
			this._setUpPersistence();

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
	 * @brief	Flushes data from memory, deletes the Cache file and stops all the intervals. Also removes all events
	 */
	stop()
	{
		this._stop();

		for ( const interval of this.intervals )
			clearInterval( interval );

		this.emit( 'stop' );
		this.removeAllListeners();
	}

	/**
	 * @brief	Sets up the persistence
	 *
	 * @return	void
	 */
	_setUpPersistence()
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
	}

	/**
	 * @brief	Stops the server
	 *
	 * @return	void
	 */
	_stop()
	{
		if ( fs.existsSync( this.persistPath ) )
			fs.unlinkSync( this.persistPath );

		this.server	= {};
	}

	/**
	 * @brief	Gets the value from the server
	 *
	 * @param	String key
	 *
	 * @return	Promise|null
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
		const error	= 'The data server is not responding';

		Loggur.log( error, Loggur.LOG_LEVELS.error );
		this.emit( 'serverError', { error } );
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
	 * @details	The second value resolved will be a parameter if it existed or not
	 *
	 * @param	String key
	 * @param	mixed value
	 * @param	Number ttl
	 * @param	Boolean persist
	 *
	 * @return	Promise
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
			const isNew	= typeof this.server[key] === 'undefined';
			const dataSet	= this._makeDataSet( key, value, ttl, persist, isNew );
			resolve( this.server[key] = dataSet );
		})
	}

	/**
	 * @brief	Increment a numeric key value
	 *
	 * @param	key String
	 * @param	value Number
	 * @param	ttl Number
	 *
	 * @return	Promise|null
	 */
	async increment( key, value = 1, ttl = 0 )
	{
		if (
			typeof key !== 'string'
			|| typeof value !== 'number'
			|| typeof ttl !== 'number'
		) {
			return null;
		}

		return this._increment( key, value, ttl ).catch( this._handleServerDown );
	}

	/**
	 * @brief	Increment a numeric key value
	 *
	 * @details	Does no async operations intentionally
	 *
	 * @param	key String
	 * @param	value Number
	 * @param	ttl Number
	 *
	 * @return	Promise
	 */
	async _increment( key, value = 1, ttl = 0 )
	{
		return new Promise( async ( resolve, reject )=>{
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
				if ( typeof this.server[key] === 'undefined' )
				{
					return resolve( null );
				}

				this.server[key]	= undefined;
				delete this.server[key];

				return resolve( null );
			}

			if ( ! dataSet )
			{
				resolve( null );
			}

			if ( typeof dataSet.value !== 'number' )
			{
				resolve( null );
			}

			dataSet.value	+= value;
			dataSet.ttl		= this._getExpirationDateFromTtl( ttl );

			resolve( this.server[key] = dataSet );
		});
	}

	/**
	 * @brief	Decrements a numeric key value
	 *
	 * @param	key String
	 * @param	value Number
	 * @param	ttl Number
	 *
	 * @return	Promise|null
	 */
	async decrement( key, value = 1, ttl = 0 )
	{
		if (
			typeof key !== 'string'
			|| typeof value !== 'number'
			|| typeof ttl !== 'number'
		) {
			return null;
		}

		return this._decrement( key, value, ttl ).catch( this._handleServerDown );
	}

	/**
	 * @brief	Decrements a numeric key value
	 *
	 * @details	Does no async operations intentionally
	 *
	 * @param	key String
	 * @param	value Number
	 * @param	ttl Number
	 *
	 * @return	Promise
	 */
	async _decrement( key, value = 1, ttl = 0 )
	{
		return new Promise( async ( resolve, reject )=>{
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
				if ( typeof this.server[key] === 'undefined' )
				{
					return resolve( null );
				}

				this.server[key]	= undefined;
				delete this.server[key];

				return resolve( null );
			}

			if ( ! dataSet )
			{
				resolve( null );
			}

			if ( typeof dataSet.value !== 'number' )
			{
				resolve( null );
			}

			dataSet.value	-= value;
			dataSet.ttl		= this._getExpirationDateFromTtl( ttl );

			resolve( this.server[key] = dataSet );
		});
	}

	/**
	 * @brief	Makes a new dataSet from the data
	 *
	 * @param	String key
	 * @param	mixed value
	 * @param	Number ttl
	 * @param	Boolean persist
	 * @param	Boolean isNew
	 *
	 * @return	Object
	 */
	_makeDataSet( key, value, ttl, persist, isNew )
	{
		const expirationDate	= this._getExpirationDateFromTtl( ttl );
		return { key, value, ttl, expirationDate, persist, isNew };
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
		for ( const key in this.server )
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

		writeStream.on( 'close', ()=>{
			const readableStream	= fs.createReadStream( tmpFile );
			const writeStream		= fs.createWriteStream( this.persistPath );
			readableStream.pipe( writeStream );

			readableStream.on( 'error', ( error )=>{
				Loggur.log( error, Loggur.LOG_LEVELS.error );
				this.emit( '_saveDataError', { error } );
			});

			writeStream.on( 'error', ( error )=>{
				Loggur.log( error, Loggur.LOG_LEVELS.error );
				this.emit( '_saveDataError', { error } );
			});

			writeStream.on( 'close', ()=>{
				this.emit( '_saveData' );
				unlink( tmpFile ).catch( ( error )=>{
					Loggur.log( error, Loggur.LOG_LEVELS.error );
					this.emit( '_saveDataError', { error } );
				});
			})
		});
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
		catch ( error )
		{
			Loggur.log( error, Loggur.LOG_LEVELS.error );
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