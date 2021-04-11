'use strict';

const uniqueId	= require( './../helpers/unique_id' );

/**
 * @details	Time the session should be kept. Defaults to 90 days
 *
 * @var		Number TTL
 */
const TTL	= 7776000;

/**
 * @brief	Session container
 */
class Session
{
	constructor( event, options = {} )
	{
		this.event				= event;
		this.options			= options;

		this.ttl				= typeof this.options.ttl === 'number'
								? this.options.ttl
								: TTL ;

		this.sessionKey			= typeof this.options.sessionKey === 'string'
								? this.options.sessionKey
								: 'sid';

		this.sessionIdLength	= typeof this.options.sessionIdLength === 'number'
								? this.options.sessionIdLength
								: 32;

		this.isCookieSession	= typeof this.options.isCookieSession === 'boolean'
								? this.options.isCookieSession
								: true;

		this.isSecureCookie		= typeof this.options.isSecureCookie === 'boolean'
								? this.options.isSecureCookie
								: false;

		this.sessionId			= this.isCookieSession ?
									typeof event.cookies[this.sessionKey] !== 'undefined'
										? event.cookies[this.sessionKey]
										: null
									: event.hasRequestHeader( this.sessionKey )
										? event.getRequestHeader( this.sessionKey )
										: null;

		this.session			= {};

		if ( typeof event.dataServer === 'undefined' )
			throw new Error( 'app.er.session.missingDataServer' );

		this.server				= event.dataServer;
	}

	/**
	 * @brief	Creates a new SessionId
	 *
	 * @return	String
	 */
	_makeNewSessionId()
	{
		return uniqueId.makeId( this.sessionIdLength );
	}

	/**
	 * @brief	Checks if the user has a session
	 *
	 * @return	Boolean
	 */
	async hasSession()
	{
		if ( this.sessionId === null )
			return false;

		return await this.server.get( Session.SESSION_PREFIX + this.sessionId ) !== null;
	}

	/**
	 * @brief	Removes the session from the caching server
	 *
	 * @return	void
	 */
	async removeSession()
	{
		await this.server.delete( Session.SESSION_PREFIX + this.sessionId );

		this.session	= {};

		if ( this.isCookieSession )
			this.event.setCookie( this.sessionKey, this.sessionId, { expires: - this.ttl, SameSite: this.isSecureCookie ? 'None; Secure' : 'Lax' } );
	}

	/**
	 * @brief	Starts a new session
	 *
	 * @return	String|Boolean
	 */
	async newSession()
	{
		const sessionId	= this._makeNewSessionId();
		this.session	= {
			id	: sessionId
		};

		if ( ! await this.saveSession( sessionId ) )
		{
			return false;
		}
		else
		{
			this.sessionId	= sessionId;

			if ( this.isCookieSession )
				this.event.setCookie( this.sessionKey, this.sessionId, { expires: this.ttl, SameSite: this.isSecureCookie ? 'None; Secure' : 'Lax' } );
			else
				this.event.setResponseHeader( this.sessionKey, this.sessionId );

			return sessionId;
		}
	}

	/**
	 * @brief	Adds a new variable to the session
	 *
	 * @param	{String} name
	 * @param	{*} value
	 *
	 * @return	void
	 */
	add( name, value )
	{
		this.session[name]	= value;
	}

	/**
	 * @brief	Deletes a variable from the session
	 *
	 * @param	{String} name
	 *
	 * @return	void
	 */
	delete( name )
	{
		delete this.session[name];
	}

	/**
	 * @brief	Checks if a variable exists in the session
	 *
	 * @param	{String} name
	 *
	 * @return	Boolean
	 */
	has( name )
	{
		return typeof this.session[name] !== 'undefined';
	}

	/**
	 * @brief	Gets a session variable
	 *
	 * @details	Returns null if the value does not exist
	 *
	 * @param	{String} name
	 *
	 * @return	 *
	 */
	get( name )
	{
		if ( ! this.has( name ) )
			return null;

		return this.session[name];
	}

	/**
	 * @brief	Save the session to the memory storage
	 *
	 * @details	Returns true if the session was saved successfully
	 *
	 * @param	{String} [sessionId=this.sessionId]
	 *
	 * @return	Boolean
	 */
	async saveSession( sessionId = this.sessionId )
	{
		if ( sessionId === null )
			return false;

		return await this.server.set( Session.SESSION_PREFIX + sessionId, this.session, this.ttl ) !== null;
	}

	/**
	 * @brief	Fetches the session if it exists
	 *
	 * @details	Returns true if it was successfully fetched and false on error
	 *
	 * @return	Boolean
	 */
	async fetchSession()
	{
		if ( ! await this.server.touch( Session.SESSION_PREFIX + this.sessionId ) )
			return false;

		this.session	= await this.server.get( Session.SESSION_PREFIX + this.sessionId );

		return true;
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
}

/**
 * @brief	Default prefix set before every key that is set in the store
 *
 * @var		String SESSION_PREFIX
 */
Session.SESSION_PREFIX	= '$S:';

module.exports	= Session;