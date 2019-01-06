'use strict';

// Dependencies
const { assert, test, helpers, Mock }			= require( '../../../test_helper' );
const { Loggur, LOG_LEVELS, Console, Logger }	= require( '../../../../server/components/logger/loggur' );
const LoggerPlugin								= require( '../../../../server/plugins/available_plugins/logger_plugin' );
const Router									= require( '../../../../server/components/routing/router' );

test({
	message	: 'LoggerPlugin attaches correctly',
	test	: ( done )=>{
		let eventRequest	= helpers.getEventRequest();
		let router			= new Router();
		let called			= 0;
		let calledLog		= 0;
		let MockConsole		= Mock( Console );
		let transport		= new MockConsole( { logLevel : LOG_LEVELS.verbose } );
		let logger			= Loggur.createLogger({
			serverName	: 'Test',
			capture		: false,
			transports	: [
				transport
			]
		});
		let loggerPlugin	= new LoggerPlugin( 'id', { logger } );
		let middleware		= loggerPlugin.getPluginMiddleware();

		assert.equal( 1, middleware.length );

		transport._mock({
			method			: '_log',
			shouldReturn	: ( log, resolve, reject )=>{
				calledLog++;

				resolve();
			},
			called			: 3
		});

		eventRequest._mock({
			method			: 'on',
			shouldReturn	: ()=>{
				called	++;
			},
			with			: [
				['error', undefined],
				['finished', undefined],
				['send', undefined],
				['redirect', undefined],
				['cachedResponse', undefined],
				['stop', undefined],
				['setHeader', undefined],
				['cleanUp', undefined],
				['clearTimeout', undefined],
			],
			called			: 9
		});

		router.add( middleware[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		// DO this to wait for the log to complete
		setImmediate(()=>{
			assert.equal( 9, called );
			assert.equal( 1, calledLog );
			assert.equal( true, eventRequest.logger instanceof Logger );

			done();
		});
	}
});
