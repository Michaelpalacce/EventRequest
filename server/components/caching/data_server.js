'use strict';

const { EventEmitter }	= require( 'events' );
const createModel		= require( './data_server_model_creator' );
const SERVER_STATES		= require( './server_states' );

/**
 * @brief	DataServer class extended by all data servers used by the EventRequest Server
 */
class DataServer extends EventEmitter
{
	/**
	 * @param	Object options
	 */
	constructor( options = {} )
	{
		super();
		this.setMaxListeners( 0 );

		this.options		= options;
		this.serverState	= SERVER_STATES.inactive;
		this.sanitize( options );
	}

	/**
	 * @brief	Creates a new model to be used for the given namespace.
	 *
	 * @param	String namespace
	 * @param	Object options
	 *
	 * @return	Object
	 */
	model( namespace, options )
	{
		return createModel( this, namespace, options );
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
	 * @brief	Changes the server state and emits an event
	 *
	 * @param	Number state
	 *
	 * @return	void
	 */
	changeServerState( state )
	{
		this.serverState	= state;
		this.emit( 'state_changed', state );
	}

	/**
	 * @brief	Gets the server state of the data server
	 *
	 * @return	Number
	 */
	getServerState()
	{
		return this.serverState;
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

module.exports	= { DataServer, SERVER_STATES };
