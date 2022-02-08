'use strict';

const PluginInterface	= require( '../plugin_interface' );
const Logging			= require( './../../components/logger/loggur' );
const { Loggur }		= Logging;

/**
 * @brief	Logger plugin used to attach logs at different levels in the app
 */
class LoggerPlugin extends PluginInterface {
	constructor( pluginId, options = { attachToProcess: true } ) {
		super( pluginId, options );

		this.logger	= null;
	}

	/**
	 * @brief	Attaches a process.log function for easier use
	 *
	 * @param	{Server} server
	 */
	setServerOnRuntime( server ) {
		if ( this.options.attachToProcess === true )
			process.log	= Loggur.log.bind( Loggur );
	}

	/**
	 * @brief	Gets the logger set by the options
	 *
	 * @details	This MUST be called AFTER the setOptions because once created this will not respect the options
	 *
	 * @return	{Logger}
	 */
	getLogger() {
		if ( this.logger === null || this.logger === undefined )
			this.logger	= this.options.logger
							? this.options.logger
							: Loggur.getDefaultLogger();

		return this.logger;
	}

	/**
	 * @brief	Attaches events to the event request
	 *
	 * @details	Events attached: error, on_error, finished, redirect, cleanUp
	 *
	 * @param	{EventRequest} event
	 */
	attachEventsToEventRequest( event ) {
		const logger		= this.getLogger();

		const errCallback	= ( error ) => {
			let message;

			if ( error.error instanceof Error ) {
				message			= Object.assign( {}, error );
				message.error	= message.error.stack;
			}
			else if ( error instanceof Error )
				message	= error.stack;
			else if ( typeof error === 'object' )
				message	= Object.assign( {}, error );
			else
				message	= error;

			logger.log( message, 100, true );
		};

		event.on( 'error', errCallback );
		event.on( 'on_error', errCallback );

		event.on( 'finished', () => {
			logger.log( 'Event finished', 500 );
		});

		event.on( 'redirect', ( redirect ) => {
			logger.log( `Redirect to: ${redirect.redirectUrl} with status code: ${redirect.statusCode}`, 400 );
		});
	}

	/**
	 * @brief	Gets the plugin middleware, responsible for attaching logging functionality to the event request and adding a logger
	 *
	 * @return	{Array}
	 */
	getPluginMiddleware() {
		const logger			= this.getLogger();

		const pluginMiddleware	= {
			handler	: ( event ) => {
				event.on( 'cleanUp', () => {
					const userAgent	= typeof event.headers['user-agent'] === 'undefined' ? 'UNKNOWN' : event.headers['user-agent'];
					logger.log( `${event.method} ${event.request.url} ${event.response.statusCode} ||| ${event.clientIp} ||| ${userAgent}`, 300 );
				});

				logger.log( 'Headers: ' + JSON.stringify( event.headers ), 500 );
				logger.log( 'Cookies: ' + JSON.stringify( event.cookies ), 500 );

				this.attachEventsToEventRequest( event );

				event.logger	= logger;

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= LoggerPlugin;
