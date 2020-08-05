const { assert, test, helpers }	= require( '../test_helper' );
const { App, Server }			= require( './../../index' );
const DataServerMap				= require( './../../server/components/caching/data_server_map' );
const app						= App();

test({
	message	: 'Server.test.er_response_cache.caches',
	test	: ( done ) => {
		const name	= 'testErResponseCacheCaches';
		let i		= 0;

		if ( ! app.hasPlugin( app.er_response_cache ) )
		{
			app.apply( app.er_data_server, { dataServer: helpers.getDataServer() } );
			app.apply( app.er_response_cache );
		}

		app.get( `/${name}`, 'cache.request', ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name );
			}

			event.sendError( 'ERROR', 501 );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );

			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_response_cache.with.map.caches',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheCaches';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, 'cache.request', ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name );
			}

			event.sendError( 'ERROR', 501 );
		} );

		app.listen( 4360, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4360, name ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4360, name );
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_response_cache.with.big.map.caches',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheCaches';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, 'cache.request', ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name );
			}

			event.sendError( 'ERROR', 501 );
		} );

		app.listen( 4382, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4382, name ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4382, name );
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.with.object',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheCachesWithObject';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: helpers.getDataServer() } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, 'cache.request', ( event ) => {
			event.on( 'cachedResponse', () => {
				event.send( 'Ok, but should not have been' );
			});

			return event.end( {} );
		});

		app.listen( 4365, () => {
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				500,
				'',
				{},
				4365,
				'{"error":{"code":"ERR_INVALID_ARG_TYPE","message":"The \\"chunk\\" argument must be of type string or an instance of Buffer. Received an instance of Object"}}'
			).then(() => {

				return helpers.sendServerRequest(
					`/${name}`,
					'GET',
					500,
					'',
					{},
					4365,
					'{"error":{"code":"ERR_INVALID_ARG_TYPE","message":"The \\"chunk\\" argument must be of type string or an instance of Buffer. Received an instance of Object"}}'
				);
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.with.object.with.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheCachesWithObject';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, 'cache.request', ( event ) => {
			event.on( 'cachedResponse', () => {
				event.send( 'Ok, but should not have been' );
			});

			return event.end( {} );
		});

		app.listen( 4366, () => {
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				500,
				'',
				{},
				4366,
				'{"error":{"code":"ERR_INVALID_ARG_TYPE","message":"The \\"chunk\\" argument must be of type string or an instance of Buffer. Received an instance of Object"}}'
			).then(() => {

				return helpers.sendServerRequest(
					`/${name}`,
					'GET',
					500,
					'',
					{},
					4366,
					'{"error":{"code":"ERR_INVALID_ARG_TYPE","message":"The \\"chunk\\" argument must be of type string or an instance of Buffer. Received an instance of Object"}}'
				);
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.with.object.with.big.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheCachesWithObject';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false, useBigMap: true } ) } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, 'cache.request', ( event ) => {
			event.on( 'cachedResponse', () => {
				event.send( 'Ok, but should not have been' );
			});

			return event.end( {} );
		});

		app.listen( 4367, () => {
			helpers.sendServerRequest(
				`/${name}`,
				'GET',
				500,
				'',
				{},
				4367,
				'{"error":{"code":"ERR_INVALID_ARG_TYPE","message":"The \\"chunk\\" argument must be of type string or an instance of Buffer. Received an instance of Object"}}'
			).then(() => {

				return helpers.sendServerRequest(
					`/${name}`,
					'GET',
					500,
					'',
					{},
					4367,
					'{"error":{"code":"ERR_INVALID_ARG_TYPE","message":"The \\"chunk\\" argument must be of type string or an instance of Buffer. Received an instance of Object"}}'
				);
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.if.not.needed',
	test	: ( done ) => {
		const name	= 'testErResponseCacheDoesNotCacheEverything';
		let i		= 0;

		if ( ! app.hasPlugin( app.er_response_cache ) )
		{
			app.apply( app.er_data_server, { dataServer: helpers.getDataServer() } );
			app.apply( app.er_response_cache );
		}

		app.get( `/${name}`, ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name );
			}

			event.sendError( 'ERROR', 501 );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );

			return helpers.sendServerRequest( `/${name}`, 'GET', 501 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: { code: 'ERROR' } } ) );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.if.not.needed.with.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheDoesNotCacheEverything';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name );
			}

			event.sendError( 'ERROR', 501 );
		} );

		app.listen( 4361, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4361, name ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 501, '', {}, 4361, JSON.stringify( { error: { code: 'ERROR' } } ) );
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.if.not.needed.with.big.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheDoesNotCacheEverything';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false, useBigMap: true } ) } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name );
			}

			event.sendError( 'ERROR', 501 );
		} );

		app.listen( 4364, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4364, name ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 501, '', {}, 4364, JSON.stringify( { error: { code: 'ERROR' } } ) );
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.raw',
	test	: ( done ) => {
		const name	= 'testErResponseCacheDoesNotCacheRaw';
		let i		= 0;

		if ( ! app.hasPlugin( app.er_response_cache ) )
		{
			app.apply( app.er_data_server, { dataServer: helpers.getDataServer() } );
			app.apply( app.er_response_cache );
		}

		app.get( `/${name}`, ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name, 200, true );
			}

			event.sendError( 'ERROR', 501 );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			assert.equal( response.body.toString(), name );

			return helpers.sendServerRequest( `/${name}`, 'GET', 501 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: { code: 'ERROR' } } ) );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.raw.with.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheDoesNotCacheRaw';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false } ) } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name, 200, true );
			}

			event.sendError( 'ERROR', 501 );
		} );

		app.listen( 4362, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4362, name ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 501, '', {}, 4362, JSON.stringify( { error: { code: 'ERROR' } } ) );
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_response_cache.does.not.cache.raw.with.big.map',
	test	: ( done ) => {
		const app	= new Server();
		const name	= 'testErResponseCacheDoesNotCacheRaw';
		let i		= 0;

		app.apply( app.er_data_server, { dataServer: new DataServerMap( { persist: false, useBigMap: true } ) } );
		app.apply( app.er_response_cache );

		app.get( `/${name}`, ( event ) => {
			if ( i === 0 )
			{
				i ++;
				return event.send( name, 200, true );
			}

			event.sendError( 'ERROR', 501 );
		} );

		app.listen( 4363, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4363, name ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 501, '', {}, 4363, JSON.stringify( { error: { code: 'ERROR' } } ) );
			}).then(( response ) => {
				done();
			}).catch( done );
		});
	}
});
