'use strict';

// Dependencies
const SecurityManager	= require( './security_manager' );

// Constants
const MANAGER_METHODS	= ['POST'];

/**
 * @brief	Authenticates the user if correct data is passed
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
		this.authenticationRoute	= this.options.authenticationRoute;
		this.tokenManager			= this.options.tokenManager;

		this.sanitize();
	}

	/**
	 * @see	SecurityManager::sanitize()
	 */
	sanitize()
	{
		if (
			this.sessionName == undefined
			|| this.authenticationCallback == undefined
			|| this.authenticationRoute == undefined
			|| this.tokenManager == undefined
		) {
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
		event.session	= {
			authenticated	: false
		};
		
		if ( this.authenticationCallback( event ) )
		{
			this.tokenManager.createCookie( this.sessionName, ( err, tokenData ) =>{
				if ( ! err )
				{
					event.session	= tokenData;
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
module.exports	= SessionAuthenticationManager;
