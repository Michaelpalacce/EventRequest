'use strict';

const path			= require( 'path' );
const fs			= require( 'fs' );
const app			= require( '../index' )();
const DataServer	= require( '../server/components/caching/data_server' );

const TEST_ROOT		= path.parse( __dirname ).dir;

/**
 * @brief	Deletes all FILES from a given directory
 *
 * @details	This action is not recursive and is synchronous
 *
 * @param	String dir
 * @param	Array whiteList
 *
 * @return	void
 */
function clearUpDirectory( dir, whiteList )
{
	if ( fs.existsSync( dir ) )
	{
		fs.readdirSync( dir ).forEach( ( file ) =>
		{
			const curPath	= path.join( dir, file );

			if ( fs.lstatSync( curPath ).isDirectory() )
				return;

			if ( ! whiteList.includes( file ) )
				fs.unlinkSync( curPath );
		});
	}
}

clearUpDirectory( path.join( __dirname, './server/components/body_parsers/fixture/testUploads' ), ['.gitignore'] );
clearUpDirectory( path.join( __dirname, './server/fixture/body_parser/multipart' ), ['.gitignore', 'multipart_data_CR', 'multipart_data_CRLF', 'multipart_data_LF'] );
clearUpDirectory( path.join( __dirname, './server/components/logger/components/transport_types/fixtures' ), ['.gitignore', 'testfile'] );
clearUpDirectory( path.join( __dirname, './server/fixture/logger' ), ['.gitignore'] );

app.add({
	route	: '/ping',
	method	: 'GET',
	handler	: ( event ) => {
		event.send( 'pong', 200 );
	}
});

app.listen( 3333, () => {});

// Set up a memory server to be used by the tests
const dataServer	= new DataServer({ persist: false, persistPath: path.join( TEST_ROOT, './fixture/cache' )});

module.exports	= {
	server: app, dataServer
};
