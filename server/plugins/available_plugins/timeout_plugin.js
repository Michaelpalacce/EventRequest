'use strict';

const PluginInterface	= require( '../plugin_interface' );

/**
 * @brief	Timeout plugin that adds a timeout to the event request
 */
class TimeoutPlugin extends PluginInterface {
	constructor( id, options = {} ) {
		super( id, options );

		this.timeout	= null;
		this.callback	= null;

		this.setOptions( options );
	}

	/**
	 * @inheritDoc
	 *
	 * @param	{Object} options
	 * @param	{Number} options.timeout	- Time in milliseconds after which the request should be finished
	 * @param	{Function} options.callback	- callback when a timeout happens
	 */
	setOptions( options ) {
		super.setOptions( options );

		this.timeout	= typeof this.options.timeout === 'number'
						? parseInt( this.options.timeout )
						: 60 * 1000;

		this.callback	= typeof this.options.callback === 'function'
						? this.options.callback :
						( event ) => {
							event.sendError( { code: 'app.er.timeout.timedOut', status: 408 } );
						};
	}

	/**
	 * @brief	Set a timeout to the eventRequest
	 *
	 * @param	{EventRequest} event
	 * @param	{Number} timeout
	 */
	setTimeout( event, timeout ) {
		event.response.setTimeout( timeout, () => {
			if ( ! event.isFinished() )
				this.callback( event );
		});
	}

	/**
	 * @brief	Gets the plugin middleware
	 *
	 * @details	Sets a new clearTimeout function of the event, listens for cleanUp event from the eventRequest and clears the
	 * 			internal timeout
	 *
	 * @return	{Array}
	 */
	getPluginMiddleware() {
		const pluginMiddleware	= {
			handler	: ( event ) => {
				this.setTimeout( event, this.timeout );

				event.clearTimeout	= () => {
					event.emit( 'clearTimeout' );
					event.response.setTimeout( 0 );
				};

				event.setTimeout	= ( timeout ) => {
					this.setTimeout( event, timeout );
				};

				event.on( 'cleanUp', () => {
					event.clearTimeout	= null;
					event.setTimeout	= null;
				});

				event.next();
			}
		};

		return [pluginMiddleware];
	}
}

module.exports	= TimeoutPlugin;
