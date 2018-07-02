'use strict';

const { Mock, assert, test, helpers, Mocker }	= require( './../../../../testing_suite' );
const MemoryDataServer							= require( './../../../../../server/components/caching/memory/memory_data_server' );
let testServer									= null;

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

			testServer.create( 'test', 'testRecord', { testKey: 'testValue' }, { ttl : 500 } ).then(()=>{
				setTimeout(()=>{
					testServer.getAll( 'test' ).then(( data )=>{
						console.log( data );
						done();
					})
				}, 500 );

				testServer.touch( 'test', 'testRecord', { ttl : 1000 } ).then().catch( done );
			}).catch( done );
		});
	}
});
