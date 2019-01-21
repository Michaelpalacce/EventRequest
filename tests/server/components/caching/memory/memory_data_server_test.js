'use strict';

const { assert, test, helpers }	= require( '../../../../test_helper' );
const MemoryDataServer			= require( './../../../../../server/components/caching/memory/memory_data_server' );

let testServer					= null;

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
		let testServer	= new MemoryDataServer();

		helpers.removeTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.existsNamespace( 'test' ).then( ( data, aatt )=>{
				assert.equal( data, false );
				testServer.exit().then( done ).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.createNamespace creates a namespace',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

		helpers.removeTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let onFulfilled	= ()=>{
				testServer.exit().then( done ).catch( done );
			};

			testServer.createNamespace( 'test' ).then( onFulfilled, done );
		});
	}
});

test({
	message	: 'MemoryDataServer.existsNamespace returns true if namespace exists',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			let onFulfilled	= ( data )=>{
				assert.equal( data, true );

				testServer.exit().then( done ).catch( done );
			};

			testServer.existsNamespace( 'test' ).then( onFulfilled, done );
		});
	}
});

test({
	message	: 'MemoryDataServer.removeNamespace returns false if namespace does not exists',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.removeNamespace( 'test', {} ).then( ()=>{
				testServer.existsNamespace( 'test', {} ).then(( data )=>{
					assert.equal( data, false );
					testServer.exit().then( done ).catch( ()=>{
						done( 'Error' );
					} );
				}).catch( done )
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.removeNamespace returns true if namespace does not exists',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

		testServer.setUp().then(()=>{
			testServer.existsNamespace( 'test' ).then(()=>{
				testServer.removeNamespace( 'test' ).then(()=>{
					testServer.exit().then( done ).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message	: 'MemoryDataServer.create creates a record',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.create( 'test', 'testRecord', { testKey: 'testValue' }, { ttl: 10 } ).then(( data )=>{
				testServer.exit().then( done ).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.exists returns false if record does not exist',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

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
						testServer.exit().then( done ).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.create creates a record with ttl',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.create( 'test', 'testRecord', { testKey: 'testValue' }, { ttl : 1 } ).then(()=>{
				setTimeout(()=>{
					testServer.exists( 'test', 'testRecord', {} ).then(( exists )=>{
						assert.equal( exists, false );
						testServer.exit().then( done ).catch( done );
					}).catch( done );
				}, 100 );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.touch increases ttl',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

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
						testServer.exit().then( done ).catch( done );
					}).catch( done );
				}, 500 );

				testServer.touch( 'test', 'testRecord', { ttl : 1000 } ).then().catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.read gets data',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

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
					testServer.exit().then( done ).catch( done );
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.update updates data',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

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
						testServer.exit().then( done ).catch( done );
					}).catch( done )
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.delete deletes data',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

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
						testServer.exit().then( done ).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.getAll returns all data',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

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
					testServer.exit().then( done ).catch( done );
				}).catch( done );
			}).catch( done );
		});
	}
});

test({
	message	: 'MemoryDataServer.exit exits',
	test	: ( done )=>{
		let testServer	= new MemoryDataServer();

		helpers.setUpTestNamespace( testServer, ( err )=>{
			if ( err )
			{
				done( err );
				return;
			}

			testServer.exit().then( function( data ){
				assert.equal( data, false );
				done();
			}).catch( done );
		});
	}
});
