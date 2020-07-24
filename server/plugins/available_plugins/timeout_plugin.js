'use strict';

const PluginInterface	= require( '../plugin_interface' );

/**
 * @brief	Timeout plugin that adds a timeout to the event request
 */
class TimeoutPlugin extends PluginInterface
{
	constructor( id, options = {} )
	{
		super( id, options );

		this.timeout	= null;
		this.callback	= null;

		this.setOptions( options );
	}

	/**
	 * @inheritDoc
	 */
	setOptions( options )
	{
		super.setOptions( options );

		this.timeout	= typeof this.options.timeout === 'number'
						? parseInt( this.options.timeout )
						: 60 * 1000;

		this.callback	= typeof this.options.callback === 'function'
						? this.options.callback :
						( event ) => {
							event.next( `Request timed out in: ${this.timeout/1000} seconds`, 503 );
						};
	}

	/**
	 * @brief	Set a timeout to the eventRequest
	 *
	 * @param	{EventRequest} event
	 * @param	{Number} timeout
	 *
	 * @return	void
	 */
	setTimeout( event, timeout )
	{
		event.internalTimeout	= setTimeout( () => {
				if ( ! event.isFinished() )
					this.callback( event );
			},
			timeout
		);
	}

	/**
	 * @brief	Adds a new function to the event: clearTimeout
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	void
	 */
	addEventFunctionality( event )
	{
		event.clearTimeout	= () =>
		{
			if ( event.internalTimeout !== null && event.internalTimeout !== undefined )
			{
				clearTimeout( event.internalTimeout );
				event.emit( 'clearTimeout' );
			}

			event.internalTimeout	= undefined;
		}
	}

	/**
	 * @brief	Clean up the internal timeout on cleanUp event
	 *
	 * @param	{EventRequest} event
	 *
	 * @return	void
	 */
	setEvents( event )
	{
		event.on( 'cleanUp', () =>
		{
			event.clearTimeout();
		});

		event.on( 'stream_start', () => {
			event.clearTimeout();
		});

		event.on( 'stream_end', () => {
			this.setTimeout( event, this.timeout );
		});
	}

	/**
	 * @brief	Gets the plugin middleware
	 *
	 * @details	Sets a new clearTimeout function of the event, listens for cleanUp event from the eventRequest and clears the
	 * 			internal timeout
	 *
	 * @return	Array
	 */
	getPluginMiddleware()
	{
		const pluginMiddleware	= {
			handler	: ( event ) => {
				this.setTimeout( event, this.timeout );
				this.addEventFunctionality( event );
				this.setEvents( event );

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= TimeoutPlugin;