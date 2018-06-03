'use strict';

/**
 * @brief	DataStore class extended by all data stores used by the session
 */
class DataStore
{
	/**
	 * @param	Object options
	 */
	constructor( options = {} )
	{
		this.options	= options;
	}

	/**
	 * @brief	Sanitizes the configuration
	 *
	 * @return	void
	 */
	sanitize()
	{
		throw new Error( 'Invalid configuration provided' );
	}

	/**
	 * @brief	Sets up the data store
	 *
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	setUp( options = {}, callback = null )
	{
	}

	/**
	 * @brief	Create the namespace
	 *
	 * @param	String namespace
	 * @param	String options
	 * @param	String callback
	 */
	createNamespace( namespace, options = {}, callback = null )
	{
	}

	/**
	 * @brief	Create the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	mixed data
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	create( namespace, recordName, data = {}, options = {}, callback = null )
	{
	}

	/**
	 * @brief	Checks whether the namespace exists
	 *
	 * @param	String namespace
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	existsNamespace( namespace, options = {}, callback = null )
	{
	}
	/**
	 * @brief	Checks whether the record exists
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	exists( namespace, recordName, options = {}, callback = null )
	{
	}

	/**
	 * @brief	Update the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	mixed data
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	update( namespace, recordName, data = {}, options = {}, callback = null )
	{
	}

	/**
	 * @brief	Read the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	read( namespace, recordName, options = {}, callback = null )
	{
	}

	/**
	 * @brief	Delete the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	delete( namespace, recordName, options = {}, callback = null )
	{
	}

	/**
	 * @brief	Get all records from the namespace
	 *
	 * @param	String namespace
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	getAll( namespace, options = {}, callback = null )
	{
	}
}

module.exports	= DataStore;
