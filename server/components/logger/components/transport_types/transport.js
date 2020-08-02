'use strict';

// Dependencies
const { Log, LOG_LEVELS }	= require( './../log' );
const plainFormatter		= require( './formatters/plain_formatter' );
const jsonFormatter			= require( './formatters/json_formatter' );

const timeProcessor			= require( './processors/timestamp_processor' );
const colorProcessor		= require( './processors/color_processor' );
const stackProcessor		= require( './processors/stack_processor' );

/**
 * @brief	Constants
 */
const TRANSPORT_DEFAULT_LOG_LEVEL	= LOG_LEVELS.info;

/**
 * @brief	Transport class used by the other Transport types
 */
class Transport
{
	constructor( options = {} )
	{
		this.sanitizeConfig( options );
	}

	/**
	 * @brief	Sanitize the given options
	 *
	 * @param	{Object} options
	 *
	 * @return	void
	 */
	sanitizeConfig( options )
	{
		this.logLevel			= typeof options.logLevel === 'number'
								? options.logLevel
								: TRANSPORT_DEFAULT_LOG_LEVEL;

		this.logLevels			= typeof options.logLevels === 'object'
								? options.logLevels
								: LOG_LEVELS;

		this.processors			= [Transport.processors.time(), Transport.processors.stack()];
		this.formatter			= Transport.formatters.plain();

		this.supportedLevels	= Object.values( this.logLevels );
	}

	/**
	 * @brief	Get an instance of the current transport
	 *
	 * @param	{Object} [options={}]
	 *
	 * @return	Transport
	 */
	static getInstance( options = {} )
	{
		return new this( options );
	}

	/**
	 * @brief	Returns whether the current log is supported by the transport
	 *
	 * @param	{Log} log
	 *
	 * @return	Boolean
	 */
	supports( log )
	{
		if ( ! ( log instanceof Log ) )
			return false;

		if ( this.supportedLevels.indexOf( log.getLevel() ) === -1 )
			return false;

		return this.logLevel >= log.getLevel();
	}

	/**
	 * @brief	The method that actually logs the data
	 *
	 * @param	{Array} data
	 * @param	{Function} resolve
	 * @param	{Function} reject
	 *
	 * @private
	 *
	 * @return	void
	 */
	_log( data, resolve, reject )
	{
		resolve();
	}

	/**
	 * @brief	Creates an object to be used in the processors
	 *
	 * @param	{Log} log
	 *
	 * @private
	 *
	 * @return	Object
	 */
	_createProcessorsObject( log )
	{
		return {
			timestamp	: log.getTimestamp(),
			isRaw		: log.getIsRaw(),
			message		: log.getMessage(),
			level		: log.getLevel(),
			uniqueId	: log.getUniqueId(),
			rawMessage	: log.getRawMessage(),
			extra		: {}
		}
	}

	/**
	 * @brief	Saves the log
	 *
	 * @param	{Log} log
	 *
	 * @return	Promise
	 */
	log( log )
	{
		return new Promise(( resolve, reject ) => {
			if ( ! this.supports( log ) )
				return resolve();

			const context	= this._createProcessorsObject( log );

			for ( const processor of this.processors )
				processor( context )

			this._log( this.formatter( context ), resolve, reject );
		});
	}
}

Transport.processors	= {
	time	: timeProcessor,
	color	: colorProcessor,
	stack	: stackProcessor
};

Transport.formatters	= {
	plain	: plainFormatter,
	json	: jsonFormatter
};

module.exports	= Transport;
