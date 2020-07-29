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

		this.intervals	= [];
		this.server		= {};

		this._configure( options );
	}

	/**
	 * @brief	Configures the DataServer.
	 *
	 * @details	This is intentionally separated from the constructor so that it could be overwritten in any other implementations of the caching.
	 *
	 * @param	{Object} options
	 *
	 * @return	void
	 */
	_configure( options )
	{
		this.defaultTtl			= typeof options.ttl === 'number'
								? options.ttl
								: DEFAULT_TTL;
		this.defaultTtl			= this.defaultTtl === -1 ? Infinity : this.defaultTtl;

		this.persistPath		= typeof options.persistPath === 'string'
								? options.persistPath
								: DEFAULT_PERSIST_FILE;

		this.persistInterval	= typeof options.persistInterval === 'number'
								? options.persistInterval
								: DEFAULT_PERSIST_INTERVAL;
		this.persistInterval	= this.persistInterval * 1000;

		let gcInterval			= typeof options.gcInterval === 'number'
								? options.gcInterval
								: DEFAULT_GARBAGE_COLLECT_INTERVAL;

		gcInterval				= gcInterval * 1000;

		this.persist			= typeof options.persist === 'boolean'
								? options.persist
								: DEFAULT_PERSIST_RULE;

		if ( this.persist )
		{
			this._setUpPersistence();

			const persistInterval	= setInterval(() => {
				this._garbageCollect();
				this._saveData();
			}, this.persistInterval );

			this.intervals.push( persistInterval );
		}

		const garbageCollectInterval	= setInterval(() => {
			this._garbageCollect();
		}, gcInterval );

		this.intervals.push( garbageCollectInterval );
	}

	/**
	 * @brief	Flushes data from memory, deletes the Cache file and stops all the intervals. Also removes all events
	 *
	 * @return	void
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
	 * @param	{String} key
	 * @param	{Object} options
	 *
	 * @return	Promise
	 */
	async get( key, options = {} )
	{
		if ( typeof key !== 'string' || typeof options !== 'object' )
			return null;

		return this._get( key, options ).catch( this._handleServerDown.bind( this, null ) );
	}

	/**
	 * @brief	Any operations with the data server should reject if the data server is not responding
	 *
	 * @return	*
	 */
	_handleServerDown( returnValue = null )
	{
		const error	= 'The data server is not responding';

		Loggur.log( error, Loggur.LOG_LEVELS.info );
		this.emit( 'serverError', { error } );

		return returnValue;
	}

	/**
	 * @brief	Gets the data
	 *
	 * @details	Prunes the data if it is expired
	 *
	 * @param	{String} key
	 * @param	{Object} [options={}]
	 *
	 * @return	Promise
	 */
	async _get( key, options = {} )
	{
		return new Promise( async ( resolve ) => {
			const dataSet	= await this._prune( key, options );

			if ( dataSet === null )
				return resolve( dataSet );

			return resolve( dataSet.value );
		});
	}

	/**
	 * @brief	Sets the value to the data server
	 *
	 * @param	{String} key
	 * @param	{*} value
	 * @param	{Number} [ttl=0]
	 * @param	{Object} [options={}]
	 *
	 * @return	Promise
	 */
	async set( key, value, ttl = 0, options = {} )
	{
		if (
			typeof key !== 'string'
			|| value === null
			|| value === undefined
			|| typeof ttl !== 'number'
			|| typeof options !== 'object'
		) {
			return null;
		}

		return this._set( key, value, ttl, options ).catch( this._handleServerDown.bind( this, null ) );
	}

	/**
	 * @brief	Sets the data
	 *
	 * @details	Resolves the data if it was correctly set, otherwise resolves to null
	 *
	 * @param	{String} key
	 * @param	{*} value
	 * @param	{Number} ttl
	 * @param	{Object} options
	 *
	 * @return	Promise
	 */
	async _set( key, value, ttl, options )
	{
		return new Promise(( resolve ) => {
			const persist	= typeof options.persist !== 'boolean'
							? this.persist
							: options.persist;

			const dataSet	= this._makeDataSet( key, value, ttl, persist );
			resolve( this.server[key] = dataSet );
		});
	}

	/**
	 * @brief	Increment a numeric key value
	 *
	 * @param	{String} key
	 * @param	{Number} [value=1]
	 * @param	{Object} [options={}]
	 *
	 * @return	Promise
	 */
	async increment( key, value = 1, options = {} )
	{
		if (
			typeof key !== 'string'
			|| typeof value !== 'number'
			|| typeof options !== 'object'
		) {
			return null;
		}

		return this._increment( key, value, options ).catch( this._handleServerDown.bind( this, null ) );
	}

	/**
	 * @brief	Increment a numeric key value
	 *
	 * @details	Does no async operations intentionally
	 *
	 * @param	{String} key
	 * @param	{Number} value
	 * @param	{Object} options
	 *
	 * @return	Promise
	 */
	async _increment( key, value, options )
	{
		return new Promise( async ( resolve, reject ) => {
			const dataSet	= await this._prune( key, options );

			if ( dataSet === null )
				return resolve( null );

			if ( typeof dataSet.value !== 'number' )
				return resolve( null );

			dataSet.value	+= value;
			dataSet.ttl		= this._getExpirationDateFromTtl( dataSet.ttl );

			this.server[key] = dataSet;

			resolve( dataSet.value );
		});
	}

	/**
	 * @brief	Decrements a numeric key value
	 *
	 * @param	{String} key
	 * @param	{Number} [value=1]
	 * @param	{Object} [options={}]
	 *
	 * @return	Promise
	 */
	async decrement( key, value = 1, options = {} )
	{
		if (
			typeof key !== 'string'
			|| typeof value !== 'number'
			|| typeof options !== 'object'
		) {
			return null;
		}

		return this._decrement( key, value, options ).catch( this._handleServerDown.bind( this, null ) );
	}

	/**
	 * @brief	Decrements a numeric key value
	 *
	 * @details	Does no async operations intentionally
	 *
	 * @param	{String} key
	 * @param	{Number} value
	 * @param	{Object} options
	 *
	 * @return	Promise
	 */
	async _decrement( key, value, options )
	{
		return new Promise( async ( resolve, reject ) => {
			const dataSet	= await this._prune( key, options );

			if ( dataSet === null )
				return resolve( null );

			if ( typeof dataSet.value !== 'number' )
				return resolve( null );

			dataSet.value	-= value;
			dataSet.ttl		= this._getExpirationDateFromTtl( dataSet.ttl );

			this.server[key] = dataSet;

			resolve( dataSet.value );
		});
	}

	/**
	 * @brief	Locking mechanism. Will return a boolean if the lock was ok
	 *
	 * @param	{String} key
	 * @param	{Object} [options={}]
	 *
	 * @return	Promise
	 */
	async lock( key, options = {} )
	{
		if ( typeof key !== 'string' || typeof options !== 'object' )
			return false;

		return this._lock( key, options ).catch( this._handleServerDown.bind( this, false ) );
	}

	/**
	 * @brief	Locking mechanism. Will return a boolean if the lock was ok
	 *
	 * @param	{String} key
	 * @param	{Object} options
	 *
	 * @return	Boolean
	 */
	async _lock( key, options )
	{
		return new Promise(( resolve ) => {
			const ttl		= -1;
			const persist	= false;

			const isNew		= typeof this.server[key] === 'undefined';

			if ( isNew )
				this.server[key]	= this._makeDataSet( key, DataServer.LOCK_VALUE, ttl, persist );

			resolve( isNew );
		});
	}

	/**
	 * @brief	Releases the lock
	 *
	 * @param	{String} key
	 * @param	{Object} [options={}]
	 *
	 * @return	Promise
	 */
	async unlock( key, options = {} )
	{
		if ( typeof key !== 'string' || typeof options !== 'object' )
			return false;

		return this._unlock( key, options ).catch( this._handleServerDown.bind( this, false ) );
	}

	/**
	 * @brief	Releases the key
	 *
	 * @param	{String} key
	 * @param	{Object} options
	 *
	 * @return	Boolean
	 */
	async _unlock( key, options )
	{
		return new Promise(( resolve ) => {
			const exists	= typeof this.server[key] !== 'undefined';

			if ( exists )
				delete this.server[key];

			resolve( true );
		});
	}

	/**
	 * @brief	Makes a new dataSet from the data
	 *
	 * @param	{String} key
	 * @param	{*} value
	 * @param	{Number} ttl
	 * @param	{Boolean} persist
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
	 * @param	{String} key
	 * @param	{Number} [ttl=0]
	 * @param	{Object} [options={}]
	 *
	 * @return	Promise
	 */
	async touch( key, ttl = 0, options = {} )
	{
		if ( typeof key !== 'string' || typeof ttl !== 'number' || typeof options !== 'object' )
			return false;

		return this._touch( key, ttl, options ).catch( this._handleServerDown.bind( this, false ) );
	}

	/**
	 * @brief	Touches the key
	 *
	 * @param	{String} key
	 * @param	{Number} ttl
	 * @param	{Object} options
	 *
	 * @return	Promise
	 */
	async _touch( key, ttl, options )
	{
		return new Promise( async ( resolve ) => {
			const dataSet	= await this._prune( key );

			if ( dataSet === null )
				return resolve( false );

			ttl						= ttl === 0 ? dataSet.ttl : ttl;
			dataSet.expirationDate	= this._getExpirationDateFromTtl( ttl );
			resolve( true );
		});
	}

	/**
	 * @brief	Removes a key if it is expired, otherwise, return it
	 *
	 * @param	{String} key
	 * @param	{Object} options
	 *
	 * @return	Promise
	 */
	async _prune( key, options )
	{
		return new Promise( async ( resolve ) => {
			const now		= new Date().getTime() / 1000;
			const dataSet	= typeof this.server[key] === 'object' && typeof this.server[key].expirationDate !== 'undefined'
							? this.server[key]
							: null;

			if ( dataSet !== null && this.server[key].expirationDate === null )
				this.server[key].expirationDate	= Infinity;

			if ( dataSet === null || now > dataSet.expirationDate )
			{
				await this.delete( key );

				return resolve( null );
			}

			resolve( dataSet );
		});
	}

	/**
	 * @brief	Completely removes the key from the server
	 *
	 * @details	Returns true on success and false on failure. If the key does not exist, false will be returned
	 *
	 * @param	{String} key
	 * @param	{Object} [options={}]
	 *
	 * @return	Promise
	 */
	async delete( key, options = {} )
	{
		if ( typeof key === 'string' && typeof options === 'object' )
			return this._delete( key, options ).catch( this._handleServerDown.bind( this, false ) );

		return false;
	}

	/**
	 * @brief	Deletes the key from the server
	 *
	 * @param	{String} key
	 * @param	{Object} options
	 *
	 * @return	Promise
	 */
	_delete( key, options )
	{
		return new Promise(( resolve ) => {
			if ( typeof this.server[key] === 'undefined' )
				return resolve( true );

			this.server[key]	= undefined;
			delete this.server[key];

			resolve( true );
		});
	}

	/**
	 * @brief	Returns how many keys there are
	 *
	 * @details	THIS IS USED FOR TESTING PURPOSES ONLY
	 *
	 * @return	Number
	 */
	/* istanbul ignore next */
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
			if ( ! {}.hasOwnProperty.call( this.server, key ) )
				continue;

			this._get( key ).catch( this._handleServerDown.bind( this ) );
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
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( this.server, key ) )
				continue;

			const dataSet	= this.server[key];

			if ( dataSet.persist === true )
				serverData[key]	= dataSet;
		}

		const tmpFile		= `${this.persistPath}.tmp`;

		const writeStream	= fs.createWriteStream( tmpFile );
		writeStream.setDefaultEncoding( 'utf-8' );

		writeStream.write( JSON.stringify( serverData ) );
		writeStream.end();

		writeStream.on( 'close', () => {
			const readableStream	= fs.createReadStream( tmpFile );
			const writeStream		= fs.createWriteStream( this.persistPath );
			readableStream.pipe( writeStream );

			/* istanbul ignore next */
			readableStream.on( 'error', ( error ) => {
				this.emit( '_saveDataError', { error } );
			});

			/* istanbul ignore next */
			writeStream.on( 'error', ( error ) => {
				this.emit( '_saveDataError', { error } );
			});

			writeStream.on( 'close', () => {
				this.emit( '_saveData' );

				/* istanbul ignore next */
				unlink( tmpFile ).catch( ( error ) => {
					this.emit( '_saveDataError', { error } );
				});
			});
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
			/* istanbul ignore next */
			serverData	= {};
		}

		const currentServerData	= this.server;

		this.server	= { ...currentServerData, ...serverData };
	}

	/**
	 * @brief	Gets the ttl depending on the values given
	 *
	 * @param	{Number} [ttl=-1]
	 *
	 * @return	Number
	 */
	_getTtl( ttl = -1 )
	{
		if ( ttl === -1 )
			return Infinity;

		return ttl > 0 ? ttl : this.defaultTtl;
	}

	/**
	 * @brief	Gets the expiration date of the record given the ttl
	 *
	 * @param	{Number} [ttl=-1]
	 *
	 * @return	Number
	 */
	_getExpirationDateFromTtl( ttl = -1 )
	{
		return new Date().getTime() / 1000 + this._getTtl( ttl );
	}
}

DataServer.LOCK_VALUE	= 'lock';

module.exports			= DataServer;