'use strict';

const path					= require( 'path' );
const fs					= require( 'fs' );
const DataServer			= require( './data_server' );
const BigMap				= require( '../big_map/big_map' );
const { promisify }			= require( 'util' );

const unlink				= promisify( fs.unlink );

const PROJECT_ROOT			= path.parse( require.main.filename ).dir;
const DEFAULT_PERSIST_FILE	= path.join( PROJECT_ROOT, 'cacheMap' );

/**
 * @brief	A standard in memory data server that implements a map instead of an object
 */
class DataServerMap extends DataServer
{
	/**
	 * @param	{Object} options
	 *
	 * @return	void
	 */
	_configure( options )
	{
		options.persistPath	=  typeof options.persistPath === 'string'
							? options.persistPath
							: DEFAULT_PERSIST_FILE;

		this.useBigMap		= options.useBigMap || false;
		this.server			= this.useBigMap ? new BigMap() : new Map();

		super._configure( options );
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
			fs.writeFileSync( this.persistPath, '{"dataType":"Map","value":[]}' );
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

		this.server.clear();
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

			this.server.set( key, dataSet );

			resolve( dataSet );
		});
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

			this.server.set( key, dataSet );

			resolve( dataSet.value );
		});
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

			this.server.set( key, dataSet );

			resolve( dataSet.value );
		});
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

			const isNew		= ! this.server.has( key );

			if ( isNew )
				this.server.set( key, this._makeDataSet( key, DataServer.LOCK_VALUE, ttl, persist ) );

			resolve( isNew );
		});
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
			if ( this.server.has( key ) )
				this.server.delete( key );

			resolve( true );
		});
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

			this.server.set( key, dataSet );

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

			const dataSet	= this.server.get( key );

			if ( typeof dataSet !== 'undefined' && dataSet.expirationDate === null )
			{
				dataSet.expirationDate	= Infinity;
				this.server.set( key, dataSet );
			}

			if ( typeof dataSet === 'undefined' || now > dataSet.expirationDate )
			{
				await this.delete( key );

				return resolve( null );
			}

			resolve( dataSet );
		});
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
			if ( ! this.server.has( key ) )
				return resolve( true );

			this.server.delete( key );

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
		return this.server.size;
	}

	/**
	 * @brief	Performs Garbage collection to free up memory
	 *
	 * @return	void
	 */
	_garbageCollect()
	{
		this.server.forEach( ( value, key ) => {
			this._get( key ).catch( this._handleServerDown.bind( this ) );
		});
	}

	/**
	 * @brief	Saves the data to a file periodically
	 *
	 * @return	void
	 */
	_saveData()
	{
		let serverData	= new Map();

		this.server.forEach(( value, key ) => {
			if ( value.persist === true )
				serverData.set( key, value );
		});

		const tmpFile		= `${this.persistPath}.tmp`;

		const writeStream	= fs.createWriteStream( tmpFile );
		writeStream.setDefaultEncoding( 'utf-8' );

		writeStream.write( JSON.stringify( serverData, DataServerMap.replacer ) );
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
		let serverData;

		try
		{
			const buffer	= fs.readFileSync( this.persistPath );
			serverData		= JSON.parse( buffer.toString(), DataServerMap.reviver );
		}
		catch ( error )
		{
			/* istanbul ignore next */
			serverData	= new Map();
		}

		const currentServerData	= this.server;

		this.server	= this.useBigMap
					? new BigMap( [...currentServerData, ...serverData] )
					: new Map( [...currentServerData, ...serverData] );
	}

	/**
	 * @param	{*} key
	 * @param	{*} value
	 *
	 * @return	*
	 */
	static replacer( key, value )
	{
		const originalObject	= this[key];

		if( originalObject instanceof Map )
			return { dataType : 'Map', value : Array.from( originalObject.entries() ) };

		if( originalObject instanceof BigMap )
		{
			const value	= [];

			for ( const map of originalObject.maps )
				value.push( { dataType : 'Map', value : Array.from( map.entries() ) } );

			return { dataType : 'BigMap', value };
		}

		else
			return value;
	}

	/**
	 * @param	{*} key
	 * @param	{*} value
	 *
	 * @return	*
	 */
	static reviver( key, value )
	{
		if( typeof value === 'object' && value !== null && value.dataType === 'Map' )
			return new Map( value.value );

		if( typeof value === 'object' && value !== null && value.dataType === 'BigMap' )
		{
			const bigMap	= new BigMap();
			bigMap.maps		= value.value;

			return bigMap;
		}

		return value;
	}
}

DataServer.LOCK_VALUE	= 'lock';

module.exports			= DataServerMap;