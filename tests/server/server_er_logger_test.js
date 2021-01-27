const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../index' );
const { Loggur, File }			= require( './../../server/components/logger/loggur' );
const fs						= require( 'fs' );

test({
	message	: 'Server.test.er_logger',
	test	: ( done ) => {
		const name					= 'testErLogger';
		const relativeLogLocation	= './tests/server/fixture/logger/testLog.log';
		const fileTransport			= new File({
			logLevel	: Loggur.LOG_LEVELS.debug,
			filePath	: relativeLogLocation
		});

		const logger				= Loggur.createLogger({
			serverName	: 'Server.test_er_logger',
			logLevel	: Loggur.LOG_LEVELS.debug,
			capture		: false,
			transports	: [fileTransport]
		});

		const app		= new Server();

		assert.deepStrictEqual( app.Loggur, Loggur );

		app.apply( app.er_logger, { logger, attachToProcess: true } );

		app.get( `/${name}`, ( event ) => {
			if ( typeof process.log !== 'function' )
				event.sendError( 'Logger is not attached correctly', 500 );

			process.log( 'TESTLOG' );

			event.emit( 'redirect', { redirectUrl: 'REDIRECT-LINK' } );
			event.emit( 'stop' );
			event.emit( 'clearTimeout' );
			event.emit( 'on_error', new Error( 'error' ) );
			event.emit( 'error', new Error( 'normal error' ) );
			event.emit( 'error', { error: new Error( 'normal error' ), code: 'app.test' } );
			event.emit( 'error', 'NORMAL SIMPLE ERROR MESSAGE' );
			event.emit( 'on_error', 'SIMPLE ERROR MESSAGE' );

			event.setResponseHeader( 'key', 'value' );

			event.send( name );
		} );

		const server	= app.listen( 3336, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', { headerName: 'value' }, 3336 ).then(( response ) => {
				fileTransport.getWriteStream().end();
				setTimeout(() => {
					process.log			= undefined;

					assert.equal( fs.existsSync( fileTransport.getFileName() ), true );
					assert.equal( fs.statSync( fileTransport.getFileName() ).size > 0, true );
					assert.equal( response.body.toString(), name );

					const logData	= fs.readFileSync( fileTransport.getFileName() );

					assert.equal( logData.includes( `GET /${name} 200` ), true );
					assert.equal( logData.includes( 'Event finished' ), true );
					assert.equal( logData.includes( 'Server.test_er_logger/Master' ), true );
					assert.equal( logData.includes( 'Redirect to: REDIRECT-LINK' ), true );
					assert.equal( logData.includes( 'Headers: ' ), true );
					assert.equal( logData.includes( 'Cookies: ' ), true );
					assert.equal( logData.includes( 'SIMPLE ERROR MESSAGE' ), true );
					assert.equal( logData.includes( 'NORMAL SIMPLE ERROR MESSAGE' ), true );
					assert.equal( logData.includes( 'Error: error' ), true );
					assert.equal( logData.includes( 'Error: normal error' ), true );
					assert.equal( logData.includes( 'at EventRequest._next' ), true );

					if ( fs.existsSync( fileTransport.getFileName() ) )
						fs.unlinkSync( fileTransport.getFileName() );

					server.close();
					done();
				}, 250 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_logger.logs.errors.if.thrown',
	test	: ( done ) => {
		const name					= 'testErLoggerWithErrorThrown';
		const relativeLogLocation	= './tests/server/fixture/logger/testLog.log';
		const fileTransport			= new File({
			logLevel	: Loggur.LOG_LEVELS.debug,
			filePath	: relativeLogLocation
		});

		const logger				= Loggur.createLogger({
			serverName	: 'Server.test_er_logger',
			logLevel	: Loggur.LOG_LEVELS.debug,
			capture		: false,
			transports	: [fileTransport]
		});

		const app		= new Server();

		assert.deepStrictEqual( app.Loggur, Loggur );

		app.apply( app.er_logger, { logger, attachToProcess: true } );

		app.get( `/${name}`, ( event ) => {
			event.emit( 'on_error', { test: 123 } );
			event.emit( 'on_error', 'someError' );

			throw new Error( 'Some error occurred' );
		});

		const server	= app.listen( 3336, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 500, '', { headerName: 'value' }, 3336, '{"error":{"code":"app.general","message":"Some error occurred"}}' ).then(( response ) => {
				fileTransport.getWriteStream().end();
				setTimeout(() => {
					process.log			= undefined;

					assert.equal( fs.existsSync( fileTransport.getFileName() ), true );
					assert.equal( fs.statSync( fileTransport.getFileName() ).size > 0, true );

					const logData	= fs.readFileSync( fileTransport.getFileName() );

					if ( fs.existsSync( fileTransport.getFileName() ) )
						fs.unlinkSync( fileTransport.getFileName() );

					assert.equal( logData.includes( '"code":"app.general","status":500,"headers":{},"message":"Some error occurred","error":"Error: Some error occurred' ), true );
					assert.equal( logData.includes( 'GET /testErLoggerWithErrorThrown 500' ), true );
					assert.equal( logData.includes( '{"test":123}' ), true );
					assert.equal( logData.includes( 'someError' ), true );

					server.close();
					done();
				}, 250 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_logger.when.user.agent.is.set',
	test	: ( done ) => {
		const name					= 'testErLogger';
		const relativeLogLocation	= './tests/server/fixture/logger/testLog.log';
		const fileTransport			= new File({
			logLevel	: Loggur.LOG_LEVELS.debug,
			filePath	: relativeLogLocation
		});

		const logger				= Loggur.createLogger({
			serverName	: 'Server.test_er_logger',
			logLevel	: Loggur.LOG_LEVELS.debug,
			capture		: false,
			transports	: [fileTransport]
		});

		const app		= new Server();

		assert.deepStrictEqual( app.Loggur, Loggur );

		app.apply( app.er_logger, { logger, attachToProcess: true } );

		app.get( `/${name}`, ( event ) => {
			if (  typeof process.log !== 'function' )
				event.sendError( 'Logger is not attached correctly', 500 );

			process.log( 'TESTLOG' );

			event.emit( 'redirect', { redirectUrl: 'REDIRECT-LINK' } );
			event.emit( 'stop' );
			event.emit( 'clearTimeout' );
			event.emit( 'on_error', new Error( 'error' ) );
			event.emit( 'error', new Error( 'normal error' ) );
			event.emit( 'error', 'NORMAL SIMPLE ERROR MESSAGE' );
			event.emit( 'on_error', 'SIMPLE ERROR MESSAGE' );

			event.setResponseHeader( 'key', 'value' );

			event.send( name );
		} );

		const server	= app.listen( 4310, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', { headerName: 'value', 'user-agent': 'someUserAgent' }, 4310 ).then(( response ) => {
				fileTransport.getWriteStream().end();
				setTimeout(() => {
					process.log			= undefined;

					assert.equal( fs.existsSync( fileTransport.getFileName() ), true );
					assert.equal( fs.statSync( fileTransport.getFileName() ).size > 0, true );
					assert.equal( response.body.toString(), name );

					const logData	= fs.readFileSync( fileTransport.getFileName() );

					assert.equal( logData.includes( `GET /${name} 200` ), true );
					assert.equal( logData.includes( 'someUserAgent' ), true );
					assert.equal( logData.includes( 'Event finished' ), true );
					assert.equal( logData.includes( 'Server.test_er_logger/Master' ), true );
					assert.equal( logData.includes( 'Redirect to: REDIRECT-LINK' ), true );
					assert.equal( logData.includes( 'Headers: ' ), true );
					assert.equal( logData.includes( 'Cookies: ' ), true );
					assert.equal( logData.includes( 'SIMPLE ERROR MESSAGE' ), true );
					assert.equal( logData.includes( 'NORMAL SIMPLE ERROR MESSAGE' ), true );
					assert.equal( logData.includes( 'Error: error' ), true );
					assert.equal( logData.includes( 'Error: normal error' ), true );
					assert.equal( logData.includes( 'at EventRequest._next' ), true );

					if ( fs.existsSync( fileTransport.getFileName() ) )
						fs.unlinkSync( fileTransport.getFileName() );

					server.close();
					done();
				}, 250 );
			}).catch( done );
		} );
	}
});