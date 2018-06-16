'use strict';

// Dependencies
const TokenManager		= require( './helpers/token_manager' );
const SecurityManager	= require( './security_manager' );

// Constants
const MANAGER_METHODS	= [];

/**
 * @brief	Handles the authentication by refreshing the authenticated token
 */
class AuthenticationManager extends SecurityManager
{
	/**
	 * @see	SecurityManager::constructor()
	 */
	constructor( options )
	{
		super( options );
		this.authenticationRoute	= this.options.authenticationRoute;
		this.sessionName			= this.options.sessionName;
		this.tokenExpiration		= this.options.tokenExpiration;

		this.sanitize();
		this.tokenManager			= new TokenManager( this.options );
	}

	/**
	 * @see	SecurityManager::sanitize()
	 */
	sanitize()
	{
		if ( this.authenticationRoute == undefined || this.sessionName == undefined || this.tokenExpiration == undefined )
		{
			throw new Error( 'Invalid Configuration provided' );
		}
	}

	/**
	 * @see	SecurityManager::getPath()
	 */
	getPath()
	{
		return new RegExp( '^(?!' + this.authenticationRoute + ').*$' );
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
module.exports	= AuthenticationManager;
