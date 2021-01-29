'use strict';

// Dependencies
const { Mock, assert, test }	= require( '../../../test_helper' );
const EnvPlugin					= require( '../../../../server/plugins/available_plugins/env_plugin' );
const Server					= require( '../../../../server/server' );
const path						= require( 'path' );
const fs						= require( 'fs' );

test({
	message	: 'EnvPlugin.setServerOnRuntime',
	test	: ( done ) => {
		const MockServer	= Mock( Server );
		const server		= new MockServer();
		const fileLocation	= path.join( __dirname, '/fixture/.env');

		fs.writeFileSync( fileLocation,
			'TESTKEY=TESTVALUE\n' +
			'TESTKEYTWO=TESTVALUE=WITH=ENTER\r\n\r'
		);

		const envPlugin	= new EnvPlugin( 'id', { fileLocation } );

		envPlugin.setServerOnRuntime( server );

		assert.equal( 'TESTVALUE', process.env.TESTKEY );
		assert.equal( 'TESTVALUE=WITH=ENTER', process.env.TESTKEYTWO );

		delete( process.env.TESTKEY );
		delete( process.env.TESTKEYTWO );

		done();
	}
});

test({
	message	: 'EnvPlugin.setServerOnRuntime.if.file.not.exists',
	test	: ( done ) => {
		const MockServer	= Mock( Server );
		const server		= new MockServer();
		const fileLocation	= path.join( __dirname, '/fixture/.env');

		fs.writeFileSync( fileLocation,
			'TESTKEY=TESTVALUE\n' +
			'TESTKEYTWO=TESTVALUE=WITH=ENTER\r\n\r'
		);

		const envPlugin	= new EnvPlugin( 'id', { fileLocation: './wrong' } );

		envPlugin.setServerOnRuntime( server );

		assert.deepStrictEqual( process.env.TESTKEY, undefined );
		assert.deepStrictEqual( process.env.TESTKEYTWO, undefined );

		done();
	}
});
