'use strict';

// Dependencies
const SecurityManager		= require( './security_manager' );
const TokenManager			= require( './helpers/token_manager' );

// Constants
const MANAGER_METHODS	= ['GET'];

/**
 * @brief	Checks if the user is authenticated
 */
class LoginManager extends SecurityManager
{
	/**
	 * @see	SecurityManager::constructor()
	 */
	constructor( options )
	{
		super( options );
		this.sessionName			= this.options.sessionName;
		this.authenticationRoute	= this.options.authenticationRoute;
		this.tokenExpiration		= this.options.tokenExpiration;

		this.sanitize();
		this.tokenManager		= new TokenManager( this.options );
	}

	/**
	 * @see	SecurityManager::sanitize()
	 */
	sanitize()
	{
		if ( this.sessionName == undefined || this.authenticationRoute == undefined || this.tokenExpiration == undefined )
		{
			throw new Error( 'Invalid Configuration provided' );
		}
	}

	/**
	 * @see	SecurityManager::getPath()
	 */
	getPath()
	{
		return this.authenticationRoute;
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
		event.session	= {
			authenticated	: false
		};

		if ( sidCookie )
		{
			this.tokenManager.isExpired( sidCookie, ( err, sidData ) =>{
				if ( ! err )
				{
					event.session	= sidData;
				}

				next();
			});
		}
		else
		{
			next();
		}
	}
}

// Export the module
module.exports	= LoginManager;
