'use strict';

const data			= require( '../../../caching/data_stores/filesystem_data_store' );
const stringHelper	= require( './../../../unique_id' );

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
			authenticated	: true,
			sessionId		: sid,
			expires			: Date.now() + this.tokenExpiration
		};

		data.create( 'tokens', sid, tokenData, ( err ) => {
			if ( ! err )
			{
				event.setHeader( 'Set-Cookie', [ name + '=' + sid] );
				callback( false, tokenData );
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
					callback( false, sidData )
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
	 * @param	Object token
	 * @param	Function callback
	 *
	 * @return	void
	 */
	updateToken( token, callback )
	{
		let sid	= token.sessionId;

		data.read( 'tokens', sid, ( err, sidData ) => {
			if ( ! err && sidData )
			{
				token.expires	= Date.now() + this.tokenExpiration;
				data.update( 'tokens', sid, token, ( err ) => {
					if ( err )
					{
						callback( err );
					}
					else {
						callback( false, sidData );
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
