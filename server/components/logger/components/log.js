'use strict';

/**
 * @brief	Constants
 */
const LOG_LEVELS		= {
	error	: 100,
	warning	: 200,
	notice	: 300,
	info	: 400,
	verbose	: 500,
	debug	: 600
};
const DEFAULT_LOG_LEVEL	= LOG_LEVELS.notice;

/**
 * @brief	Log object used to transport information inside the loggur
 */
class Log
{
	/**
	 * @param	{*} log
	 * @param	{Number} level
	 * @param	{Boolean} isRaw
	 */
	constructor( log, level, isRaw )
	{
		this.level		= 0;
		this.message	= '';
		this.rawMessage	= '';
		this.timestamp	= 0;
		this.uniqueId	= '';
		this.isRaw		= false;

		this.processLog( log, level, isRaw );
	}

	/**
	 * @brief	Processes the given log
	 *
	 * @param	{*} [message='']
	 * @param	{Number} [level=LOG_LEVELS.error]
	 * @param	{Boolean} [isRaw=false]
	 *
	 * @return	void
	 */
	processLog( message = '', level = LOG_LEVELS.error, isRaw = false )
	{
		let logType		= typeof message;

		this.level		= typeof level === 'number' ? level : DEFAULT_LOG_LEVEL;
		this.rawMessage	= message;
		this.isRaw		= isRaw;
		this.timestamp	= Log.getUNIXTime();

		switch ( true )
		{
			case message instanceof Error:
				this.message	= message.message;
				break;

			case logType === 'string':
				this.message	= message;
				break;

			case message === null:
				this.message	= '';
				break;

			default:
				this.message	= JSON.stringify( message );
				break;
		}
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
	 * @brief	Gets the raw log message of the provided log
	 *
	 * @return	mixed
	 */
	getRawMessage()
	{
		return this.rawMessage;
	}

	/**
	 * @brief	Gets whether this log is attempting to be logged raw
	 *
	 * @return	Boolean
	 */
	getIsRaw()
	{
		return this.isRaw;
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
	 * @param	{String} uniqueId
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
	 * @param	{*} log
	 * @param	{Number} level
	 * @param	{Boolean} isRaw
	 *
	 * @return	Log
	 */
	static getInstance( log, level, isRaw )
	{
		if ( log instanceof Log )
		{
			if ( typeof level === 'number' )
				log.level	= level;

			return log;
		}

		return new this( log, level, isRaw );
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
