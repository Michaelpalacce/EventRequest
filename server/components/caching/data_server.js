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
	 *
	 * @return	Promise
	 */
	setUp( options = {} )
	{
	}

	/**
	 * @brief	Disconnects from the data server
	 *
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	exit( options = {} )
	{
	}

	/**
	 * @brief	Create the namespace
	 *
	 * @details	If the Data Server supports namespaces ( folders on the file system, tables in CQL/SQl, etc )
	 *
	 * @param	String namespace
	 * @param	String options
	 *
	 * @return	Promise
	 */
	createNamespace( namespace, options = {} )
	{
	}

	/**
	 * @brief	Checks whether the namespace exists
	 *
	 * @details	Returns true if the namespace exists
	 *
	 * @param	String namespace
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	existsNamespace( namespace, options = {} )
	{
	}

	/**
	 * @brief	Deletes the namespace if it exists
	 *
	 * @details	Returns true if the namespace was deleted
	 *
	 * @param	String namespace
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	removeNamespace( namespace, options = {} )
	{
	}

	/**
	 * @brief	Create the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	mixed data
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	create( namespace, recordName, data = {}, options = {} )
	{
	}

	/**
	 * @brief	Checks whether the record exists
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	exists( namespace, recordName, options = {} )
	{
	}

	/**
	 * @brief	Touches ( aka updates the ttl ) of the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	touch( namespace, recordName, options = {} )
	{
	}

	/**
	 * @brief	Update the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	mixed data
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	update( namespace, recordName, data = {}, options = {} )
	{
	}

	/**
	 * @brief	Read the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	read( namespace, recordName, options = {} )
	{
	}

	/**
	 * @brief	Delete the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	delete( namespace, recordName, options = {} )
	{
	}

	/**
	 * @brief	Get all records from the namespace
	 *
	 * @param	String namespace
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	getAll( namespace, options = {} )
	{
	}
}

module.exports	= DataServer;
