'use strict';

// Dependencies
const TokenManager		= require( './helpers/token_manager' );
const SecurityManager	= require( './security_manager' );

// Constants
const MANAGER_METHODS	= [];

/**
 * @brief	Handles the authentication by refreshing the authenticated token
 */
class SessionSaveManager extends SecurityManager
{
	/**
	 * @see	SecurityManager::constructor()
	 */
	constructor( options )
	{
		super( options );
		this.sessionName			= this.options.sessionName;
		this.tokenManager			= this.options.tokenManager;

		this.sanitize();
	}

	/**
	 * @see	SecurityManager::sanitize()
	 */
	sanitize()
	{
		if ( this.sessionName == undefined || this.tokenManager == undefined )
		{
			throw new Error( 'Invalid Configuration provided' );
		}
	}

	/**
	 * @see	SecurityManager::getPath()
	 */
	getPath()
	{
		return new RegExp( '' );
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
		event.on( 'cleanUp', () =>{
			let session	= event.session;

			if ( typeof session !== 'undefined' && session.authenticated )
			{
				this.tokenManager.updateToken( session, ( err, sidData )=>{
					if ( err )
					{
						event.next( 'Could not save the token' );
					}
				});
			}
		});

		next();
	}
}

// Export the module
module.exports	= SessionSaveManager;
