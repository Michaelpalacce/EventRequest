'use strict';

const stringHelper	= require( '../../helpers/unique_id' );
const RequestEvent	= require( '../../../event' );

/**
 * @brief	Constants
 */
const TOKEN_NAMESPACE	= 'tokens';

/**
 * @brief	Token Manager responsible for working with the tokens
 */
class TokenManager
{
	/**
	 * @param	RequestEvent event
	 * @param	Object options
	 */
	constructor( event, options )
	{
		this.tokenExpiration	= typeof options.tokenExpiration === 'number' ? options.tokenExpiration : 0;
		this.cachingServer		= typeof event === 'object' && event instanceof RequestEvent ? event.cachingServer : false;

		if ( ! this.cachingServer )
		{
			throw new Error( 'Invalid Caching server provided. Token manager uses DataServer as cache' );
		}

		this.setUpNamespace();
	}

	/**
	 * @brief	Sets up the namespace
	 *
	 * @return	void
	 */
	setUpNamespace()
	{
		this.cachingServer.createNamespace( TOKEN_NAMESPACE, {}, ( err ) =>{
			if ( err )
			{
				throw new Error( 'Could not create Namespace' );
			}
		});
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
		let ttl			= this.tokenExpiration;
		let tokenData	= {
			authenticated	: true,
			sessionId		: sid,
			expires			: Date.now() + ttl
		};

		this.cachingServer.create( TOKEN_NAMESPACE, sid, tokenData, { ttl }, ( err ) => {
			if ( ! err )
			{
				event.setHeader( 'Set-Cookie', [ name + '=' + sid] );
				callback( false, tokenData );
			}
			else
			{
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
		this.cachingServer.read( TOKEN_NAMESPACE, sid, {}, ( err, sidData ) => {
			if ( ! err && sidData )
			{
				if ( sidData.expires > Date.now() )
				{
					callback( false, sidData )
				}
				else
				{
					callback( true );
				}
			}
			else
			{
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

		this.cachingServer.read( TOKEN_NAMESPACE, sid, {}, ( err, sidData ) => {
			if ( ! err && sidData )
			{
				let ttl			= this.tokenExpiration;
				token.expires	= Date.now() + ttl;

				this.cachingServer.update( TOKEN_NAMESPACE, sid, token, { ttl }, ( err ) => {
					if ( err )
					{
						callback( err );
					}
					else
					{
						callback( false, sidData );
					}
				});
			}
			else
			{
				callback( true );
			}
		});
	};
}

module.exports	= TokenManager;
