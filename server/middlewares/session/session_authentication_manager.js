'use strict';

// Dependencies
const TokenManager		= require( './helpers/token_manager' );
const SecurityManager	= require( './security_manager' );

// Constants
const MANAGER_NAME		= 'SessionAuthenticationManager';
const MANAGER_METHODS	= ['POST'];

/**
 * @brief	Handles the authentication by refreshing the authenticated token
 * 			if expired or if the token does not exists, then redirect to /login happens
 */
class SessionAuthenticationManager extends SecurityManager
{
	/**
	 * @see	SecurityManager::constructor()
	 */
	constructor( options )
	{
		super( options );
		this.sessionName			= this.options.sessionName;
		this.authenticationCallback	= this.options.authenticationCallback;
		this.loginRoute				= this.options.loginRoute;
		this.tokenExpiration		= this.options.tokenExpiration;
		this.sanitize();

		this.tokenManager			= new TokenManager( this.options );
	}

	/**
	 * @see	SecurityManager::sanitize()
	 */
	sanitize()
	{
		if ( this.sessionName == undefined || this.authenticationCallback == undefined || this.loginRoute == undefined || this.tokenExpiration == undefined )
		{
			throw new Error( 'Invalid Configuration provided' );
		}
	}

	/**
	 * @see	SecurityManager::getId() Static
	 */
	static getId()
	{
		return MANAGER_NAME;
	}

	/**
	 * @see	SecurityManager::getId()
	 */
	getId()
	{
		return MANAGER_NAME;
	}

	/**
	 * @see	SecurityManager::getPath()
	 */
	getPath()
	{
		return this.loginRoute;
	}

	/**
	 * @see	SecurityManager::getMethods()
	 */
	getMethods()
	{
		return MANAGER_METHODS;
	}

	/**
	 * @see	SecurityManager::handle()
	 */
	handle( event, next, terminate )
	{
		if ( this.authenticationCallback( event ) )
		{
			this.tokenManager.createCookie( event, this.sessionName, ( err ) =>{
				if ( err )
				{
					event.setError( 'Could not create token' );
				}
				else
				{
					next();
				}
			});
		}
		else
		{
			event.setError( 'Invalid username or password' );
		}
	}
}

// Export the module
module.exports	= SessionAuthenticationManager;
