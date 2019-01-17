'use strict';

// Dependencies
const { Mock, assert, test, helpers }	= require( '../../../test_helper' );
const EnvPlugin							= require( '../../../../server/plugins/available_plugins/env_plugin' );
const Server							= require( '../../../../server/server' );
const path								= require( 'path' );

test({
	message	: 'EnvPlugin setServerOnRuntime',
	test	: ( done )=>{
		let MockServer	= Mock( Server );
		let server		= new MockServer();

		let envPlugin	= new EnvPlugin( 'id', {
			fileLocation	: path.join( __dirname, '/fixture/.env'),
			callback		: ( error )=>{
				assert.equal( false, error );
				assert.equal( 'TESTVALUE', process.env.TESTKEY );
				assert.equal( 'TESTVALUE=WITH=ENTER', process.env.TESTKEYTWO );
				done();
			}
		} );

		envPlugin.setServerOnRuntime( server );
	}
});
