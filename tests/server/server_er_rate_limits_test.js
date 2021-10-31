const { assert, test, helpers }	= require( '../test_helper' );
const RateLimitsPlugin			= require( './../../server/plugins/available_plugins/rate_limits_plugin' );
const path						= require( 'path' );
const { App, Server }			= require( './../../index' );
const fs						= require( 'fs' );
const DataServer				= require( './../../server/components/caching/data_server_map' );
const DataServerMap				= require( './../../server/components/caching/data_server_map' );
const app						= App();

test({
	message	: 'Server.test.er_rate_limits.does.not.die.without.any.parameters',
	test	: ( done ) => {
		const name			= 'testErRateLimitsDoesNotDie';
		const fileLocation	= path.join( __dirname, './../../rate_limits.json' );

		const app			= new Server();

		app.apply( app.er_rate_limits, {} );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		const server	= app.listen( 3334, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 3334 ).then(( response ) => {
				server.close();
				assert.equal( response.body.toString(), name );
				assert.equal( fs.existsSync( fileLocation ), false );
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.rules.in.an.array.instead.of.json',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithRulesInAnArray';

		const app	= new Server();

		const rule	= {
			"path":`/${name}`,
			"methods":['GET'],
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict',
			"delayTime": 3,
			"delayRetries": 5,
			"stopPropagation": false,
			"ipLimit": false
		};

		app.apply( app.er_rate_limits, { rules: [rule] } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		const server	= app.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				setTimeout(() => {
					server.close();
					assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
					assert.equal( response.body.toString(), '{"error":{"code":"app.er.rateLimits.tooManyRequests"}}' );
					done();
				}, 200 );
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.validate.rule.if.rule.is.invalid',
	test	: ( done ) => {
		const app	= new Server();

		assert.throws(() => {
			app.er_rate_limits.validateRule( {} );
		});

		done();
	}
});

test({
	message	: 'Server.test.er_rate_limits.validate.rule.if.connection_delay_rule.is.invalid',
	test	: ( done ) => {
		const app	= new Server();

		assert.throws(() => {
			app.er_rate_limits.validateRule( {
				path: '',
				methods: [],
				maxAmount: 10000,
				refillTime: 10,
				refillAmount: 1000,
				policy: 'connection_delay',
				delayTime: 3,
				stopPropagation: false,
				ipLimit: false
			} );
		});

		assert.throws(() => {
			app.er_rate_limits.validateRule( {
				path: '',
				methods: [],
				maxAmount: 10000,
				refillTime: 10,
				refillAmount: 1000,
				policy: 'connection_delay',
				delayRetries: 3,
				stopPropagation: false,
				ipLimit: false
			} );
		});

		done();
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.dynamic.middleware.xxx',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithDynamicGlobalMiddleware';

		const app	= new Server();

		const rule	= {
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict',
			"delayTime": 3,
			"delayRetries": 5
		};

		app.get( `/${name}`, app.er_rate_limits.rateLimit( rule ), ( event ) => {
			event.send( name );
		});

		const server	= app.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				server.close();
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), '{"error":{"code":"app.er.rateLimits.tooManyRequests"}}' );
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.dynamic.middleware.when.request.is.finished',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithDynamicGlobalMiddleware';
		const app			= new Server();

		const rule			= {
			"maxAmount":0,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict'
		};

		app.get( `/${name}`, async ( event ) => {
			event.finished	= true;

			// This never gets rate limited
			await app.er_rate_limits.rateLimit( rule )( event );

			setTimeout(() => {
				event.finished	= false;
				event.send( name );
			}, 100 );
		});

		app.listen( 4340, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4340, name ).then(() => {
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.two.dynamic.middlewares',
	test	: ( done ) => {
		const name		= 'testErRateLimitsWithTwoDynamicGlobalMiddleware';

		const app		= new Server();

		const rule		= {
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict'
		};

		const ruleTwo	= {
			"maxAmount":0,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'permissive'
		};

		app.get( `/${name}`, [
			app.er_rate_limits.rateLimit( ruleTwo ),
			app.er_rate_limits.rateLimit( rule ),
		], ( event ) => {
			assert.deepStrictEqual( event.rateLimited, true );
			event.send( name );
		} );

		const server	= app.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				server.close();
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), '{"error":{"code":"app.er.rateLimits.tooManyRequests"}}' );
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.dynamic.middleware.ignores.path.and.methods',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithDynamicGlobalMiddlewareIgnoresPathAndMethods';

		const app	= new Server();

		const rule	= {
			"path": ['wrong', 123],
			"methods": 123,
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict',
			"delayTime": 3,
			"delayRetries": 5,
			"stopPropagation": false,
			"ipLimit": false
		};

		app.apply( app.er_rate_limits );

		app.get( `/${name}`, app.getPlugin( app.er_rate_limits ).rateLimit( rule ), ( event ) => {
			event.send( name );
		} );

		const server	= app.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				server.close();
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), '{"error":{"code":"app.er.rateLimits.tooManyRequests"}}' );
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.bucket.works.cross.apps',
	test	: ( done ) => {
		const dataStore	= new DataServer( { persist: false, ttl: 90000 } );

		const appOne	= new Server();
		const appTwo	= new Server();

		const name		= 'testErRateLimitsBucketWorksCrossApps';
		const rules		= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		appOne.apply( new RateLimitsPlugin( 'rate_limits' ), { rules, dataStore } );
		appTwo.apply( new RateLimitsPlugin( 'rate_limits' ), { rules, dataStore } );

		appOne.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		appTwo.get( `/${name}`, ( event ) => {
			event.send( name );
		});

		const serverOne	= appOne.listen( 3360 );
		const serverTwo	= appTwo.listen( 3361 );

		setTimeout(() => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 3360 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 3361 );
			}).then(( response ) => {
				serverOne.close();
				serverTwo.close();
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), JSON.stringify( { error: { code: 'app.er.rateLimits.tooManyRequests' } } ) );
				done();
			}).catch( done );
		}, 100 );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.dynamic.middleware.with.data.server.map',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithDynamicGlobalMiddleware';

		const app	= new Server();

		const rule	= {
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict',
			"delayTime": 3,
			"delayRetries": 5
		};

		app.er_rate_limits.dataStore	= new DataServerMap( { persist: false } );

		app.get( `/${name}`, app.er_rate_limits.rateLimit( rule ), ( event ) => {
			event.send( name );
		});

		const server	= app.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				server.close();
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), '{"error":{"code":"app.er.rateLimits.tooManyRequests"}}' );
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.dynamic.middleware.with.data.server.big.map',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithDynamicGlobalMiddleware';

		const app	= new Server();

		const rule	= {
			"maxAmount":1,
			"refillTime":100,
			"refillAmount":1,
			"policy": 'strict',
			"delayTime": 3,
			"delayRetries": 5
		};

		app.er_rate_limits.dataStore	= new DataServerMap( { persist: false, useBigMap: true } );

		app.get( `/${name}`, app.er_rate_limits.rateLimit( rule ), ( event ) => {
			event.send( name );
		});

		const server	= app.listen( 4001, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4001 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4001 );
			}).then(( response ) => {
				server.close();
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), '{"error":{"code":"app.er.rateLimits.tooManyRequests"}}' );
				done();
			}).catch( done );
		} );
	}
});

test({
	message	: 'Server.test.er_rate_limits.bucket.works.cross.apps.with.data.server.map',
	test	: ( done ) => {
		const dataStore	= new DataServerMap( { persist: false, ttl : 90000 } );

		const appOne	= new Server();
		const appTwo	= new Server();

		const name		= 'testErRateLimitsBucketWorksCrossApps';
		const rules		= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		appOne.apply( new RateLimitsPlugin( 'rate_limits' ), { rules, dataStore } );
		appTwo.apply( new RateLimitsPlugin( 'rate_limits' ), { rules, dataStore } );

		appOne.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		appTwo.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		appOne.listen( 3360 );
		appTwo.listen( 3361 );

		setTimeout(() => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 3360 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 3361 );
			}).then(( response ) => {
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
				done();
			}).catch( done );
		}, 100 );
	}
});

test({
	message	: 'Server.test.er_rate_limits.bucket.works.cross.apps.with.data.server.big.map',
	test	: ( done ) => {
		const dataStore	= new DataServerMap( { persist: false, ttl : 90000, useBigMap: true } );

		const appOne	= new Server();
		const appTwo	= new Server();

		const name		= 'testErRateLimitsBucketWorksCrossApps';
		const rules		= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		appOne.apply( new RateLimitsPlugin( 'rate_limits' ), { rules, dataStore } );
		appTwo.apply( new RateLimitsPlugin( 'rate_limits' ), { rules, dataStore } );

		appOne.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		appTwo.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		appOne.listen( 4800 );
		appTwo.listen( 4801 );

		setTimeout(() => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4800 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429, '', {}, 4801 );
			}).then(( response ) => {
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
				done();
			}).catch( done );
		}, 100 );
	}
});

test({
	message	: 'Server.test er_rate_limits.with.params',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithParams';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}/:test:`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}/testTwo`, 'GET', 200, '', {} ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}/testTwo`, 'GET', 429, '', {} );
		}).then( () => { done(); } ).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.permissive.limiting',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithPermissiveLimiting';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );
		let called	= 0;

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			called ++;

			if ( called > 1 )
				assert.equal( event.rateLimited, true );
			else
				assert.equal( event.rateLimited, false );

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.permissive.limiting.refills',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithPermissiveLimitingRefills';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			assert.equal( event.rateLimited, false );
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			setTimeout(() => {
				helpers.sendServerRequest( `/${name}` ).then(( response ) => {
					assert.equal( response.body.toString(), name );
					done();
				}).catch( done )
			}, 1000 );
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.connection.delay.policy.limiting',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithConnectionDelayPolicy';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );
		const now	= Math.floor( new Date().getTime() / 1000 );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			assert.equal( ( Math.floor( new Date().getTime() / 1000 ) - now ) >= 2, true );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.two.connection.delay.policy.limiting',
	test	: ( done ) => {
		const name			= 'testErRateLimitsWithTwoConnectionDelayPolicy';
		const now			= Math.floor( new Date().getTime() / 1000 );
		const app			= new Server();

		app.apply( app.er_rate_limits, { rules: [
					{
						"path": "/testErRateLimitsWithTwoConnectionDelayPolicy",
						"methods": [],
						"maxAmount": 1,
						"refillTime": 1,
						"refillAmount": 1,
						"policy": "connection_delay",
						"delayTime": 1,
						"delayRetries": 10,
						"stopPropagation": false,
						"ipLimit": false
					},
					{
						path: /\/[\S]+/,
						"methods": [],
						"maxAmount": 1,
						"refillTime": 3,
						"refillAmount": 1,
						"policy": "connection_delay",
						"delayTime": 1,
						"delayRetries": 10,
						"stopPropagation": false,
						"ipLimit": false
					}
				]
			}
		);

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		app.listen( 4350, () => {
			helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4350 ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 200, '', {}, 4350 );
			}).then(( response ) => {
				assert.equal( response.body.toString(), name );
				assert.equal( ( Math.floor( new Date().getTime() / 1000 ) - now ) >= 3, true );

				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.strict.policy',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithStrictPolicy';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
			assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limitsSTRESS.with.strict.policy.STRESS',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithStrictPolicyStress';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		const promises	= [];

		for ( let i = 0; i < 100; i ++ )
			promises.push( helpers.sendServerRequest( `/${name}` ) );

		setTimeout(() => {
			for ( let i = 0; i < 50; i ++ )
				promises.push( helpers.sendServerRequest( `/${name}` ) );

			Promise.all( promises).then(() => {
				done();
			}).catch( done );
		}, 5000 );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.specified.methods.matches',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithStrictPolicyWithSpecifiedMethods';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
			assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.multiple.specified.methods.matches',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithStrictPolicyWithMultipleSpecifiedMethods';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
			assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.specified.methods.does.not.match.if.method.is.not.the.same',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithStrictPolicyWithSpecifiedMethodsThatDoNotMatch';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.stopPropagation',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithPropagation';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );
		let called	= 0;

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			called ++;

			if ( called > 1 )
			{
				assert.equal( event.rateLimited, true );
			}
			else
			{
				assert.equal( event.rateLimited, false );
			}

			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 200 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.multiple.rules',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithMultipleRules';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
			assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.strict.overrides.connection.delay',
	test	: ( done ) => {
		const name	= 'testErRateLimitsStrictOverridesConnectionDelayPolicy';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
			assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.connection.delay.overrides.permissive',
	test	: ( done ) => {
		const name	= 'testErRateLimitsConnectionDelayOverridesPermissivePolicy';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}` );
		}).then(( response ) => {
			assert.equal( response.body.toString(), name );

			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.connection.delay.returns.429.if.no.more.retries',
	test	: ( done ) => {
		const name	= 'testErRateLimitsConnectionDelayReturns429IfNoMoreRetries';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			event.send( name );
		} );

		helpers.sendServerRequest( `/${name}` ).then(( response ) => {
			return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
		}).then(( response ) => {
			assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
			done();
		}).catch( done );
	}
});

test({
	message	: 'Server.test.er_rate_limits.with.strict.policy.with.ip.limit',
	test	: ( done ) => {
		const name	= 'testErRateLimitsWithStrictPolicyWithIpLimit';
		const rules	= JSON.parse( fs.readFileSync( path.join( __dirname, './fixture/rate_limits.json' ) ).toString() );

		if ( ! app.hasPlugin( app.er_rate_limits ) )
			app.apply( app.er_rate_limits, { rules } );

		app.get( `/${name}`, ( event ) => {
			try
			{
				assert.notEqual(
					app.getPlugin( app.er_rate_limits ).dataStore.server['$LB:/testErRateLimitsWithStrictPolicyWithIpLimitstrict::ffff:127.0.0.1//value'],
					`/${name}` )
				;
			}
			catch ( e )
			{
				return done( 'er_rate_limits with ip limit did not return as expected' );
			}

			event.send( name );
		} );

		setTimeout(() => {
			helpers.sendServerRequest( `/${name}` ).then(( response ) => {
				return helpers.sendServerRequest( `/${name}`, 'GET', 429 );
			}).then(( response ) => {
				assert.deepStrictEqual( typeof response.headers['retry-after'], 'string' );
				assert.equal( response.body.toString(), JSON.stringify( { error: { code : 'app.er.rateLimits.tooManyRequests' } } ) );
				done();
			}).catch( done );
		}, 50 );
	}
});