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
		let MockServer		= Mock( Server.class );
		let server			= new MockServer();
		let fileLocation	= path.join( __dirname, '/fixture/.env');

		let originalContent	= fs.readFileSync( fileLocation );
		originalContent		= originalContent.toString( 'utf-8' );

		let envPlugin		= new EnvPlugin( 'id', { fileLocation } );

		envPlugin.setServerOnRuntime( server );

		assert.equal( 'TESTVALUE', process.env.TESTKEY );
		assert.equal( 'TESTVALUE=WITH=ENTER', process.env.TESTKEYTWO );

		fs.writeFileSync( fileLocation, 'TEST=VALUE' );

		setTimeout(()=>{
			assert.equal( 'VALUE', process.env.TEST );
			assert.equal( true, typeof process.env.TESTKEY === 'undefined' );
			assert.equal( true, typeof process.env.TESTKEYTWO === 'undefined' );

			fs.writeFileSync( fileLocation, originalContent );

			done();
		}, 200 );
	}
});
