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
const WRONG_LOG_DEFAULT_LEVEL	= LOG_LEVELS.debug;
const WRONG_LOG_DEFAULT_MESSAGE	= 'Invalid log message provided, could not be parsed';

/**
 * @brief	Log object used to transport information inside the loggur
 */
class Log
{
	/**
	 * @param	mixed log
	 */
	constructor( log )
	{
		this.level		= 0;
		this.message	= '';
		this.timestamp	= 0;
		this.uniqueId	= '';

		this.processLog( log );
	}

	/**
	 * @brief	Processes the given log
	 *
	 * @param	mixed log
	 *
	 * @return	void
	 */
	processLog( log )
	{
		let logType	= typeof log;

		if ( logType === 'string' )
		{
			this.level		= DEFAULT_LOG_LEVEL;
			this.message	= log;
		}
		else if ( logType === 'object' )
		{
			this.level	= typeof log.level === 'number' ? log.level : WRONG_LOG_DEFAULT_LEVEL;

			if ( log.message instanceof Error )
			{
				log.message	= log.message.stack;
			}
			if ( typeof log.message === 'object' )
			{
				log.message	= JSON.stringify( log.message );
			}

			this.message	= typeof log.message === 'string' ? log.message : WRONG_LOG_DEFAULT_MESSAGE;
		}
		else
		{
			this.level		= WRONG_LOG_DEFAULT_LEVEL;
			this.message	= WRONG_LOG_DEFAULT_MESSAGE;
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
	 *
	 * @return	Log
	 */
	static getInstance( log = {} )
	{
		if ( log instanceof Log )
		{
			return log;
		}

		return new this( log );
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
