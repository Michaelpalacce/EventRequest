'use strict';

const fs				= require( 'fs' );
const readline			= require( 'readline' );
const path				= require( 'path' );
const PluginInterface	= require( '../plugin_interface' );
const { Loggur }		= require( '../../components/logger/loggur' );

const ENV_FILENAME	= '.env';
const ENV_SEPARATOR	= '=';
const CHANGE_EVENT	= 'change';

/**
 * @brief	Env Plugin responsible for parsing .env file and adding those variables to the process.env
 */
class EnvPlugin extends PluginInterface
{
	constructor( id, options )
	{
		super( id, options );

		this.envVariableKeys	= [];
	}

	/**
	 * @brief	Removes the old environment variables so new ones can be set
	 *
	 * @return	void
	 */
	removeOldEnvVariables()
	{
		this.envVariableKeys.forEach(( envKey )=>{
			delete process.env[envKey];
		})
	}

	/**
	 * @brief	Loads the file to the process.env
	 *
	 * @param	Function callback
	 *
	 * @return	void
	 */
	loadFileInEnv( callback = ()=>{} )
	{
		let absFilePath		= this.getEnvFileAbsPath();
		let fileExists		= fs.existsSync( absFilePath );
		if ( fileExists )
		{
			this.removeOldEnvVariables();
			// Reset the env variables array so we can populate it anew
			this.envVariableKeys	= [];

			let lineReader	= readline.createInterface({
				input	: fs.createReadStream( absFilePath )
			});

			lineReader.on( 'line', ( line )=>{

				let parts	= line.split( ENV_SEPARATOR );
				let key		= parts.shift();

				this.envVariableKeys.push( key );

				process.env[key]	= parts.join( ENV_SEPARATOR );
			});

			lineReader.on( 'close', ()=>{
				callback( false );
			} );
		}
		else
		{
			let errorMessage	= `Trying to load .env file from ${absFilePath} but it doesn't exist`;
			Loggur.log( errorMessage );
			callback( errorMessage );
		}
	}

	/**
	 * @brief	Loads the env variables on runtime
	 *
	 * @param	Server server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		let callback		= typeof this.options.callback === 'function'
							? this.options.callback
							: ()=>{};

		this.loadFileInEnv( callback );
		this.attachFileWatcherToEnvFile();
	}

	/**
	 * @brief	Gets the absolute file path to the .env file
	 *
	 * @return	String
	 */
	getEnvFileAbsPath()
	{
		return typeof this.options.fileLocation === 'string'
			? this.options.fileLocation
			: path.join( path.parse( require.main.filename ).dir, ENV_FILENAME )
	}

	/**
	 * @brief	Attach a file watcher to the env file to reload the env variables on change
	 *
	 * @param	String absFilePath
	 *
	 * @return	void
	 */
	attachFileWatcherToEnvFile()
	{
		let absFilePath		= this.getEnvFileAbsPath();

		fs.watch( absFilePath, ( eventType )=>{
			if ( eventType === CHANGE_EVENT )
			{
				this.loadFileInEnv();
			}
		});
	}
}

module.exports	= EnvPlugin;