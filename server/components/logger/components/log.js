'use strict';

/**
 * @brief	Constants
 */
const LOG_LEVELS	= {
	error	: 100,
	warning	: 200,
	notice	: 300,
	info	: 400,
	verbose	: 500,
	debug	: 600
};
const DEFAULT_LOG_LEVEL			= LOG_LEVELS.error;

/**
 * @brief	Log object used to transport information inside the loggur
 */
class Log
{
	/**
	 * @param	mixed log
	 */
	constructor( log, level )
	{
		this.level		= 0;
		this.message	= '';
		this.timestamp	= 0;
		this.uniqueId	= '';

		this.processLog( log, level );
	}

	/**
	 * @brief	Processes the given log
	 *
	 * @param	mixed log
	 * @param	Number level
	 *
	 * @return	void
	 */
	processLog( message = '', level = LOG_LEVELS.error )
	{
		let logType	= typeof message;
		this.level	= typeof level === 'number' ? level : DEFAULT_LOG_LEVEL;

		if ( message instanceof Error )
		{
			this.message	= message.stack;
		}
		else if ( logType === 'string' )
		{
			this.message	= message;
		}
		else if ( logType === 'undefined' )
		{
			this.message	= '';
		}
		else
		{
			this.message	= JSON.stringify( message );
		}

		this.timestamp	= Log.getUNIXTime();
	}

	/**
	 * @brief	Gets the log level of the provided log
	 *
	 * @return	Number
	 */
	getLevel()
	{
		return this.level;
	}

	/**
	 * @brief	Gets the log message of the provided log
	 *
	 * @return	String
	 */
	getMessage()
	{
		return this.message;
	}

	/**
	 * @brief	Gets the log timestamp of the provided log in UNIX time
	 *
	 * @return	Number
	 */
	getTimestamp()
	{
		return this.timestamp;
	}

	/**
	 * @brief	Get the unique id set by the Loggur
	 *
	 * @return	String
	 */
	getUniqueId()
	{
		return this.uniqueId;
	}

	/**
	 * @param	String uniqueId
	 *
	 * @return	void
	 */
	setUniqueId( uniqueId )
	{
		this.uniqueId	= uniqueId;
	}

	/**
	 * @brief	Get the log in a string format
	 *
	 * @return	String
	 */
	toString()
	{
		return `{Level: ${this.getLevel()}, Message: ${this.getMessage()}, Time: ${this.getTimestamp()}`;
	}

	/**
	 * @brief	Get a new instance of the Log
	 *
	 * @param	mixed log
	 * @param	Number level
	 *
	 * @return	Log
	 */
	static getInstance( log, level )
	{
		if ( log instanceof Log )
		{
			if ( typeof level === 'number' )
			{
				log.level	= level;
			}

			return log;
		}

		return new this( log, level );
	}

	/**
	 * @brief	Get the current time in UNIX format
	 *
	 * @return	Number
	 */
	static getUNIXTime()
	{
		return Date.now() / 1000;
	}
}

module.exports	= {
	Log,
	LOG_LEVELS
};
