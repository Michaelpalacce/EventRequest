'use strict';

// Dependencies
const TokenManager		= require( './helpers/token_manager' );
const SecurityManager	= require( './security_manager' );


// Constants
const MANAGER_NAME		= 'AuthenticationManager';
const MANAGER_METHODS	= [];

/**
 * @brief	Handles the authentication by refreshing the authenticated token
 * 			if expired or if the token does not exists, then redirect to /login happens
 */
class AuthenticationManager extends SecurityManager
{
	/**
	 * @see	SecurityManager::constructor()
	 */
	constructor( options )
	{
		super( options );
		this.loginRoute			= this.options.loginRoute;
		this.sessionName		= this.options.sessionName;
		this.tokenExpiration	= this.options.tokenExpiration;

		this.sanitize();
		this.tokenManager		= new TokenManager( this.options );
	}

	/**
	 * @see	SecurityManager::sanitize()
	 */
	sanitize()
	{
		if ( this.loginRoute == undefined || this.sessionName == undefined || this.tokenExpiration == undefined )
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
		return new RegExp( '^(?!' + this.loginRoute + ').*$' );
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
		let sidCookie	= typeof event.cookies[this.sessionName] === 'string' ? event.cookies[this.sessionName] : false;

		if ( sidCookie )
		{
			this.tokenManager.isExpired( sidCookie, ( err ) =>{
				if ( err )
				{
					event.redirect( this.loginRoute );
				}
				else {
					this.tokenManager.updateToken( sidCookie, ( err ) =>{
						if ( err )
						{
							event.serverError( 'Could not update token.' );
						}
						else
						{
							terminate( err );
						}
					});
				}
			});
		}
		else
		{
			event.redirect( this.loginRoute );
		}
	}
}

// Export the module
module.exports	= AuthenticationManager;
