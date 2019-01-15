'use strict';

const uniqueId				= require( './../helpers/unique_id' );

const SESSIONS_NAMESPACE	= 'er_session';

/**
 * @brief	Session container
 */
class Session
{
	constructor( event, options )
	{
		this.event				= event;
		this.cachingServer		= event.cachingServer;
		this.options			= options;

		this.ttl				= typeof this.options.ttl === 'number'
								? this.options.ttl
								: 0;

		this.sessionKey			= typeof this.options.sessionKey === 'string'
								? this.options.sessionKey
								: 'sid';

		this.sessionIdLength	= typeof this.options.sessionIdLength === 'number'
								? this.options.sessionIdLength
								: 32;

		this.sessionId			= typeof event.cookies[this.sessionKey] !== 'undefined'
								? event.cookies[this.sessionKey]
								: null;

		this.session			= {};

		if ( typeof this.cachingServer === 'undefined' )
		{
			throw new Error( 'Could not create session. No caching container is set in the event' );
		}
	}

	makeNewSessionId()
	{
		return uniqueId.makeId( this.sessionIdLength );
	}

	hasSession( callback )
	{
		if ( this.sessionId === null )
		{
			callback( false );
		}

		this.cachingServer.exists( SESSIONS_NAMESPACE, this.sessionId ).then( callback ).catch( ()=>{
			callback( false );
		} )
	}

	/**
	 * @brief	Starts a new session
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	newSession( callback )
	{
		let sessionId	= this.makeNewSessionId();
		this.session	= {
			id	: sessionId
		};

		this.saveSession( ( err )=>{
			if ( ! err )
			{
				this.sessionId	= sessionId;
				this.event.setCookie( this.sessionKey, this.sessionId );
			}

			callback( err );
		}, sessionId );
	}

	addSessionVariable( name, value )
	{
		this.session[name]	= value;
	}

	deleteSessionVariable( name )
	{
		delete this.session[name];
	}

	hasSessionVariable( name )
	{
		typeof this.session[name] !== 'undefined';
	}

	saveSession( callback, sessionId = this.getSessionId() )
	{
		this.cachingServer.create( SESSIONS_NAMESPACE, sessionId, this.session, { ttl : this.ttl } ).then( ()=>{
			callback( false );
		} ).catch( callback )
	}

	/**
	 * @brief	Fetches the session if it exists
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	fetchSession( callback )
	{
		this.cachingServer.read( SESSIONS_NAMESPACE, this.getSessionId(), { ttl : this.ttl } ).then( ( entry )=>{
			this.session	= entry;
			callback( false );
		}).catch( callback );
	}

	/**
	 * @brief	Returns the sessionId
	 *
	 * @return	String
	 */
	getSessionId()
	{
		return this.sessionId;
	}

	/**
	 * @brief	Gets the session for the current client
	 *
	 * @return	Object
	 */
	getSession()
	{
		return this.session;
	}
}

module.exports	= { Session, SESSIONS_NAMESPACE };