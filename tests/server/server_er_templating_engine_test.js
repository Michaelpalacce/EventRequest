const TemplatingEngine			= require( '../../server/components/templating_engine/experimental_templating_engine' );
const templatingEngine			= new TemplatingEngine();
const { assert, test, helpers }	= require( '../test_helper' );
const path						= require( 'path' );
const { App, Server }			= require( './../../server/index' );
const fs						= require( 'fs' );
const app						= App();

test({
	message	: 'Server.test.er_templating_engine.attaches.a.render.function.that.fetches.files',
	test	: ( done ) => {
		const name			= 'testTemplatingEngine';
		const deepName		= 'testTemplatingEngineDeep';

		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.render( 'index' );
		} );

		app.get( `/${deepName}`, ( event ) => {
			event.render( 'deep/directory/structure/file' );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString().includes( 'THIS_IS_THE_INDEX_HTML_FILE' ), true );
			assert.equal( response.headers['content-type'], 'text/html' );

			return helpers.sendServerRequest( `/${deepName}` );
		}).then(( response ) => {
			assert.equal( response.body.toString().includes( 'THIS_IS_THE_DEEP_HTML_FILE' ), true );
			assert.equal( response.headers['content-type'], 'text/html' );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_templating_engine.with.custom.ext',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineCustomExt';
		const app			= new Server();
		const templateDir	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir, templateExtension: 'customext' } );

		app.get( `/${name}`, ( event ) => {
			event.render( 'index' );
		} );

		app.listen( 4326, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4326 ).then(( response ) => {
				assert.equal( response.body.toString().includes( 'THIS_IS_THE_CUSTOM_INDEX_HTML_FILE' ), true );
				assert.equal( response.headers['content-type'], 'text/html' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_templating_engine.with.secondary.templating.engine',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineSecondaryTemplatingEngine';
		const app			= new Server();
		const templateDir	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir, render: templatingEngine.renderFile.bind( templatingEngine ) } );

		app.get( `/${name}`, ( event ) => {
			event.render( 'custom_templating_engine',
				{
					XSS_ATTEMPT: '<script\x0Ctype="text/javascript">javascript:alert(1);</script>\n',
					test: 'TEST VARIABLE',
					testSwitch: '1',
					test1: 'SWITCH!!',
					testSwitch2: '1',
					testSwitch2Var: 'SHOULD NOT BE THERE'
				}
				);
		} );

		app.listen( 4327, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4327 ).then(( response ) => {
				assert.equal( response.body.toString().includes( 'TEST VARIABLE' ), true );
				assert.equal( response.body.toString().includes( '&lt;script' ), true );
				assert.equal( response.body.toString().includes( '${test}' ), true );
				assert.equal( response.body.toString().includes( 'SWITCH!!' ), true );
				assert.equal( response.body.toString().includes( 'NEW VARIABLE' ), true );
				assert.equal( response.body.toString().includes( 'SHOULD NOT BE THERE' ), false );
				assert.equal( response.headers['content-type'], 'text/html' );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_templating_engine.with.no.template.name.passed.gets.the.index.html',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const app			= new Server();
		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.render();
		});

		app.listen( 4321, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4321 ).then(( response ) => {
				assert.deepStrictEqual( response.body.toString(), fs.readFileSync( path.join( templateDir, 'index.html' ) ).toString() );
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_templating_engine.with.no.templateDir.uses.root.public.by.default',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const app			= new Server();
		const templateDir 	= path.join( __dirname, '../../public/test' );

		app.apply( app.er_templating_engine );

		app.get( `/${name}`, ( event ) => {
			event.render( '/test/index' );
		});

		app.listen( 4325, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4325 ).then(( response ) => {
				assert.deepStrictEqual( response.body.toString(), fs.readFileSync( path.join( templateDir, 'index.html' ) ).toString() );
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_templating_engine.render.when.is.finished',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const app			= new Server();
		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.finished	= true;
			event.render( null, {} ).catch( ( err ) => {
				event.finished	= false;
				event.send( err );
			});
		});

		app.listen( 4322, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4322, '{"code":"app.err.templatingEngine.errorRendering"}' ).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_templating_engine.render.when.templating.engine.rejects',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const app			= new Server();
		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply(
			app.er_templating_engine,
			{
				templateDir,
				render: ()=>{
					return new Promise (( resolve, reject ) => {
						reject( 'error' );
					});
				}
			}
		);

		app.get( `/${name}`, ( event ) => {
			event.render( null, {} ).catch( ( err ) => {
				event.send( err );
			} );
		});

		app.listen( 4323, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4323, 'error' ).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});
