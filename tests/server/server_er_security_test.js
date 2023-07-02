const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../server/index' );

test({
	message	: 'Server.er_securityOnDefaults',
	test	: ( done ) => {
		const port	= 3370;
		const name	= 'testErSecurityOnDefaults';
		const app	= new Server();

		app.apply( app.er_security );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', true );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', true );

				assert.equal( response.headers['content-security-policy'], "default-src 'none'; script-src 'self'; img-src 'self'; font-src 'self'; style-src 'self'; connect-src 'self'; child-src 'self'; media-src 'self'; manifest-src 'self'; object-src 'self'; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=31536000;" );
				assert.equal( response.headers['expect-ct'], "max-age=86400, enforce" );
				assert.equal( response.headers['x-content-type-options'], "nosniff" );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_security.with.constructor.with.options',
	test	: ( done ) => {
		const port	= 3379;
		const name	= 'testErSecurityWithConstructorWithOptionsRemovesBuild';
		const app	= new Server();

		const SecurityConstructor	= app.er_security.constructor;
		const securityPlugin		= new SecurityConstructor( 'id', { build : false } );
		assert.deepStrictEqual( securityPlugin.options, { build: false } );

		app.apply( securityPlugin );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );

				assert.equal( typeof response.headers['content-security-policy'], 'undefined' );
				assert.equal( typeof response.headers['strict-transport-security'], 'undefined' );
				assert.equal( typeof response.headers['expect-ct'], 'undefined' );
				assert.equal( typeof response.headers['x-content-type-options'], 'undefined' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_securityWithChangesFromTheOptions',
	test	: ( done ) => {
		const port	= 3371;
		const name	= 'testErSecurityWithChangesFromTheOptions';
		const app	= new Server();

		app.apply( app.er_security, {
			csp		: { xss: false,  directives: { 'font-src': ["self", 'test'], 'upgrade-insecure-requests': [] }, self: true, sandbox: true },
			ect		: { enabled: false, maxAge: 30000 },
			hsts	: { maxAge: 300, preload: true, includeSubDomains: false },
			cto		: { enabled: true }
		});

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', false );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', true );

				assert.equal( response.headers['content-security-policy'], "font-src 'self' test; upgrade-insecure-requests; default-src 'self'; sandbox;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=300; preload;" );
				assert.equal( response.headers['expect-ct'], undefined );
				assert.equal( response.headers['x-content-type-options'], "nosniff" );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_securityWithChangesInline',
	test	: ( done ) => {
		const port	= 3372;
		const name	= 'testErSecurityWithChangesInline';
		const app	= new Server();

		app.apply( app.er_security, { csp : { xss: false } } );

		app.add(( event ) => {

			event.$security.csp.addFontSrc( 'self' );
			event.$security.csp.addFontSrc( "'self'" );
			event.$security.csp.addFontSrc( 'test' );
			event.$security.csp.upgradeInsecureRequests();
			event.$security.csp.enableSelf();
			event.$security.csp.enableSandbox();

			event.$security.ect.setEnabled( false );
			event.$security.ect.setMaxAge( 30000 );

			event.$security.hsts.setMaxAge( 300 );
			event.$security.hsts.setMaxAge( null );
			event.$security.hsts.setMaxAge( 'string' );
			event.$security.hsts.preload();
			event.$security.hsts.includeSubDomains( false );

			event.$security.build();

			event.next();
		});

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', false );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', true );

				assert.equal( response.headers['content-security-policy'], "font-src 'self' test; upgrade-insecure-requests; default-src 'self'; sandbox;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=300; preload;" );
				assert.equal( response.headers['expect-ct'], undefined );
				assert.equal( response.headers['x-content-type-options'], "nosniff" );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_securityCallingBuildMultipleTimes',
	test	: ( done ) => {
		const port	= 3373;
		const name	= 'testErSecurityWithChangesInline';
		const app	= new Server();

		app.apply( app.er_security, { csp : { xss: false } } );

		app.add(( event ) => {

			event.$security.csp.addFontSrc( 'self' );
			event.$security.csp.addFontSrc( "'self'" );
			event.$security.csp.addFontSrc( 'test' );
			event.$security.csp.upgradeInsecureRequests();
			event.$security.csp.enableSelf();
			event.$security.csp.enableSandbox();

			event.$security.ect.setEnabled( false );
			event.$security.ect.setMaxAge( 30000 );

			event.$security.hsts.setMaxAge( 300 );
			event.$security.hsts.setMaxAge( null );
			event.$security.hsts.setMaxAge( 'string' );
			event.$security.hsts.preload();
			event.$security.hsts.includeSubDomains( false );

			event.$security.build();
			event.$security.build();
			event.$security.build();

			event.next();
		});

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', false );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', true );

				assert.equal( response.headers['content-security-policy'], "font-src 'self' test; upgrade-insecure-requests; default-src 'self'; sandbox;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=300; preload;" );
				assert.equal( response.headers['expect-ct'], undefined );
				assert.equal( response.headers['x-content-type-options'], "nosniff" );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.er_securityCallingBuildMultipleTimesAppliesChangesIfAny',
	test	: ( done ) => {
		const port	= 3374;
		const name	= 'testErSecurityWithChangesInline';
		const app	= new Server();

		app.apply( app.er_security, { csp : { xss: false } } );

		app.add(( event ) => {

			event.$security.csp.addFontSrc( 'self' );
			event.$security.csp.addFontSrc( "'self'" );
			event.$security.csp.addFontSrc( 'test' );
			event.$security.csp.upgradeInsecureRequests();
			event.$security.csp.enableSelf();
			event.$security.csp.enableSandbox();

			event.$security.ect.setEnabled( false );
			event.$security.ect.setMaxAge( 30000 );

			event.$security.hsts.setMaxAge( 300 );
			event.$security.hsts.setMaxAge( null );
			event.$security.hsts.setMaxAge( 'string' );
			event.$security.hsts.preload();
			event.$security.hsts.includeSubDomains( false );

			event.$security.build();

			event.$security.csp.addScriptSrc( 'test' );
			event.$security.cto.setEnabled( false );

			event.$security.build();

			event.next();
		});

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		app.listen( port, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, port ).then( ( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( typeof response.headers['content-security-policy'] === 'string', true );
				assert.equal( typeof response.headers['strict-transport-security'] === 'string', true );
				assert.equal( typeof response.headers['expect-ct'] === 'string', false );
				assert.equal( typeof response.headers['x-content-type-options'] === 'string', false );

				assert.equal( response.headers['content-security-policy'], "font-src 'self' test; upgrade-insecure-requests; default-src 'self'; sandbox; script-src test;" );

				assert.equal( response.headers['strict-transport-security'], "max-age=300; preload;" );
				assert.equal( response.headers['expect-ct'], undefined );
				assert.equal( response.headers['x-content-type-options'], undefined );

				done();
			}).catch( done );
		});
	}
});