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

			server.exit().then( done ).catch( done );
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

				server.exit().then( done ).catch( done );
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

				server.exit().then( done ).catch( done );
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

					server.exit().then( done ).catch( done );
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

				server.exit().then( done ).catch( done );
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

					server.exit().then( done ).catch( done );
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

				server.exit().then( done ).catch( done );
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

					server.exit().then( done ).catch( done );
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

				server.exit().then( done ).catch( done );
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
					assert.equal( 1, Object.keys( process.dataServer.timeouts ).length );

					server.exit().then( done ).catch( done );
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

						server.exit().then( done ).catch( done );
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

							server.exit().then( done ).catch( done );
						}, ttl * 3 );
					} ).catch( done );
				} ).catch( done );
			}).catch( done )
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.exists if record exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';
		let recordData	= { key: 'test' };
		let ttl			= 100;

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then( ()=>{
				server.create( namespace, recordName, recordData, { ttl } ).then( ()=>{
					server.exists( namespace, recordName ).then( ( exists )=>{
						assert.equal( true, exists );

						server.exit().then( done ).catch( done );
					}).catch( done );
				} ).catch( done );
			}).catch( done )
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.exists if record does not exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then( ()=>{
				server.exists( namespace, recordName ).then( ( exists )=>{
					assert.equal( false, exists );

					server.exit().then( done ).catch( done );
				}).catch( done );
			}).catch( done )
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.exists if namespace does not exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';

		server.setUp().then(()=>{
			server.exists( namespace, recordName ).then( ( exists )=>{
				assert.equal( false, exists );

				server.exit().then( done ).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.getAll if namespace does not exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';

		server.setUp().then(()=>{
			server.getAll( namespace, recordName ).then( ()=> done( 'Namespace exists but it shouldn\'t' ) ).catch( ( err )=>{
				assert.equal( true, err !== false );

				server.exit().then( done ).catch( done );
			} );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.getAll if namespace exists',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';
		let recordData		= { key: 'value' };

		let expectedData	= {
			[recordName]	: recordData
		};

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.create( namespace, recordName, recordData ).then(()=>{
					server.getAll( namespace, recordName ).then( ( data )=>{
						assert.deepStrictEqual( expectedData, data );

						server.exit().then( done ).catch( done );
					} ).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.read if record exists',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';
		let recordData		= { key: 'value' };

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.create( namespace, recordName, recordData ).then(()=>{
					server.read( namespace, recordName ).then(( data )=>{
						assert.deepStrictEqual( recordData, data );

						server.exit().then( done ).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.read if record does not exist',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.read( namespace, recordName ).then( ( record )=>{
					assert.equal( null, record );

					server.exit().then( done ).catch( done );
				} ).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.read if namespace does not exist',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';

		server.setUp().then(()=>{
			server.read( namespace, recordName ).then( ( record )=>{
				assert.equal( null, record );

				server.exit().then( done ).catch( done );
			} ).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.touch if record exists',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';
		let recordData		= { key: 'value' };

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.create( namespace, recordName, recordData ).then(()=>{
					server.touch( namespace, recordName ).then(()=>{
						assert.deepStrictEqual( process.dataServer.data[namespace][recordName], recordData );

						server.exit().then( done ).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.touch if record does not exists',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.touch( namespace, recordName ).then(()=> done( 'Record exists but it should not' ) ).catch( ( err )=>{
					assert.equal( true, err !== false );

					server.exit().then( done ).catch( done );
				} );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.touch if namespace does not exists',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';

		server.setUp().then(()=>{
			server.touch( namespace, recordName ).then(()=> done( 'Record exists but it should not' ) ).catch( ( err )=>{
				assert.equal( true, err !== false );

				server.exit().then( done ).catch( done );
			} );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.touch updates ttl',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';
		let recordData		= { key: 'value' };
		let ttl				= 100;

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.create( namespace, recordName, recordData ).then(()=>{
					server.touch( namespace, recordName, { ttl: ttl * 3 } ).then(()=>{
						setTimeout(()=>{
							assert.deepStrictEqual( process.dataServer.data[namespace][recordName], recordData );

							server.exit().then( done ).catch( done );
						}, ttl * 2 );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.update updates',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';
		let recordData		= { key: 'value' };
		let newRecordData	= { key: 'value2' };

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.create( namespace, recordName, recordData ).then(()=>{
					server.update( namespace, recordName, newRecordData ).then(()=>{
						assert.deepStrictEqual( process.dataServer.data[namespace][recordName], newRecordData );

						server.exit().then( done ).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.update if record does not exist',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';
		let newRecordData	= { key: 'value2' };

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.update( namespace, recordName, newRecordData ).then(()=> done( 'Record exists but it should not' )).catch( ( err )=>{
					assert.equal( true, err !== false );

					server.exit().then( done ).catch( done );
				} );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.update if namespace does not exist',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';
		let newRecordData	= { key: 'value2' };

		server.setUp().then(()=>{
			server.update( namespace, recordName, newRecordData ).then(()=> done( 'Record exists but it should not' )).catch( ( err )=>{
				assert.equal( true, err !== false );

				server.exit().then( done ).catch( done );
			} );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.update updates ttl',
	test	: ( done )=>{
		let server			= new InMemoryDataServer();
		let namespace		= 'testNamespace';
		let recordName		= 'testRecord';
		let recordData		= { key: 'value' };
		let newRecordData	= { key: 'value2' };
		let ttl				= 100;

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				server.create( namespace, recordName, recordData ).then(()=>{
					server.update( namespace, recordName, newRecordData, { ttl: ttl * 3 } ).then(()=>{
						setTimeout(()=>{
							assert.deepStrictEqual( process.dataServer.data[namespace][recordName], newRecordData );

							server.exit().then( done ).catch( done );
						}, ttl * 2 );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.delete if record exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';
		let recordData	= { key: 'test' };

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then( ()=>{
				server.create( namespace, recordName, recordData ).then( ()=>{
					server.delete( namespace, recordName ).then(()=>{
						assert.equal( true, typeof process.dataServer.data[namespace][recordName] === 'undefined' );
						assert.equal( 0, Object.keys( process.dataServer.timeouts ).length );

						server.exit().then( done ).catch( done );
					}).catch( done );
				} ).catch( done );
			}).catch( done )
		}).catch( done );
	}
});

test({
	message	: 'InMemoryDataServer.delete if record does not exists',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();
		let namespace	= 'testNamespace';
		let recordName	= 'testRecord';

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then( ()=>{
				server.delete( namespace, recordName ).then(()=> done( 'Record was deleted but it should not have, it does not exist' ) ).catch( ( err )=>{
					assert.equal( true, typeof process.dataServer.data[namespace][recordName] === 'undefined' );
					assert.equal( 0, Object.keys( process.dataServer.timeouts ).length );
					assert.equal( true, err !== false );

					server.exit().then( done ).catch( done );
				} );
			}).catch( done )
		}).catch( done );
	}
});


test({
	message	: 'InMemoryDataServer.exit exits',
	test	: ( done )=>{
		let server		= new InMemoryDataServer();

		server.setUp().then(()=>{
			server.exit().then(()=>{
				assert.equal( 'undefined', typeof process.dataServer );
				assert.equal( SERVER_STATES.stopped, server.getServerState() );

				done();
			}).catch( done );
		}).catch( done );
	}
});
