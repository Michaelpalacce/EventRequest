'use strict';

// Dependencies
const Router						= require( '../router' );
const AuthenticationManager			= require( './session/authentication_manager' );
const LoginManager					= require( './session/login_manager' );
const SessionAuthenticationManager	= require( './session/session_authentication_manager' );
const SecurityManager				= require( './session/security_manager' );

const DEFAULT_SESSION_NAME				= 'sid';
const DEFAULT_LOGIN_ROUTE				= '/login';
const DEFAULT_INDEX_ROUTE				= '/index';
const DEFAULT_TOKEN_EXPIRATION_TIME		= 0;
const DEFAULT_AUTHENTICATION_CALLBACK	= ()=>{ return false; };

/**
 * @brief	Handler responsible for security and authentication
 */
class SessionHandler
{
	/**
	 * @details	Accepted options:
	 * 			- sessionName - String - the session name ( aka cookie name ) - Defaults to DEFAULT_SESSION_NAME
	 * 			- loginRoute - String - The route of the login page - Defaults to DEFAULT_LOGIN_ROUTE
	 * 			- indexRoute - String - The route of the login page - Defaults to DEFAULT_INDEX_ROUTE
	 * 			- tokenExpiration - NUmber - The Time to keep the tokens before they expire - Defaults to DEFAULT_TOKEN_EXPIRATION_TIME
	 * 			- authenticationCallback - Function - The callback to be called when authentication has to happen
	 * 									This callback must return a boolean	- Defaults to DEFAULT_AUTHENTICATION_CALLBACK
	 * 			- managers - Array - The managers to be added to the security ( they have 2 parameters : instance which
	 * 								must be an instance of SecurityManager and options which are options to be passed
	 * 								to that specific manager only - Defaults to DEFAULT_AUTHENTICATION_CALLBACK
	 *
	 * @param event
	 * @param options
	 */
	constructor( event, options )
	{
		this.securityConfig				= typeof options !== 'undefined' ? options : [];
		this.event						= event;
		this.callback					= null;
		this.securityManagers			= [];
		this.baseOptions				= {};

		this.sanitizeConfig();
		this.initSecurityManagers();
	}

	/**
	 * @brief	Sanitizes the config of the session handler
	 *
	 * @return	void
	 */
	sanitizeConfig()
	{
		this.baseOptions				= {
			sessionName				: this.securityConfig.sessionName || DEFAULT_SESSION_NAME,
			loginRoute				: this.securityConfig.loginRoute || DEFAULT_LOGIN_ROUTE,
			indexRoute				: this.securityConfig.indexRoute || DEFAULT_INDEX_ROUTE,
			authenticationCallback	: this.securityConfig.authenticationCallback || DEFAULT_AUTHENTICATION_CALLBACK,
			tokenExpiration			: this.securityConfig.tokenExpiration || DEFAULT_TOKEN_EXPIRATION_TIME,
		};

		this.securityConfig.managers	= typeof this.securityConfig.managers === 'object' ? this.securityConfig.managers : [];

		let managers					= this.securityConfig.managers;
		if (
			managers.constructor === Array
			&& ( managers.indexOf( 'default' ) !== -1 || managers.length === 0 )
		) {
			let index	= managers.indexOf( 'default' );
			if ( index !== -1 )
				managers.splice( index, 1 );

			let defaultManagers	= [
				{ instance : AuthenticationManager },
				{ instance : SessionAuthenticationManager },
				{ instance : LoginManager }
			];

			this.securityConfig.managers	= defaultManagers.concat( managers );
		}
	}

	/**
	 * @brief	Initializes all the needed security managers
	 *
	 * @return	void
	 */
	initSecurityManagers()
	{
		try
		{
			if ( this.securityConfig.managers.constructor === Array )
			{
				for ( let index in this.securityConfig.managers )
				{
					let managerConfig	= this.securityConfig.managers[index];
					let manager			= typeof managerConfig.instance === 'function' ? managerConfig.instance : null;
					let managerOptions	= typeof managerConfig.options === 'object' ? managerConfig.options : [];
					
					if ( manager === null )
					{
						throw new Error( 'Invalid configuration' );
					}

					manager	= manager.getInstance( Object.assign( this.baseOptions, managerOptions ) );

					if ( manager instanceof SecurityManager )
					{
						this.securityManagers.push( manager );
					}
				}
			}
		}
		catch ( e )
		{
			console.log( e );
			this.event.setError( 'Invalid configuration provided' );
		}
	}

	/**
	 * @brief	Handles the current request
	 *
	 * @details	The provided callback will be called when handling is done
	 * 			NOTE: If not authenticated then the session will take precautions and redirect if needed.
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	handle( callback )
	{
		if ( typeof callback !== 'function' )
		{
			this.event.setError( 'Invalid callback provided to the session handler' );
		}

		this.callback	= callback;
		this.next();
	}

	/**
	 * @brief	Terminates the security so that the event can continue execution
	 *
	 * @details	Calls teh callback if any if not set an error in the event
	 *
	 * @param	mixed err
	 *
	 * @return	void
	 */
	terminate( err )
	{
		if ( typeof this.callback === 'function' )
		{
			this.callback( err );
		}
		else
		{
			this.event.setError( 'Could not call the callback when terminating the session handler' )
		}
	}

	/**
	 * @brief	Calls the next security manager if any
	 *
	 * @return	void
	 */
	next()
	{
		if ( this.securityManagers.length === 0 )
		{
			this.terminate( false );
		}
		else
		{
			let currentManager	= this.securityManagers.shift();

			if (
				Router.matchRoute( this.event.path, currentManager.getPath() ) !== false
				&& Router.matchMethod( this.event.method, currentManager.getMethods() )
			) {
				currentManager.handle( this.event, this.next.bind( this ), this.terminate.bind( this ) );
			}
			else
			{
				this.next();
			}
		}
	}
}

/**
 * @brief	Export all the relevant security modules
 */
module.exports	= {
	AuthenticationManager			: AuthenticationManager,
	LoginManager					: LoginManager,
	SessionAuthenticationManager	: SessionAuthenticationManager,
	SecurityManager					: SecurityManager,
	SessionHandler					: SessionHandler
};
