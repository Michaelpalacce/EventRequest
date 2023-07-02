const { assert, test, helpers }	= require( '../test_helper' );
const path						= require( 'path' );
const { App }					= require( './../../server/index' );
const app						= App();

test({
	message	: 'Server.test.er_env.getEnvFileAbsPath',
	test	: ( done ) => {
		assert.deepStrictEqual( app.er_env.getEnvFileAbsPath(), path.join( path.parse( require.main.filename ).dir, '.env' ) );

		done();
	}
});

test({
	message	: 'Server.test.er_env.attaches.environment.variables.to.process',
	test	: ( done ) => {
		const name			= 'testErEnvAttachesVariablesToProcess';
		const fileLocation	= path.join( __dirname, './fixture/.env' );
		app.apply( app.er_env, { fileLocation } );

		assert.equal( process.env.TESTKEY, 'TESTVALUE' );

		app.get( `/${name}`, ( event ) => {
			assert.equal( process.env.TESTKEY, 'TESTVALUE' );
			event.send( name );
		});

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_env.if.file.not.exists',
	test	: ( done ) => {
		const fileLocation	= path.join( __dirname, './fixture/.envNotExisting' );

		// Does not throw
		app.apply( app.er_env, { fileLocation } );

		done();
	}
});

test({
	message	: 'Server.test.er_env.defaults',
	test	: ( done ) => {

		// Does not throw
		app.apply( app.er_env );

		done();
	}
});
