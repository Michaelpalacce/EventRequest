'use strict';

const path	= require( 'path' );

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
const PROJECT_ROOT		= path.parse( require.main.filename ).dir + '\\';

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

		if ( this.level	=== LOG_LEVELS.debug )
		{
			this.message	+= Log.getStackTrace();
		}
	}

	/**
	 * @brief	Gets the stack trace to be used in debugging
	 *
	 * @details	This sanitizes the stack trace a bit
	 *
	 * @return	String
	 */
	static getStackTrace()
	{
		let stack			= '';
		let index			= 0;
		let stackParts		= new Error().stack.replace( /at|Error/g, '' ).split( '\n' );
		let removing		= true;

		let forwardSlashes	= '\\'.repeat( 50 );
		let NEW_LINE		= '\n';

		stack				+= NEW_LINE;
		stack				+= forwardSlashes;
		stack				+= 'STACK TRACE';
		stack				+= forwardSlashes;
		stack				+= NEW_LINE;

		// Remove the first empty log
		stackParts.shift();

		stackParts.forEach(( stackPart )=>{
			if ( removing === true && stackPart.indexOf( __filename ) !== -1 )
			{
				return;
			}
			// Stop searching
			removing	= false;

			stackPart	= ++ index + '.' + stackPart;
			stackPart	= stackPart.replace( PROJECT_ROOT, '' );
			stackPart	= stackPart.trim();
			stackPart	+= '\n';

			stack		+=  stackPart;
		});

		return stack;
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

		this.rawMessage	= logType === 'undefined' ? '' : message;
		this.isRaw		= isRaw;

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
			{
				log.level	= level;
			}

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
