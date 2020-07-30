const { assert, test, helpers }	= require( '../test_helper' );
const path						= require( 'path' );
const { App }					= require( './../../index' );
const fs						= require( 'fs' );
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
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_env.attaches.environment.variables.to.process.when.changed',
	test	: ( done ) => {
		const fileLocation	= path.join( __dirname, './fixture/.env' );
		app.apply( app.er_env, { fileLocation } );

		assert.equal( process.env.TESTKEY, 'TESTVALUE' );

		fs.writeFileSync( fileLocation, 'TESTKEY=TESTVALUE2' )

		setTimeout(()=>{
			assert.equal( process.env.TESTKEY, 'TESTVALUE2' );
			fs.writeFileSync( fileLocation, 'TESTKEY=TESTVALUE' )
			setTimeout(()=>{
				done();
			}, 100 );
		}, 200 );
	}
});

test({
	message	: 'Server.test.er_env.if.file.not.exists',
	test	: ( done ) => {
		const fileLocation	= path.join( __dirname, './fixture/.envNotExisting' );

		assert.throws(() => {
			app.apply( app.er_env, { fileLocation } );
		});

		done();
	}
});

test({
	message	: 'Server.test.er_env.defaults',
	test	: ( done ) => {

		assert.throws(() => {
			app.apply( app.er_env );
		});

		done();
	}
});
