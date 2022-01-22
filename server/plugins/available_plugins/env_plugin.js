'use strict';

const fs				= require( 'fs' );
const path				= require( 'path' );
const PluginInterface	= require( '../plugin_interface' );

const ENV_FILENAME		= '.env';
const ENV_SEPARATOR		= '=';

/**
 * @brief	Env Plugin responsible for parsing .env file and adding those variables to the process.env
 */
class EnvPlugin extends PluginInterface {
	/**
	 * @brief	Loads the file to the process.env
	 *
	 * @return	void
	 */
	loadFileInEnv() {
		const absFilePath	= this.getEnvFileAbsPath();

		if ( fs.existsSync( absFilePath ) ) {
			for ( const line of fs.readFileSync( absFilePath, 'utf-8' ).split( /\r?\n/ ) ) {
				const parts			= line.split( ENV_SEPARATOR );
				const key			= parts.shift();

				process.env[key]	= parts.join( ENV_SEPARATOR ).replace( '\r', '' ).replace( '\n', '' );
			}
		}
	}

	/**
	 * @brief	Loads the env variables on runtime
	 *
	 * @param	{Server} server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server ) {
		this.loadFileInEnv();
	}

	/**
	 * @brief	Gets the absolute file path to the .env file
	 *
	 * @return	String
	 */
	getEnvFileAbsPath() {
		return typeof this.options.fileLocation === 'string'
			? this.options.fileLocation
			: path.join( path.parse( require.main.filename ).dir, ENV_FILENAME );
	}
}

module.exports	= EnvPlugin;
