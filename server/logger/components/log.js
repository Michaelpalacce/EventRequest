'use strict';

/**
 * @brief	Constants
 */
const LOG_LEVELS	= {
	ERROR	: 100,
	WARNING	: 200,
	NOTICE	: 300,
	INFO	: 400,
	DEBUG	: 500
};
const DEFAULT_LOG_LEVEL			= LOG_LEVELS.INFO;
const WRONG_LOG_DEFAULT_LEVEL	= LOG_LEVELS.DEBUG;
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
			this.level		= typeof log.level === 'number' ? log.level : WRONG_LOG_DEFAULT_LEVEL;
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
	getLogMessage()
	{
		return this.message;
	}

	/**
	 * @brief	Gets the log timestamp of the provided log in UNIX time
	 *
	 * @return	Number
	 */
	getLogTimestamp()
	{
		return this.timestamp;
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
	Log			: Log,
	LOG_LEVELS	: LOG_LEVELS
};
