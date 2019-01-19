'use strict';

// Dependencies
const { Mock, assert, test, helpers }	= require( '../../../test_helper' );
const EnvPlugin							= require( '../../../../server/plugins/available_plugins/env_plugin' );
const Server							= require( '../../../../server/server' );
const path								= require( 'path' );
const fs								= require( 'fs' );

test({
	message	: 'EnvPlugin setServerOnRuntime',
	test	: ( done )=>{
		let MockServer		= Mock( Server );
		let server			= new MockServer();
		let fileLocation	= path.join( __dirname, '/fixture/.env');

		let envPlugin		= new EnvPlugin( 'id', {
			fileLocation,
			callback		: ( error )=>{
				assert.equal( false, error );
				assert.equal( 'TESTVALUE', process.env.TESTKEY );
				assert.equal( 'TESTVALUE=WITH=ENTER', process.env.TESTKEYTWO );

				let writeStream	= fs.createWriteStream( fileLocation );

				writeStream.write( 'TEST=VALUE' );
				writeStream.end();

				// Wait for the file system watcher to find the changes
				setTimeout(()=>{
					assert.equal( 'VALUE', process.env.TEST );
					assert.equal( true, typeof process.env.TESTKEY === 'undefined' );
					assert.equal( true, typeof process.env.TESTKEYTWO === 'undefined' );
					done();
				}, 250 );
			}
		} );

		envPlugin.setServerOnRuntime( server );
	}
});
