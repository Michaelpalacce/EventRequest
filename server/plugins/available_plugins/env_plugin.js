'use strict';

const fs				= require( 'fs' );
const readline			= require( 'readline' );
const path				= require( 'path' );
const PluginInterface	= require( '../plugin_interface' );
const { Loggur }		= require( '../../components/logger/loggur' );

const ENV_FILENAME	= '.env';
const ENV_SEPARATOR	= '=';

/**
 * @brief	Env Plugin responsible for parsing .env file and adding those variables to the process.env
 */
class Env_plugin extends PluginInterface
{
	/**
	 * @brief	Loads the env variables on runtime
	 *
	 * @param	Server server
	 *
	 * @return	void
	 */
	setServerOnRuntime( server )
	{
		let fileLocation	= typeof this.options.fileLocation === 'string'
							? this.options.fileLocation
							: path.join( path.parse( require.main.filename ).dir, ENV_FILENAME );

		let callback		= typeof this.options.callback === 'function'
							? this.options.callback
							: ()=>{};

		let fileExists		= fs.existsSync( fileLocation );
		if ( fileExists )
		{
			let lineReader	= readline.createInterface({
				input	: fs.createReadStream( fileLocation )
			});

			lineReader.on( 'line', ( line )=>{

				let parts	= line.split( ENV_SEPARATOR );

				process.env[parts.shift()]	= parts.join( ENV_SEPARATOR );
			});

			lineReader.on( 'close', ()=>{
				callback( false );
			} );
		}
		else
		{
			Loggur.log( `Trying to load .env file from ${fileLocation} but it doesn't exist` );
			callback( true );
		}
	}
}

module.exports	= Env_plugin;