'use strict';

const DataServer	= require( '../caching/data_server' );
const { makeId }	= require( '../helpers/unique_id' );

/**
 * @brief	Leaky bucket implementation
 */
class Bucket
{
	/**
	 * @details	Refill Amount is how many tokens to refill after the refillTime
	 * 			Refill Time is how often tokens should be renewed
	 * 			Max Amount is the max amount of tokens to be kept
	 * 			The given data store will be used, if none given an in memory one will be used
	 * 			Prefix will be used to prefix all keys in the datastore
	 * 			key should be passed if this Bucket wants to connect to another one in the datastore or you want to specify your own key
	 * 			dataStoreRefetchInterval will be how often to retry the dataStore in ms, should be 1 or 2 but may be increased if the dataStore can't handle the traffice
	 *
	 * @param	{Number} [refillAmount=100]
	 * @param	{Number} [refillTime=60]
	 * @param	{Number} [maxAmount=1000]
	 * @param	{String} [prefix=Bucket.DEFAULT_PREFIX]
	 * @param	{String} [key=null]
	 * @param	{DataServer} [dataStore=null]
	 * @param	{Number} [dataStoreRefetchInterval=1]
	 */
	constructor(
		refillAmount = 100,
		refillTime = 60,
		maxAmount = 1000,
		prefix = Bucket.DEFAULT_PREFIX,
		key = null,
		dataStore = null,
		dataStoreRefetchInterval = 1
	) {
		this.refillAmount				= refillAmount;
		this.refillTime					= refillTime * 1000;
		this.maxAmount					= maxAmount;
		this.prefix						= prefix;
		this.dataStoreRefetchInterval	= dataStoreRefetchInterval;
		this.maxCounter					= Math.max( Math.floor( 100 / dataStoreRefetchInterval ), 1 );

		if ( dataStore === null || ! ( dataStore instanceof DataServer ) )
		{
			this.dataStore	= new DataServer({
				ttl		: this.maxAmount / this.refillAmount * refillTime * 2,
				persist	: false
			});
		}
		else
		{
			this.dataStore	= dataStore;
		}

		this.key	= key;
	}

	/**
	 * @brief	Initializes the bucket
	 *
	 * @return	void
	 */
	async init()
	{
		if ( this.key !== null )
		{
			await this._getValue().catch( this.handleError );
			await this._getLastUpdate().catch( this.handleError );
			return;
		}

		await this._getUniqueKey().catch( this.handleError );
		await this.reset();
	}

	/**
	 * @brief	Handles promise errors
	 *
	 * @param	{Error} error
	 *
	 * @return	void
	 */
	handleError( error )
	{
		setImmediate(() => {
			throw error;
		});
	}

	/**
	 * @brief	Creates a unique key that is not present in the data store
	 *
	 * @return	String
	 */
	async _getUniqueKey()
	{
		let key		= null;
		let result	= '';

		while ( result !== null )
		{
			key		= `${this.prefix}//${makeId( 64 )}`;
			result	= await this.dataStore.get( `${key}//value` ).catch( this.handleError );
		}

		return this.key	= key;
	}

	/**
	 * @brief	Gets the current value
	 *
	 * @return	Number
	 */
	async _getValue()
	{
		const result	= await this.dataStore.get( `${this.key}//value` ).catch( this.handleError );

		if ( result !== null )
			return result;

		await this._setValue( this.maxAmount ).catch( this.handleError );

		return this.maxAmount;
	}

	/**
	 * @brief	Sets the value
	 *
	 * @param	{Number} value
	 *
	 * @return	void
	 */
	async _setValue( value )
	{
		await this.dataStore.set( `${this.key}//value`, value ).catch( this.handleError );
	}

	/**
	 * @brief	Gets the current value
	 *
	 * @return	Promise
	 */
	async _getLastUpdate()
	{
		const result	= await this.dataStore.get( `${this.key}//lastUpdate` ).catch( this.handleError );

		if ( result !== null )
			return result;

		const currTime	= this._getCurrentTime();
		await this._setLastUpdate( currTime ).catch( this.handleError );

		return currTime;
	}

	/**
	 * @brief	Sets the lastUpdate
	 *
	 * @param	{Number} lastUpdate
	 *u
	 * @return	void
	 */
	async _setLastUpdate( lastUpdate )
	{
		await this.dataStore.set( `${this.key}//lastUpdate`, lastUpdate ).catch( this.handleError );
	}

	/**
	 * @brief	Resets the value to the maximum available tokens
	 *
	 * @return	Promise
	 */
	async reset()
	{
		await this._setValue( this.maxAmount ).catch( this.handleError );
		await this._setLastUpdate( this._getCurrentTime() ).catch( this.handleError );
	}

	/**
	 * @brief	Fetches new data from the DataStore
	 *
	 * @return	Object
	 */
	async _fetchData()
	{
		const lastUpdate	= await this._getLastUpdate().catch( this.handleError );
		const value			= await this._getValue().catch( this.handleError );

		return { value, lastUpdate };
	}

	/**
	 * @brief	Lock the execution
	 *
	 * @return	Promise
	 */
	_lock()
	{
		return new Promise( async ( resolve, reject ) => {
			await this._doLock( resolve, reject );
		});
	}

	/**
	 * @brief	Implement a locking mechanism
	 *
	 * @param	{Function} resolve
	 * @param	{Function} reject
	 * @param	{Number} counter
	 *
	 * @return	Promise
	 */
	async _doLock( resolve, reject, counter = 0 )
	{
		const result	= await this.dataStore.lock( `${this.key}//lock` ).catch( this.handleError );

		if ( result !== null && result === true )
		{
			return resolve( true );
		}

		setTimeout(() => {
			counter++;

			if ( counter > this.maxCounter )
				return resolve( false );

			this._doLock( resolve, reject, counter );
		}, this.dataStoreRefetchInterval );
	}

	/**
	 * @brief	Unlocks the given key
	 *
	 * @return	Promise
	 */
	async _unlock()
	{
		await this.dataStore.unlock( `${this.key}//lock` ).catch( this.handleError )
	}

	/**
	 * @brief	Gets the current available tokens
	 *
	 * @details	The data does not need to be passed ( it is passed from the reduce function to reduce calls to the data store )
	 *
	 * @param	{Object} data
	 *
	 * @return	Promise
	 */
	async get( data = null )
	{
		if ( data === null )
			data	= await this._fetchData().catch( this.handleError );

		const refillCount	= this._refillCount( data.lastUpdate );
		return data.value	= Math.min( this.maxAmount, data.value + refillCount * this.refillAmount );
	}

	/**
	 * @brief	Get a token
	 *
	 * @details	Resolves to true if there are tokens left otherwise, rejects to false
	 *
	 * @param	{Number} [tokens=1]
	 *
	 * @return	Boolean
	 */
	async reduce( tokens = 1 )
	{
		const lockHandle	= await this._lock().catch( this.handleError );

		if ( lockHandle === false )
			return false;

		const data	= await this._fetchData().catch( this.handleError );
		await this.get( data ).catch( this.handleError );
		data.lastUpdate	+= this._refillCount( data.lastUpdate ) * this.refillTime;

		if ( tokens > data.value )
		{
			await this._unlock();
			return false;
		}

		data.value	-= tokens;

		await this._setValue( data.value );
		await this._setLastUpdate( data.lastUpdate );
		await this._unlock().catch( this.handleError );

		return true;
	}

	/**
	 * @brief	How much should be refilled given the last update
	 *
	 * @param	{Number} lastUpdate
	 *
	 * @return	Number
	 */
	_refillCount( lastUpdate )
	{
		return Math.floor( ( this._getCurrentTime() - lastUpdate ) / this.refillTime );
	}

	/**
	 * @brief	Checks if the bucket has all tokens available
	 *
	 * @return	Boolean
	 */
	async isFull()
	{
		return await this.get() === this.maxAmount;
	}

	/**
	 * @brief	Gets the current timestamp in seconds
	 *
	 * @return	Number
	 */
	_getCurrentTime()
	{
		return Date.now();
	}
}

Bucket.DEFAULT_PREFIX	= '$LB:';

module.exports	= Bucket;