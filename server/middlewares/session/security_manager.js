'use strict';

/**
 * @brief	Base SecurityManager that will be implemented by the others
 */
class SecurityManager
{
	/**
	 * @brief	Instantiate the Manager with the provided options
	 *
	 * @param	Array options
	 */
	constructor( options = {} )
	{
		this.options	= options;
	}

	/**
	 * @brief	Gets an instance of the manager
	 *
	 * @return	SecurityManager
	 */
	static getInstance( options )
	{
		return new this( options );
	}

	/**
	 * @brief	Sanitizes the options
	 *
	 * @return	void
	 */
	sanitize()
	{
		throw new Error( 'Invalid Configuration provided' );
	}

	/**
	 * @brief	Get the ID of the current manager
	 *
	 * @return	String
	 */
	static getId()
	{
		console.log( 'NOT IMPLEMENTED' );
	}

	/**
	 * @brief	Get the id of the current manager non statically
	 *
	 * @return	String
	 */
	getId()
	{
		console.log( 'NOT IMPLEMENTED' );
	}

	/**
	 * @brief	Get the path where the manager will be added to
	 *
	 * @return	String|RegExp
	 */
	getPath()
	{
		console.log( 'NOT IMPLEMENTED' );
	}

	/**
	 * @brief	Get the array of methods supported by the current manager
	 *
	 * @return	Array
	 */
	getMethods()
	{
		console.log( 'NOT IMPLEMENTED' );
	}


	/**
	 * @brief	The handler of the security manager
	 *
	 * @details	Ideally it should be avoided calling event.next()
	 *
	 * @param	RequestEvent event
	 * @param	Function next
	 * @param	Function terminate
	 *
	 * @return	void
	 */
	handle( event, next, terminate )
	{
		console.log( 'NOT IMPLEMENTED' );
	}
}

module.exports	= SecurityManager;