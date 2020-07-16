'use strict';

const PluginInterface			= require( '../plugin_interface' );
const Logging					= require( './../../components/logger/loggur' );
const { Logger, Loggur, Log }	= Logging;

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
	 * @brief	Attaches a process.dumpStack and process.log function for easier use
	 *
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		if ( this.options.attachToProcess === true )
		{
			process.dumpStack	= ()=>{
				return Loggur.log( Log.getStackTrace() );
			};

			process.log			= Loggur.log;
		}
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
		if ( this.logger == null )
		{
			this.logger	= this.options.logger instanceof Logger
						? this.options.logger
						: Loggur.getDefaultLogger()
		}

		return this.logger;
	}

	/**
	 * @brief	Attaches events to the event request
	 *
	 * @details	Events attached: error, finished, send, redirect, stop, setResponseHeader, cleanUp, clearTimeout
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	void
	 */
	attachEventsToEventRequest( event )
	{
		const logger		= this.getLogger();
		const requestURL	= event.request.url;

		event.on( 'error', ( error ) =>{
			if ( error instanceof Error )
			{
				error	= error.stack;
			}

			logger.error( `Error : ${error}` );
		});

		event.on( 'on_error', ( error ) =>{
			if ( error instanceof Error )
			{
				error	= error.stack;
			}

			logger.error( `Error : ${error}` );
		});

		event.on( 'finished', () =>{
			logger.info( 'Event finished' )
		});

		event.on( 'redirect', ( redirect ) =>{
			logger.info( `Redirect to: ${redirect.redirectUrl} with status code: ${redirect.statusCode}` )
		});

		event.on( 'cachedResponse', () =>{
			logger.info( `Response to ${requestURL} send from cache` )
		});

		event.on( 'stop', () =>{
			logger.verbose( 'Event stopped' )
		});

		event.on( 'setResponseHeader', ( header ) =>{
			logger.verbose( `Header set: ${header.key} with value: ${header.value}` )
		});

		event.on( 'cleanUp', () =>{
			logger.verbose( 'Event is cleaning up' )
		});

		event.on( 'clearTimeout', () =>{
			logger.verbose( 'Timeout cleared' )
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
			handler	: ( event ) =>{
				const requestURL	= event.request.url;

				event.on( 'cleanUp', () =>{
					const userAgent	= typeof event.headers['user-agent'] === 'undefined' ? 'UNKNOWN' : event.headers['user-agent'];
					logger.notice( `${event.method} ${requestURL} ${event.response.statusCode} ||| ${event.clientIp} ||| ${userAgent}` );
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