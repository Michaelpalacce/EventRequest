'use strict';

// Dependencies
const { assert, test, helpers, Mock }			= require( '../../../test_helper' );
const { Loggur, LOG_LEVELS, Console, Logger }	= require( '../../../../server/components/logger/loggur' );
const LoggerPlugin								= require( '../../../../server/plugins/available_plugins/logger_plugin' );
const Router									= require( '../../../../server/components/routing/router' );

test({
	message	: 'LoggerPlugin attaches correctly',
	skipped	: true,
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
				['send', undefined],
				['error', undefined],
				['on_error', undefined],
				['finished', undefined],
				['redirect', undefined],
				['cachedResponse', undefined],
				['stop', undefined],
				['setHeader', undefined],
				['cleanUp', undefined],
				['clearTimeout', undefined],
			],
			called			: 10
		});

		router.add( middleware[0] );
		router.add( helpers.getEmptyMiddleware() );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		eventRequest.next();

		// DO this to wait for the log to complete
		setImmediate(()=>{
			assert.equal( called, 10 );
			assert.equal( true, eventRequest.logger instanceof Logger );

			done();
		});
	}
});

test({
	message	: 'LoggerPlugin setServerOnRuntime attaches process',
	test	: ( done )=>{
		let MockServer		= Mock( helpers.getServer().constructor );
		let server			= new MockServer();
		let noAttachPlugin	= new LoggerPlugin( 'id', {} );
		let attachPlugin	= new LoggerPlugin( 'id' );

		noAttachPlugin.setServerOnRuntime( server );

		assert.equal( 'undefined', typeof process.dumpStack );
		assert.equal( 'undefined', typeof process.log );

		attachPlugin.setServerOnRuntime( server );

		assert.equal( 'function', typeof process.dumpStack );
		assert.equal( 'function', typeof process.log );

		done();
	}
});