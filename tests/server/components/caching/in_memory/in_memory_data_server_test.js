'use strict';

const { Mock, assert, test, Mocker }	= require( '../../../../test_helper' );
const InMemoryDataServer				= require( './../../../../../server/components/caching/in_memory/in_memory_data_server' );
const { SERVER_STATES }					= require( './../../../../../server/components/caching/data_server' );

test({
	message	: 'InMemoryDataServer.constructor on default',
	test	: ( done )=>{
		assert.doesNotThrow(()=>{
			new InMemoryDataServer();
		});

		done();
	}
});

test({
	message	: 'InMemoryDataServer.setUp sets up the server',
	test	: ( done )=>{
		let server	= new InMemoryDataServer();

		server.setUp().then(()=>{
			assert.equal( 'object', typeof process.dataServer );
			assert.equal( 'object', typeof process.dataServer.data );
			assert.equal( 'object', typeof process.dataServer.timeouts );
			assert.equal( SERVER_STATES.running, server.getServerState() );

			delete process.dataServer;

			done();
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.setUp twice does not throw',
	test	: ( done )=>{
		let server	= new InMemoryDataServer();

		server.setUp().then(()=>{
			server.setUp().then(()=>{
				assert.equal( 'object', typeof process.dataServer );
				assert.equal( 'object', typeof process.dataServer.data );
				assert.equal( 'object', typeof process.dataServer.timeouts );
				assert.equal( SERVER_STATES.running, server.getServerState() );

				delete process.dataServer;

				done();
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.createNamespace',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				assert.equal( 'object', typeof process.dataServer.data[namespace] );

				delete process.dataServer;

				done();
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.createNamespace if namespace exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.createNamespace( namespace ).then( () =>
					done( 'createNamespace should have been rejected the second time' )
				).catch( ( err )=>{
					assert.equal( true, err !== false );

					delete process.dataServer;

					done();
				} );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.existsNamespace if namespace does not exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		server.setUp().then(()=>{
			server.existsNamespace( namespace ).then( ( exists )=>{
				assert.equal( exists, false );

				delete process.dataServer;

				done();
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.existsNamespace if namespace exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.existsNamespace( namespace ).then( ( exists )=>{
					assert.equal( exists, true );

					delete process.dataServer;

					done();
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.removeNamespace if namespace does not exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		server.setUp().then(()=>{
			server.removeNamespace( namespace ).then( ()=> done( 'removeNamespace should have rejected' ) ).catch( ( err )=>{
				assert.equal( true, err !== false );

				delete process.dataServer;

				done();
			} );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.removeNamespace if namespace exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.removeNamespace( namespace ).then( ( error )=>{
					assert.equal( false, error );
					assert.equal( true, typeof process.dataServer.data[namespace] === 'undefined' );

					delete process.dataServer;

					done();
				} ).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.create if namespace does not exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';
		let recordData	= { key: 'test' };

		server.setUp().then(()=>{
			server.create( namespace, recordName, recordData ).then( ()=> done( 'create should have been rejected' ) ).catch(( err )=>{
				assert.equal( true, err !== false );

				delete process.dataServer;

				done();
			});
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.create if namespace exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';
		let recordData	= { key: 'test' };

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then( ()=>{
				server.create( namespace, recordName, recordData ).then( ()=>{
					assert.equal( 'object', typeof process.dataServer.data[namespace][recordName] );

					delete process.dataServer;

					done();
				} ).catch( done );
			}).catch( done )
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.create adds timeout and times out',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';
		let recordData	= { key: 'test' };
		let ttl			= 100;

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then( ()=>{
				server.create( namespace, recordName, recordData, { ttl } ).then( ()=>{
					assert.equal( 'object', typeof process.dataServer.data[namespace][recordName] );

					setTimeout(()=>{
						assert.equal( 'undefined', typeof process.dataServer.data[namespace][recordName] );

						delete process.dataServer;

						done();
					}, ttl * 2);
				} ).catch( done );
			}).catch( done )
		}).catch( done );
	}
});
test({
	message	: 'InMemoryDataServer.create twice extends timeout',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';
		let recordData	= { key: 'test' };
		let ttl			= 100;

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then( ()=>{
				server.create( namespace, recordName, recordData, { ttl } ).then( ()=>{
					assert.equal( 'object', typeof process.dataServer.data[namespace][recordName] );

					server.create( namespace, recordName, recordData, { ttl: ttl * 2 } ).then( ()=>{
						assert.equal( 'object', typeof process.dataServer.data[namespace][recordName] );

						setTimeout(()=>{ assert.equal( 'object', typeof process.dataServer.data[namespace][recordName] ); }, ttl + 10 );

						setTimeout(()=>{
							assert.equal( 'undefined', typeof process.dataServer.data[namespace][recordName] );

							delete process.dataServer;

							done();
						}, ttl * 3 );

					} ).catch( done );
				} ).catch( done );
			}).catch( done )
		}).catch( done );
	}
});
