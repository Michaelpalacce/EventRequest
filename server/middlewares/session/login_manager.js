'use strict';

// Dependencies
const TokenManager		= require( './helpers/token_manager' );
const SecurityManager	= require( './security_manager' );


// Constants
const MANAGER_NAME		= 'LoginManager';
const MANAGER_METHODS	= ['GET'];

/**
 * @brief	Handles the authentication by refreshing the authenticated token
 * 			if expired or if the token does not exists, then redirect to /login happens
 */
class LoginManager extends SecurityManager
{
	/**
	 * @see	SecurityManager::constructor()
	 */
	constructor( options )
	{
		super( options );
		this.indexRoute			= this.options.indexRoute;
		this.sessionName		= this.options.sessionName;
		this.loginRoute			= this.options.loginRoute;
		this.tokenExpiration	= this.options.tokenExpiration;

		this.sanitize();
		this.tokenManager		= new TokenManager( this.options );
	}

	/**
	 * @see	SecurityManager::sanitize()
	 */
	sanitize()
	{
		if ( this.indexRoute == undefined || this.sessionName == undefined || this.loginRoute == undefined || this.tokenExpiration == undefined )
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
		let sidCookie	= typeof event.cookies[this.sessionName] === 'string' ? event.cookies[this.sessionName] : false;

		if ( sidCookie )
		{
			this.tokenManager.isExpired( sidCookie, ( err ) =>{
				if ( err )
				{
					terminate();
				}
				else
				{
					event.redirect( this.indexRoute );
				}
			});
		}
		else
		{
			terminate();
		}
	}
}

// Export the module
module.exports	= LoginManager;
