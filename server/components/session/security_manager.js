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
	 * @brief	Get the path where the manager will be added to
	 *
	 * @return	String|RegExp
	 */
	getPath()
	{
	}

	/**
	 * @brief	Get the array of methods supported by the current manager
	 *
	 * @return	Array
	 */
	getMethods()
	{
	}

	/**
	 * @brief	The handler of the security manager
	 *
	 * @details	Ideally it should be avoided calling event.next()
	 *
	 * @param	EventRequest event
	 * @param	Function next
	 * @param	Function terminate
	 *
	 * @return	void
	 */
	handle( event, next, terminate )
	{
	}
}

module.exports	= SecurityManager;