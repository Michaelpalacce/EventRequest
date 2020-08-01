const { assert, test, helpers }	= require( '../test_helper' );
const path						= require( 'path' );
const { App, Server }			= require( './../../index' );
const fs						= require( 'fs' );
const app						= App();

test({
	message	: 'Server.test.er_templating_engine.attaches.a.render.function.that.fetches.files',
	test	: ( done ) => {
		const name			= 'testTemplatingEngine';
		const deepName		= 'testTemplatingEngineDeep';
		const templateDir 	= path.join( __dirname, './fixture/templates' );
		let renderCalled	= 0;

		app.apply( app.er_templating_engine, { templateDir } );

		app.add({
			handler	: ( event ) => {
				event.on( 'render', () => {
					renderCalled++;
				} );

				event.next();
			}
		});

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

			assert.equal( renderCalled, 2 );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_templating_engine.attaches.a.render.function.that.calls.next.on.error',
	test	: ( done ) => {
		const name			= 'testTemplatingEngineFail';
		const templateDir 	= path.join( __dirname, './fixture/templates' );

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.render( 'fail' );
		} );

		helpers.sendServerRequest( `/${name}`, 'GET', 500 ).then(( response ) => {
			done();
		}).catch( done );
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
			event.render( null, {}, ( error )=>{
				event.finished	= false;
				event.send( error );
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

		app.apply( app.er_templating_engine, { templateDir } );

		app.get( `/${name}`, ( event ) => {
			event.templatingEngine	= {
				render	: () => {
					throw new Error( 'Could not render' )
				}
			}

			event.render( null, {}, ( error )=>{
				event.send( error );
			});
		});

		app.listen( 4323, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4323, '{"code":"app.err.templatingEngine.errorRendering"}' ).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});