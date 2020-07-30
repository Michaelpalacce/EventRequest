/**
 * @brief	Big Map class that implements the public API of Map
 */
class BigMap
{
	constructor (...parameters)
	{
		this.maps	= [new Map( ...parameters )];
		this._limit	= 8000000;
	}

	/**
	 * @brief	Sets the value for the given key
	 *
	 * @details	This function will create a new Map as is needed
	 * 			A new map will be created every 8,000,000 keys
	 *
	 * @param	{*} key
	 * @param	{*} value
	 *
	 * @return	*
	 */
	set( key, value )
	{
		let mapToSet	= null;
		this.maps.forEach( map => {
			if ( map.has( key ) && map.size < this._limit )
				mapToSet	= map;
		});

		if ( mapToSet === null )
		{
			mapToSet	= this.maps[this.maps.length - 1];
			if ( mapToSet.size >= this._limit )
			{
				mapToSet	= new Map();
				this.maps.push( mapToSet );
			}
		}

		return mapToSet.set( key, value );
	}

	/**
	 * @brief	Gets a value given a key
	 *
	 * @param	{*} key
	 *
	 * @return	*
	 */
	get( key )
	{
		const map	= this._findMapWithKey( key );

		if ( typeof map === 'undefined' )
			return map;

		return map.get( key );
	}

	/**
	 * @brief	Deletes a value given a key
	 *
	 * @details	This will remove the Map if it becomes empty when the key is deleted
	 *
	 * @param	{*} key
	 *
	 * @return	*
	 */
	delete( key )
	{
		const map	= this._findMapWithKey( key );

		if ( typeof map === 'undefined' )
			return false;

		const result	= map.delete( key );

		if ( map.size === 0 && this.maps.length !== 1 )
			this.maps.splice( this.maps.indexOf( map ), 1 );

		return result;
	}

	/**
	 * @brief	Checks if a key exists
	 *
	 * @param	{*} key
	 *
	 * @return	Boolean
	 */
	has( key )
	{
		return typeof this._findMapWithKey( key ) !== 'undefined';
	}

	/**
	 * @brief	Clears all the maps
	 *
	 * @details	This will set a new Map to work with
	 *
	 * @return	void
	 */
	clear()
	{
		const oldMaps	= this.maps;
		this.maps		= [new Map()];

		for ( let map of oldMaps )
			map.clear();
	}

	/**
	 * @brief	Returns the current size of the BigMap
	 *
	 * @return	Number
	 */
	get size()
	{
		let size = 0

		for ( let map of this.maps )
			size	+= map.size

		return size
	}

	/**
	 * @param	{Function} callbackFn
	 * @param	{*} thisArg
	 */
	forEach ( callbackFn, thisArg )
	{
		if ( thisArg )
			for ( const result of this )
			{
				const key	= result[0];
				const value	= result[1];

				callbackFn.call( this, value, key, this );
			}
		else
			for ( const result of this )
			{
				const key	= result[0];
				const value	= result[1];

				callbackFn( value, key, this );
			}
	}

	/**
	 * @brief	Returns an Iterator that will return all the BigMap Entries
	 *
	 * @return	{Iterator}
	 */
	entries()
	{
		return this._propIterator( 'entries' );
	}

	/**
	 * @brief	Returns an Iterator that will return all the BigMap Keys
	 *
	 * @return	{Iterator}
	 */
	keys()
	{
		return this._propIterator( 'keys' );
	}

	/**
	 * @brief	Returns an Iterator that will return all the BigMap Values
	 *
	 * @return	{Iterator}
	 */
	values()
	{
		return this._propIterator( 'values' );
	}

	/**
	 * @brief	Called when doing for...of loops
	 *
	 * @return	{Generator}
	 */
	*[Symbol.iterator] ()
	{
		for ( const map of this.maps )
		{
			for ( const value of map )
				yield value;
		}
	}

	/**
	 * @brief	Returns an Iterator for the given element
	 *
	 * @return	{Iterator|Object}
	 */
	_propIterator( elementToGet )
	{
		const that	= this;

		return {
			*[Symbol.iterator](){
				for ( const map of that.maps )
					for ( const element of map[elementToGet]() )
						yield element;7
			}
		}
	}

	/**
	 * @brief	Finds which map exactly has the given key and returns it
	 *
	 * @param	{*} key
	 *
	 * @private
	 *
	 * @return	Map
	 */
	_findMapWithKey( key )
	{
		for ( let index = this.maps.length - 1; index >= 0; index-- )
		{
			const map = this.maps[index];

			if ( map.has( key ) )
				return map;
		}
	}
}

module.exports	= BigMap;
