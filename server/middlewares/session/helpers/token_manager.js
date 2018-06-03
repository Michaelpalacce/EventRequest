'use strict';

const data			= require( './filesystem_data_store' );
const stringHelper	= require( './string_helper' );

/**
 * @brief	Token Manager responsible for working with the tokens
 */
class TokenManager
{
	/**
	 * @brief	Accepted options:
	 * 			- tokenExpiration - Number - The amount of time before expiring the token Defaults to 0
	 *
	 * @param	Object options
	 */
	constructor( options )
	{
		this.tokenExpiration	= options.tokenExpiration || 0;
	}

	/**
	 * @brief	Creates a cookie and a token
	 *
	 * @param	RequestEvent event
	 * @param	String name
	 * @param	Function callback
	 *
	 * @return	void
	 */
	createCookie( event, name, callback )
	{
		let sid			= stringHelper.makeId();
		let tokenData	= {
			id		: sid,
			expires	: Date.now() + this.tokenExpiration
		};

		data.create( 'tokens', sid, tokenData, ( err ) => {
			if ( ! err )
			{
				event.setHeader( 'Set-Cookie', [ name + '=' + sid] );
				callback( false );
			}
			else {
				callback( err );
			}
		});
	}


	/**
	 * @brief	Check if token is expired
	 *
	 * @param	String sid
	 * @param	Function callback
	 *
	 * @return	void
	 */
	isExpired( sid, callback )
	{
		data.read( 'tokens', sid, ( err, sidData ) => {
			if ( ! err && sidData )
			{
				if ( sidData.expires > Date.now() )
				{
					callback( false )
				}
				else {
					callback( true );
				}
			}
			else {
				callback( true );
			}
		});
	};

	/**
	 * @brief	Updates the token expiration tim
	 *
	 * @param	String sid
	 * @param	Function callback
	 *
	 * @return	void
	 */
	updateToken( sid, callback )
	{
		data.read( 'tokens', sid, ( err, sidData ) => {
			if ( ! err && sidData )
			{
				sidData.expires	= Date.now() + this.tokenExpiration;
				data.update( 'tokens', sid, sidData, ( err ) => {
					if ( err )
					{
						callback( err );
					}
					else {
						callback( false );
					}
				});
			}
			else {
				callback( true );
			}
		});
	};
}

module.exports	= TokenManager;
