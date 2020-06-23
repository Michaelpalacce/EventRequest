'use strict';

const uniqueId	= require( './../helpers/unique_id' );

/**
 * @details	Time the session should be kept. Defaults to 90 days
 *
 * @var		Number TTL
 */
const TTL		= 7776000;

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

		this.sessionId			= typeof event.cookies[this.sessionKey] !== 'undefined'
								? event.cookies[this.sessionKey]
								: null;

		this.session			= {};

		if ( typeof event.cachingServer === 'undefined' )
		{
			throw new Error( 'Could not create session. No caching container is set in the event' );
		}

		this.server				= event.cachingServer;
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
		{
			return false;
		}

		return await this.server.get( this.sessionId ) !== null
	}

	/**
	 * @brief	Removes the session from the caching server
	 *
	 * @return	void
	 */
	async removeSession()
	{
		await this.server.delete( this.sessionId );

		this.event.setCookie( this.sessionKey, this.sessionId, { expires: - this.ttl } );
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
			this.event.setCookie( this.sessionKey, this.sessionId, { expires: this.ttl } );

			return sessionId;
		}
	}

	/**
	 * @brief	Adds a new variable to the session
	 *
	 * @param	name String
	 * @param	value Mixed
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
	 * @param	name String
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
	 * @param	name String
	 *
	 * @return	Boolean
	 */
	has( name )
	{
		return typeof this.session[name] !== 'undefined';
	}

	/**
	 * @brief	Gets a session variable, will throw if that variable does not exist
	 *
	 * @param	name String
	 *
	 * @return	Mixed
	 */
	get( name )
	{
		if ( ! this.has( name ) )
		{
			throw new Error( `The session does not have a value set for: ${name}` );
		}

		return this.session[name];
	}

	/**
	 * @brief	Save the session to the memory storage
	 *
	 * @details	Returns true if the session was saved successfully
	 *
	 * @param	sessionId String
	 *
	 * @return	Boolean
	 */
	async saveSession( sessionId = this.sessionId )
	{
		if ( sessionId === null )
		{
			return false;
		}

		return await this.server.set( sessionId, this.session, this.ttl ) !== null;
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
		if ( ! await this.server.touch( this.sessionId ) )
		{
			return false;
		}

		this.session	= await this.server.get( this.sessionId );

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

module.exports	= Session;