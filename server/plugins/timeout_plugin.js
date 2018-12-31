'use strict';

const PluginInterface	= require( './plugin_interface' );

/**
 * @brief	Timeout plugin that adds a timeout to the event request
 */
class TimeoutPlugin extends PluginInterface
{
	constructor( id, options = {} )
	{
		super( id, options );
		this.timeout	= null;
	}

	/**
	 * @brief	Gets the timeout
	 *
	 * @return	Number
	 */
	getTimeout()
	{
		if ( this.timeout === null )
		{
			this.timeout	= typeof this.options.timeout === 'number' ? parseInt( this.options.timeout ) : 60 * 1000;
		}

		return this.timeout;
	}

	/**
	 * @brief	Set a timeout to the eventRequest
	 *
	 * @param	EventRequest event
	 *
	 * @return	void
	 */
	setTimeout( event, timeout )
	{
		event.internalTimeout	= setTimeout( () => {
				if ( ! event.isFinished() )
				{
					event.next( `Request timed out in: ${timeout}` );
				}
			},
			timeout
		);
	}

	/**
	 * @brief	Adds a new function to the event: clearTimeout
	 *
	 * @param	EventRequest event
	 *
	 * @return	void
	 */
	addEventFunctionality( event )
	{
		event.clearTimeout	= () =>
		{
			event.emit( 'clearTimeout' );

			if ( event.internalTimeout !== null && event.internalTimeout !== undefined )
			{
				clearTimeout( event.internalTimeout );
			}

			event.internalTimeout	= undefined;
		}
	}

	/**
	 * @brief	Clean up the internal timeout on cleanUp event
	 *
	 * @param	EventRequest event
	 *
	 * @return	void
	 */
	setEvents( event )
	{
		event.on( 'cleanUp', ()=>
		{
			event.clearTimeout();
		} );

		event.on( 'stream_start', ()=>{
			event.clearTimeout();
		} );

		event.on( 'stream_end', ()=>{
			this.setTimeout( event, this.getTimeout() );
		} );
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
		let pluginMiddleware	= {
			handler	: ( event ) => {
				this.setTimeout( event, this.getTimeout() );
				this.addEventFunctionality( event );
				this.setEvents( event );

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= TimeoutPlugin;