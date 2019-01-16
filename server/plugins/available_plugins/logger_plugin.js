'use strict';

const PluginInterface		= require( '../plugin_interface' );
const Logging				= require( './../../components/logger/loggur' );
const { Logger, Loggur }	= Logging;

/**
 * @brief	Logger plugin used to attach logs at different levels in the app
 */
class LoggerPlugin extends PluginInterface
{
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );

		this.logger	= null;
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
	 * @details	Events attached: error, finished, send, redirect, stop, setHeader, cleanUp, clearTimeout
	 *
	 * @param	EventRequest event
	 *
	 * @return	void
	 */
	attachEventsToEventRequest( event )
	{
		let logger		= this.getLogger();
		let requestURL	= event.request.url;

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

		event.on( 'send', ( response ) =>{
			logger.info( `Responded with: ${response.code} to ${requestURL}` )
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

		event.on( 'setHeader', ( header ) =>{
			logger.verbose( `Header set: ${header.key} with value: ${header.value}` )
		});

		event.on( 'cleanUp', () =>{
			logger.verbose( 'Event is cleaning up' )
		});

		event.on( 'clearTimeout', () =>{
			logger.debug( 'Timeout cleared' )
		});
	}

	/**
	 * @brief	Gets the plugin middleware, responsible for attaching logging functionality to the event request and adding a logger
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		let logger	= this.getLogger();

		let pluginMiddleware	= {
			handler	: ( event ) =>{
				let requestURL	= event.request.url;
				logger.notice( event.method + ': ' + requestURL );
				logger.verbose( event.headers );
				logger.verbose( event.cookies );

				this.attachEventsToEventRequest( event );

				event.logger	= logger;

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= LoggerPlugin;