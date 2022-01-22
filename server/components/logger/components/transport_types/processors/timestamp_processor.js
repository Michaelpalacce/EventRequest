/**
 * @brief	Gets the timestamp from the Log
 *
 * @property	{Number} timestamp
 *
 * @return	{String}
 */
function getTimestamp( timestamp )
{
	return Intl.DateTimeFormat( 'en-GB',
		{
			hour12	: false,
			year	: '2-digit',
			month	: '2-digit',
			day		: '2-digit',
			hour	: '2-digit',
			minute	: '2-digit',
			second	: '2-digit'
		}
	).format( new Date( timestamp * 1000 ) );
}

/**
 * @return	Function
 */
module.exports	= () => {
	/**
	 * @brief	Formats the timestamp in a more pleasing format
	 *
	 * @return	void
	 */
	return ( context = {} ) => {
		if ( typeof context.timestamp === 'number' )
			context.timestamp	= getTimestamp( context.timestamp );
	};
};
