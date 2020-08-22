'use strict';

const PluginInterface		= require( '../plugin_interface' );
const Logging				= require( './../../components/logger/loggur' );
const { Logger, Loggur }	= Logging;

/**
 * @brief	Logger plugin used to attach logs at different levels in the app
 */
class LoggerPlugin extends PluginInterface
{
	constructor( pluginId, options = { attachToProcess: true } )
	{
		super( pluginId, options );

		this.logger	= null;
	}

	/**
	 * @brief	Attaches a process.log function for easier use
	 *
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		if ( this.options.attachToProcess === true )
			process.log	= Loggur.log.bind( Loggur );
	}

	/**
	 * @brief	Gets the logger set by the options
	 *
	 * @details	This MUST be called AFTER the setOptions because once created this will not respect the options
	 *
	 * @return	Logger
	 */
	getLogger()
	{
		if ( this.logger === null || this.logger === undefined )
		{
			this.logger	= this.options.logger instanceof Logger
						? this.options.logger
						: Loggur.getDefaultLogger();
		}

		return this.logger;
	}

	/**
	 * @brief	Attaches events to the event request
	 *
	 * @details	Events attached: error, finished, send, redirect, stop, cleanUp, clearTimeout
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	void
	 */
	attachEventsToEventRequest( event )
	{
		const logger		= this.getLogger();
		const requestURL	= event.request.url;

		const errCallback	= ( error ) => {
			let message;

			if ( error.error instanceof Error )
			{
				message			= Object.assign( {}, error );
				message.error	= message.error.stack;
			}
			else if ( error instanceof Error )
				message	= error.stack;
			else if ( typeof error === 'object' )
				message	= Object.assign( {}, error );
			else
				message	= error;

			logger.error( message, true );
		};

		event.on( 'error', errCallback );
		event.on( 'on_error', errCallback );

		event.on( 'finished', () => {
			logger.verbose( 'Event finished' );
		});

		event.on( 'redirect', ( redirect ) => {
			logger.info( `Redirect to: ${redirect.redirectUrl} with status code: ${redirect.statusCode}` );
		});

		event.on( 'cachedResponse', () => {
			logger.info( `Response to ${requestURL} send from cache` );
		});
	}

	/**
	 * @brief	Gets the plugin middleware, responsible for attaching logging functionality to the event request and adding a logger
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		const logger			= this.getLogger();

		const pluginMiddleware	= {
			handler	: ( event ) => {

				event.on( 'cleanUp', () => {
					const userAgent	= typeof event.headers['user-agent'] === 'undefined' ? 'UNKNOWN' : event.headers['user-agent'];
					logger.notice( `${event.method} ${event.request.url} ${event.response.statusCode} ||| ${event.clientIp} ||| ${userAgent}` );
				});

				logger.verbose( 'Headers: ' + JSON.stringify( event.headers ) );
				logger.verbose( 'Cookies: ' + JSON.stringify( event.cookies ) );

				this.attachEventsToEventRequest( event );

				event.logger	= logger;

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= LoggerPlugin;