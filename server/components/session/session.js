'use strict';

const uniqueId				= require( './../helpers/unique_id' );

/**
 * @brief	The namespace in which the sessions should be stored
 *
 * @var		String SESSIONS_NAMESPACE
 */
const SESSIONS_NAMESPACE	= 'er_session';

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

		if ( typeof event.cachingServer === 'undefined' )
		{
			throw new Error( 'Could not create session. No caching container is set in the event' );
		}

		this.model				= event.cachingServer.model( SESSIONS_NAMESPACE );
	}

	/**
	 * @brief	Creates a new SessionId
	 *
	 * @return	String
	 */
	makeNewSessionId()
	{
		return uniqueId.makeId( this.sessionIdLength );
	}

	/**
	 * @brief	Checks if the user has a session
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	hasSession( callback )
	{
		if ( this.sessionId === null )
		{
			callback( false );
			return;
		}

		this.model	.find( this.sessionId )
					.then( ( record )=> callback( record !== null ) )
					.catch( ()=> callback( false ) );
	}

	/**
	 * @brief	Removes the session from the caching server
	 *
	 * @param	Function callback
	 * @param	String sessionId
	 *
	 * @return	void
	 */
	removeSession( callback, sessionId = this.getSessionId() )
	{
		this.model.findAndRemove( sessionId ).then( callback ).catch( callback );
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

	/**
	 * @brief	Adds a new variable to the session
	 *
	 * @param	String name
	 * @param	Mixed value
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
	 * @param	String name
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
	 * @param	String name
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
	 * @param	String name
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
	 * @param	Function callback
	 * @param	String sessionId
	 *
	 * @return	void
	 */
	saveSession( callback, sessionId = this.getSessionId() )
	{
		if ( sessionId === null )
		{
			callback( false );
			return;
		}

		this.model.make( sessionId, this.session, { ttl : this.ttl } ).then( ()=>{
			callback( false );
		} ).catch( callback );
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
		let recordName	= this.getSessionId();
		this.model.find( recordName, { ttl : this.ttl } ).then( ( entry )=>{
			if ( entry === null )
			{
				callback( new Error( `There was no session for ${recordName}` ) );
				return;
			}

			this.session	= entry.recordData;
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
}

module.exports	= { Session, SESSIONS_NAMESPACE };