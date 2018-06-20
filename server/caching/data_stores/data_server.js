'use strict';

/**
 * @brief	DataServer class extended by all data servers used by the EventRequest Server
 */
class DataServer
{
	/**
	 * @param	Object options
	 */
	constructor( options = {} )
	{
		this.options	= options;
		this.sanitize( options );
	}

	/**
	 * @brief	Gets a instance of the current DataServer
	 *
	 * @return	DataServer
	 */
	static getInstance( options = {} )
	{
		return new this( options );
	}

	/**
	 * @brief	Sanitizes the configuration
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	sanitize( options )
	{
		throw new Error( 'Invalid configuration provided' );
	}

	/**
	 * @brief	Sets up the data server
	 *
	 * @details	Any connections to external sources should be done here if needed
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
	 * @details	If the Data Server supports namespaces ( folders on the file system, tables in CQL/SQl, etc )
	 *
	 * @param	String namespace
	 * @param	String options
	 * @param	String callback
	 *
	 * @return	void
	 */
	createNamespace( namespace, options = {}, callback = null )
	{
	}

	/**
	 * @brief	Checks whether the namespace exists
	 *
	 * @details	Returns true if the namespace exists
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
	 * @brief	Deletes the namespace if it exists
	 *
	 * @details	Returns true if the namespace was deleted
	 *
	 * @param	String namespace
	 * @param	Object options
	 * @param	Function callback
	 *
	 * @return	void
	 */
	removeNamespace( namespace, options = {}, callback = null )
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
	 * @brief	Touches ( aka updates the ttl ) of the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 * @param	Function callback
	 */
	touch( namespace, recordName, options = {}, callback = null )
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

module.exports	= DataServer;
