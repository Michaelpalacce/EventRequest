'use strict';

const DataServer								= require( '../../../../server/components/caching/data_server' );
const { Mock, Mocker, assert, test, helpers }	= require( '../../../test_helper' );
const path										= require( 'path' );
const fs										= require( 'fs' );

const PROJECT_ROOT						= path.parse( require.main.filename ).dir;
const DEFAULT_PERSIST_FILE				= path.join( PROJECT_ROOT, 'cache' );

test({
	message	: 'DataServer.constructor sets defaults and creates file if it does not exist',
	test	: ( done )=>{
		if ( fs.existsSync( DEFAULT_PERSIST_FILE ) )
			fs.unlinkSync( DEFAULT_PERSIST_FILE );

		const dataServer	= new DataServer();

		assert.deepEqual( dataServer.server, {} );
		assert.equal( dataServer.defaultTtl, 300 );
		assert.equal( dataServer.persistPath, DEFAULT_PERSIST_FILE );
		assert.equal( fs.existsSync( dataServer.persistPath ), true );
		assert.equal( dataServer.persistInterval, 10000 );

		done();
	}
});
