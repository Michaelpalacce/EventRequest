'use strict';

// Dependencies
const { Mock, assert, test }	= require( './../../../../testing_suite' );
const { Logger }				= require( './../../../../../server/components/logger/loggur' );

/**
 * @brief	Constants
 */
const LOGGER_DEFAULT_LOG_LEVEL	= LOG_LEVELS.info;

test({
	message	: 'Logger.constructor on default',
	test	: ( done )=>{
		new Logger();

		done();
	}
});
