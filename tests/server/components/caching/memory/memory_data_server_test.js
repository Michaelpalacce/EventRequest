'use strict';

const { assert, test, helpers }	= require( '../../../../test_helper' );
const MemoryDataServer			= require( './../../../../../server/components/caching/memory/memory_data_server' );

let testServer					= null;

// This has to be on top
test({
	message	: 'MemoryDataServer setUp',
	test	: ( done )=>{
		testServer	= new MemoryDataServer();
		let onFulfilled	= ( data )=>{
			done();
		};

		let onRejected	= ( err )=>{
			done( err );
		};

		testServer.setUp().then( onFulfilled, onRejected );
	}
});

test({
	message	: 'MemoryDataServer.constructor does not throw',
	test	: ( done )=>{
		assert.doesNotThrow(()=>{
			new MemoryDataServer();
		});

		done();
	}
});

test({
	message	: 'MemoryDataServer.existsNamespace returns false for a namespace that does not exist',
	test	: ( done )=>{
		helpers.removeTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let onFulfilled	= ( data )=>{
				assert.equal( data, false );
				done();
			};

			testServer.existsNamespace( 'test', {} ).then( onFulfilled, done );
		});
	}
});

test({
	message	: 'MemoryDataServer.createNamespace creates a namespace',
	test	: ( done )=>{
		helpers.removeTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let onFulfilled	= ()=>{
				done();
			};

			testServer.createNamespace( 'test', {} ).then( onFulfilled, done );
		});
	}
});

test({
	message	: 'MemoryDataServer.existsNamespace returns true if namespace exists',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let onFulfilled	= ( data )=>{
				assert.equal( data, true );
				done();
			};

			testServer.existsNamespace( 'test', {} ).then( onFulfilled, done );
		});
	}
});

test({
	message	: 'MemoryDataServer.removeNamespace returns true if namespace exists',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.removeNamespace( 'test', {} ).then( ()=>{
				testServer.existsNamespace( 'test', {} ).then(( data )=>{
					assert.equal( data, false );
					done();
				}).catch( done )
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.removeNamespace returns true if namespace does not exists',
	test	: ( done )=>{
		testServer.existsNamespace( 'test', {} ).then(()=>{
			testServer.removeNamespace( 'test', {} ).then(()=>{
				done();
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'MemoryDataServer.create creates a record',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.create( 'test', 'testRecord', { testKey: 'testValue' }, { ttl: 10 } ).then(( data )=>{
				done();
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.exists returns false if record does not exist',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.exists( 'test', 'testRecord', {} ).then(( exists )=>{
				assert.equal( exists, false );
				testServer.create( 'test', 'testRecord', { testKey: 'testValue' }, { ttl : 1000 } ).then(()=>{
					testServer.exists( 'test', 'testRecord', {} ).then(( exists )=>{
						assert.equal( exists, true );
						done();
					}).catch( done );
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.create creates a record with ttl',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.create( 'test', 'testRecord', { testKey: 'testValue' }, { ttl : 1 } ).then(()=>{
				testServer.exists( 'test', 'testRecord', {} ).then(( exists )=>{
					assert.equal( exists, false );
					done();
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.touch increases ttl',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.create( 'test', 'testRecord', { testKey: 'testValue' }, { ttl : 400 } ).then(()=>{
				setTimeout(()=>{
					testServer.exists( 'test', 'testRecord' ).then(( exists )=>{
						assert.equal( exists, true );
						done();
					})
				}, 500 );

				testServer.touch( 'test', 'testRecord', { ttl : 1000 } ).then().catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.read gets data',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let dataToWrite	= { testKey: 'testValue' };

			testServer.create( 'test', 'testRecord', dataToWrite, { ttl : 1000 } ).then(()=>{
				testServer.read( 'test', 'testRecord' ).then(( data )=>{
					assert.deepStrictEqual( data, dataToWrite );
					done();
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.update updates data',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let dataToWrite		= { testKey : 'testValue' };
			let dataToUpdate	= { testKeyTwo : 'testValueTwo' };

			testServer.create( 'test', 'testRecord', dataToWrite, { ttl : 1000 } ).then(()=>{
				testServer.update( 'test', 'testRecord', dataToUpdate, { ttl : 1000 } ).then(()=>{
					testServer.read( 'test', 'testRecord' ).then(( data )=>{
						assert.deepStrictEqual( data, dataToUpdate );
						done();
					}).catch( done )
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.delete deletes data',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let dataToWrite	= { testKey : 'testValue' };

			testServer.create( 'test', 'testRecord', dataToWrite, { ttl : 1000 } ).then(()=>{
				testServer.delete( 'test', 'testRecord' ).then(()=>{
					testServer.exists( 'test', 'testRecord' ).then(( exists )=>{
						assert.equal( exists, false );
						done();
					}).catch( done )
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.getAll returns all data',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let dataToWrite		= { testKey : 'testValue' };
			let expectedData	= { testRecord : dataToWrite };

			testServer.create( 'test', 'testRecord', dataToWrite, { ttl : 1000 } ).then(()=>{
				testServer.getAll( 'test' ).then(( data )=>{
					assert.deepStrictEqual( data, expectedData );
					done();
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.exit exits',
	test	: ( done )=>{
		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.exit().then( function( data ){
				assert.equal( data, 'ok' );
				done();
			}).catch( done );
		});
	}
});
