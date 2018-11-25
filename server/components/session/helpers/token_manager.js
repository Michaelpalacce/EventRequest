'use strict';

const stringHelper	= require( '../../helpers/unique_id' );
const EventRequest	= require( '../../../event' );
const DataServer	= require( './../../caching/data_server' );

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
	 * @param	EventRequest event
	 * @param	Object options
	 */
	constructor( event, options )
	{
		this.event				= typeof event === 'object' && event instanceof EventRequest ? event : false;
		this.tokenExpiration	= typeof options.tokenExpiration === 'number' ? options.tokenExpiration : 0;
		this.cachingServer		= event !== false ? event.cachingServer : false;

		if ( ! this.cachingServer || ! ( this.cachingServer instanceof DataServer ) )
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
		this.cachingServer.createNamespace( TOKEN_NAMESPACE ).catch(()=>{
			throw new Error( 'Could not create Namespace' );
		});
	}

	/**
	 * @brief	Creates a cookie and a token
	 *
	 * @param	String name
	 * @param	Function callback
	 *
	 * @return	void
	 */
	createCookie( name, callback )
	{
		let sid			= stringHelper.makeId();
		let ttl			= this.tokenExpiration;
		let tokenData	= {
			authenticated	: true,
			sessionId		: sid,
			expires			: Date.now() + ttl
		};

		this.cachingServer.create( TOKEN_NAMESPACE, sid, tokenData, { ttl } ).then(()=>{
			this.event.setHeader( 'Set-Cookie', [ name + '=' + sid] );
			callback( false, tokenData );
		}).catch(( err )=>{
			callback( err )
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
		this.cachingServer.read( TOKEN_NAMESPACE, sid, {} ).then(( sidData )=>{
			if ( sidData.expires > Date.now() )
			{
				callback( false, sidData )
			}
			else
			{
				callback( true );
			}
		}).catch( callback );
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

		this.cachingServer.read( TOKEN_NAMESPACE, sid, {} ).then(( sidData )=>{
			let ttl			= this.tokenExpiration;
			token.expires	= Date.now() + ttl;

			this.cachingServer.update( TOKEN_NAMESPACE, sid, token, { ttl } ).then(()=>{
				callback( false, sidData );
			}).catch( callback );
		}).catch( callback );
	};
}

module.exports	= TokenManager;
