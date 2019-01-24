#!/usr/bin/env node

// Dependencies
const path			= require( 'path' );
const fs			= require( 'fs' );
const projectDir	= path.resolve( __dirname, './generator' );
const { exec }		= require( 'child_process' );

/**
 * @brief	Copies the folder recursively
 *
 * @param	String src
 * @param	String dest
 *
 * @return	void
 */
let copyRecursiveSync = ( src, dest )=>{
	let exists		= fs.existsSync( src );
	let stats		= exists && fs.statSync( src );
	let isDirectory	= exists && stats.isDirectory();

	if ( exists && isDirectory )
	{
		if ( ! fs.existsSync( dest ) )
		{
			fs.mkdirSync( dest );
		}

		fs.readdirSync( src ).forEach( ( childItemName )=>{
			copyRecursiveSync( path.join( src, childItemName ), path.join( dest, childItemName ) );
		});
	}
	else
	{
		console.log( `Writing: ${dest}` );
		fs.writeFileSync( dest, fs.readFileSync( src ) );
	}
};

/**
 * @brief	Logs out help logs
 *
 * @return	void
 */
let getHelp	= ()=>{
	console.log( 'To create a new project type "event_request install". This will install the project in the current folder.' );
	console.log( 'If you want to specify a custom folder, use "event_request install /path/to/folder"' );
};

let arguments	= process.argv;

// Remove first 2 arguments, they are not needed.
arguments.shift();
arguments.shift();

if ( arguments.length === 0 )
{
	getHelp();
}
else
{
	let command	= arguments.shift();

	switch ( command )
	{
		case 'install':
			let directory	= arguments.shift();
			directory		= typeof directory === 'string'
							? directory
							: '.';

			let dest		= path.resolve( process.cwd(), directory );

			if ( ! fs.existsSync( dest ) )
			{
				fs.mkdirSync( dest );
			}

			copyRecursiveSync( projectDir, dest );

			exec( 'npm run setUp', { cwd: dest }, ( err, stdOut, stdErr )=>{
				err != null ? console.log( err ) : err;
				console.log( stdErr );
				console.log( stdOut );
			} );

			break;
		case 'help':
		default:
			getHelp();
	}
}