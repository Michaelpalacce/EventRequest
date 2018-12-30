'use strict';

const PluginInterface	= require( './../components/plugin_interface' );

/**
 * @brief	Timeout plugin that adds a timeout to the event request
 */
class TimeoutPlugin extends PluginInterface
{
	getPluginMiddleware()
	{
		let timeout	= typeof this.options.timeout === 'number' ? parseInt( this.options.timeout ) : 60 * 1000;

		return {
			handler	: ( event ) => {
				event.internalTimeout	= setTimeout( () => {
						if ( ! event.isFinished() )
						{
							event.next( `Request timed out in: ${timeout}` );
						}
					},
					timeout
				);

				event.next();
			}
		};
	}
}

module.exports	= TimeoutPlugin;