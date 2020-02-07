'use strict';

const { Server, Development }				= require( 'event_request' );
const { Logging }							= Development;
const { Loggur, Console, File, LOG_LEVELS }	= Logging;

let logger	= Loggur.createLogger({
	serverName	: 'Server',
	logLevel	: LOG_LEVELS.debug,
	capture		: false,
	transports	: [
		new Console( { logLevel : LOG_LEVELS.notice } ),
		new File({
			logLevel	: LOG_LEVELS.notice,
			filePath	: '/logs/access.log',
			logLevels	: { notice : LOG_LEVELS.notice }
		}),
		new File({
			logLevel	: LOG_LEVELS.error,
			filePath	: '/logs/error_log.log',
		}),
		new File({
			logLevel	: LOG_LEVELS.debug,
			filePath	: '/logs/debug_log.log'
		})
	]
});

Server().apply( 'er_logger', { logger } );
