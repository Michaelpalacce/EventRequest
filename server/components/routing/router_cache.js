'use strict';

/**
 * @brief	Class responsible for managing the Router caching mechanism
 */
class RouterCache {
	constructor() {
		this._cache					= {};
		this.keyLimit				= RouterCache.DEFAULT_KEY_LIMIT;
		this.lastClearCacheAttempt	= 0;
		this.ttl					= 60 * 60 * 1000;
		this.cacheClearDebounce		= 60 * 1000;
	}

	/**
	 * @brief	Sets the caching key limit
	 *
	 * @param	{Number} [keyLimit=5000]
	 */
	setKeyLimit( keyLimit = RouterCache.DEFAULT_KEY_LIMIT ) {
		this.keyLimit	= keyLimit;
	}

	/**
	 * @brief	Gets the cached key if it exists
	 *
	 * @details	If the key is nto cached, then null will be returned.
	 * 			This will trigger a cache clear first
	 *
	 * @param	{String} key
	 *
	 * @return	{Object|null}
	 */
	getBlock( key ) {
		this.clear();

		if ( typeof this._cache[key] !== 'object' )
			return null;

		return this._renewBlock( this._cache[key] );
	}

	/**
	 * @brief	Renews the block's date
	 *
	 * @param	{Object} block
	 *
	 * @private
	 *
	 * @return	{Object}
	 */
	_renewBlock( block ) {
		block.date	= Date.now();

		return block;
	}

	/**
	 * @brief	Removes the key if it is set
	 *
	 * @param	{String} key
	 */
	deleteBlock( key ) {
		delete this._cache[key];
	}

	/**
	 * @brief	Sets a block, given a key
	 *
	 * @param	{string} key
	 * @param	{Object} block
	 *
	 * @return	{Object}
	 */
	setBlock( key, block ) {
		return this._cache[key]	= this._renewBlock( block );
	}

	/**
	 * @brief	Attempts to keep the cache in check by clearing keys that are not in use
	 *
	 * @details	ttl is the amount of time in milliseconds a key has to be inactive to be deleted
	 * 			This function will only attempt to clear once in the given interval of time: debounceInterval
	 *
	 * @param	{Number} [ttl=3600000]
	 * @param	{Number} [debounceInterval=60000]
	 */
	clear( ttl = this.ttl, debounceInterval = this.cacheClearDebounce ) {
		if ( this.lastClearCacheAttempt + debounceInterval > Date.now() )
			return;

		this.lastClearCacheAttempt	= Date.now();

		for ( const key in this._cache ) {
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( this._cache, key ) )
				continue;

			if ( ( this._cache[key].date + ttl ) <= Date.now() )
				this.deleteBlock( key );
		}
	}

	/**
	 * @brief	Returns if the cache is full
	 *
	 * @details	If the keyLimit is set to 0 then the cache will have an unlimited size
	 *
	 * @return	{Boolean}
	 */
	isFull() {
		if ( this.keyLimit === 0 )
			return false;

		return Object.keys( this._cache ).length >= this.keyLimit;
	}
}

RouterCache.DEFAULT_KEY_LIMIT	= 5000;

module.exports	= RouterCache;
