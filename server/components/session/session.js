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
class Session {
	constructor( event, options = {} ) {
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

		if ( typeof event.dataServer === 'undefined' )
			throw new Error( 'app.er.session.missingDataServer' );

		this.server				= event.dataServer;

		// Attach set as an alias
		this.set				= this.add;
	}

	/**
	 * Initializes the session. This must be called before anything else. The other methods do not check if this has been called
	 * intentionally to save on some speed.
	 *
	 * @return	{Promise<void>}
	 */
	async init() {
		this.sessionId	= this.isCookieSession ?
							this.event.cookies[this.sessionKey] ?? null
							: this.event.getRequestHeader( this.sessionKey, null );

		if ( ! await this.fetchSession() )
			await this.newSession();
	}

	/**
	 * @brief	Creates a new SessionId
	 *
	 * @return	String
	 */
	_makeNewSessionId() {
		return uniqueId.makeId( this.sessionIdLength );
	}

	/**
	 * @brief	Checks if the user has a session
	 *
	 * @return	Boolean
	 */
	async hasSession() {
		if ( this.sessionId === null )
			return false;

		return await this.server.get( Session.SESSION_PREFIX + this.sessionId ) !== null;
	}

	/**
	 * @brief	Removes the session from the caching server
	 *
	 * @return	void
	 */
	async removeSession() {
		await this.server.delete( Session.SESSION_PREFIX + this.sessionId );

		this.session	= {};
		this.sessionId	= null;

		if ( this.isCookieSession )
			this.event.setCookie( this.sessionKey, this.sessionId, { expires: - this.ttl, SameSite: this.isSecureCookie ? 'None; Secure' : 'Lax' } );
	}

	/**
	 * Starts a new session.
	 * Returns the sessionId or null on error.
	 *
	 * @return	void
	 */
	async newSession() {
		this.sessionId	= this._makeNewSessionId();
		this.session	= {};

		if ( await this.saveSession() )
			if ( this.isCookieSession )
				this.event.setCookie( this.sessionKey, this.sessionId, { expires: this.ttl, SameSite: this.isSecureCookie ? 'None; Secure' : 'Lax' } );
			else
				this.event.setResponseHeader( this.sessionKey, this.sessionId );
		else
			throw new Error( 'app.er.session.couldNotSaveSessionToDataServer' );
	}

	/**
	 * Adds a new variable to the session
	 *
	 * @deprecated	Use set instead
	 *
	 * @param	{String} name
	 * @param	{*} value
	 *
	 * @return	void
	 */
	add( name, value ) {
		this.session[name]	= value;
	}

	/**
	 * @brief	Deletes a variable from the session
	 *
	 * @param	{String} name
	 *
	 * @return	void
	 */
	delete( name ) {
		delete this.session[name];
	}

	/**
	 * @brief	Checks if a variable exists in the session
	 *
	 * @param	{String} name
	 *
	 * @return	Boolean
	 */
	has( name ) {
		return typeof this.session[name] !== 'undefined';
	}

	/**
	 * Gets a session variable.
	 * Returns null if the value does not exist.
	 *
	 * @param	{String} name
	 *
	 * @return	 *
	 */
	get( name ) {
		if ( ! this.has( name ) )
			return null;

		return this.session[name];
	}

	/**
	 * Gets all session variables.
	 *
	 * @return	 {Object}
	 */
	getAll() {
		return this.session;
	}

	/**
	 * Save the session to the memory storage.
	 * Returns true if the session was saved successfully.
	 *
	 * @return	Boolean
	 */
	async saveSession() {
		if ( ! this.session || ! this.sessionId )
			return false;

		return await this.server.set( Session.SESSION_PREFIX + this.sessionId, this.session, this.ttl ) !== null;
	}

	/**
	 * Fetches the session if it exists
	 * Returns the session if it exists, otherwise return null
	 *
	 * @return	Boolean
	 */
	async fetchSession() {
		if ( ! await this.server.touch( Session.SESSION_PREFIX + this.sessionId ) )
			return null;

		return this.session	= await this.server.get( Session.SESSION_PREFIX + this.sessionId );
	}

	/**
	 * @brief	Returns the sessionId
	 *
	 * @return	String
	 */
	getSessionId() {
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