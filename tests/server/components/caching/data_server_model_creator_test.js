'use strict';

const { Mock, assert, test, Mocker }	= require( '../../../test_helper' );
const { DataServer, SERVER_STATES }		= require( './../../../../server/components/caching/data_server' );
const InMemoryDataServer				= require( './../../../../server/components/caching/in_memory/in_memory_data_server' );
const MemoryDataServer					= require( './../../../../server/components/caching/memory/memory_data_server' );

const TEST_SUITE_DATA_PROVIDER	= [[InMemoryDataServer], [MemoryDataServer]];

test({
	message			: 'DataServerModel create model from data server',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server		= new ServerClass();
		let namespace	= 'Test';

		let model		= server.model( namespace );

		assert.equal( true, typeof model === 'function' );

		done();
	}
});

test({
	message			: 'DataServerModel.constructor on defaults',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server		= new ServerClass();
		let namespace	= 'Test';

		let ModelClass	= server.model( namespace );
		let model		= new ModelClass();

		assert.deepStrictEqual( '', model.recordName );
		assert.deepStrictEqual( {}, model.recordData );
		assert.deepStrictEqual( {}, model.recordOptions );

		done();
	}
});

test({
	message			: 'DataServerModel.constructor on custom',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= { ttl: 50 };

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		assert.deepStrictEqual( recordName, model.recordName );
		assert.deepStrictEqual( recordData, model.recordData );
		assert.deepStrictEqual( recordOptions, model.recordOptions );

		done();
	}
});

test({
	message			: 'DataServerModel.getDataServer returns an instance of DataServer',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= { ttl: 50 };

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		assert.deepStrictEqual( recordName, model.recordName );
		assert.deepStrictEqual( recordData, model.recordData );
		assert.deepStrictEqual( recordOptions, model.recordOptions );

		done();
	}
});

test({
	message			: 'DataServerModel.save saves the record',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= { ttl: 0 };

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespaceIfNotExists().then(()=>{
				model.save().then(()=>{
					ModelClass.find( recordName ).then(( newRecord )=>{
						assert.deepStrictEqual( newRecord.recordName, model.recordName );
						assert.deepStrictEqual( newRecord.recordData, model.recordData );
						server.exit().then( done ).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.save saves the record with ttl',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= { ttl: 200 };

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespaceIfNotExists().then(()=>{
				model.save( recordOptions ).then(()=>{
					ModelClass.find( recordName ).then(( newRecord )=>{
						assert.equal( true, newRecord !== null );
						setTimeout(()=>{
							ModelClass.find( recordName ).then(( expiredRecord )=> {
								assert.equal( null, expiredRecord );

								server.exit().then( done ).catch( done );
							}).catch( done );
						}, 500 );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.delete delete the record',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= {};

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespaceIfNotExists().then(()=>{
				model.save( recordOptions ).then(()=>{
					model.delete().then(( err )=>{
						assert.equal( false, err );

						ModelClass.find( recordName ).then(( record )=>{
							assert.equal( null, record );

							server.exit().then( done ).catch( done );
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.delete delete the record if it does not exist',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= {};

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespaceIfNotExists().then(()=>{
				model.delete().then(()=>{
					ModelClass.find( recordName ).then(( record )=>{
						assert.equal( null, record );

						server.exit().then( done ).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.touch touches the record ttl',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= { ttl: 200 };

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespaceIfNotExists().then(()=>{
				model.save( recordOptions ).then(()=>{
					model.touch( 1000 ).then(()=>{
						setTimeout(()=>{
							ModelClass.find( recordName ).then(( record )=> {
								assert.equal( true, record !== null );

								server.exit().then( done ).catch( done );
							}).catch( done );
						}, 500 );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.removeNamespaceIfExists when it exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';

		let ModelClass		= server.model( namespace );

		server.setUp().then(()=>{
			server.createNamespace( namespace ).then(()=>{
				ModelClass.removeNamespaceIfExists().then(( err )=>{
					assert.equal( false, err );
					server.existsNamespace( namespace ).then(( exists )=>{
						assert.equal( false, exists );
						server.exit().then(()=>{
							done();
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.removeNamespaceIfExists when it does not exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';

		let ModelClass		= server.model( namespace );

		server.setUp().then(()=>{
			ModelClass.removeNamespaceIfExists().then(( err )=>{
				assert.equal( false, err );
				server.existsNamespace( namespace ).then(( exists )=>{
					assert.equal( false, exists );
					server.exit().then(()=>{
						done();
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.createNamespaceIfNotExists when it exists does not overwrite',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= {};

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(()=>{
				model.save().then(()=>{
					ModelClass.createNamespaceIfNotExists().then(( err )=>{
						assert.equal( false, err );
						ModelClass.find( recordName ).then(( model )=>{
							assert.equal( true, model !== null );
							server.exit().then(()=>{
								done();
							}).catch( done );
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.createNamespaceIfNotExists when it does not exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';

		let ModelClass		= server.model( namespace );

		server.setUp().then(()=>{
			ModelClass.createNamespaceIfNotExists().then(( err )=>{
				assert.equal( false, err );
				server.exit().then(()=>{
					done();
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.createNamespace when it does not exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';

		let ModelClass		= server.model( namespace );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(( err )=>{
				assert.equal( false, err );
				server.exit().then(()=>{
					done();
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.createNamespace when it exists overwrites it',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= { key: 'value' };
		let recordOptions	= {};

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(( err )=>{
				assert.equal( false, err );
				model.save().then(()=>{
					ModelClass.createNamespace().then(()=>{
						ModelClass.find( recordName ).then(( model )=>{
							assert.equal( null, model );
							server.exit().then(()=>{
								done();
							}).catch( done );
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.existsNamespace when namespace exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';

		let ModelClass		= server.model( namespace );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(( err )=>{
				ModelClass.existsNamespace().then(( exist )=>{
					assert.equal( true, exist );
					server.exit().then(()=>{
						done();
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.existsNamespace when namespace does not exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';

		let ModelClass		= server.model( namespace );

		server.setUp().then(()=>{
			ModelClass.existsNamespace().then(( exist )=>{
				assert.equal( false, exist );
				server.exit().then(()=>{
					done();
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.find when record exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordOptions	= {};
		let recordData		= {};

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(()=>{
				model.save().then(()=>{
					ModelClass.find( recordName ).then(( model )=>{
						assert.deepStrictEqual( recordName, model.recordName );
						assert.deepStrictEqual( recordData, model.recordData );

						server.exit().then(()=>{
							done();
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.findAndRemove when record exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordOptions	= {};
		let recordData		= {};

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(()=>{
				model.save().then(()=>{
					ModelClass.findAndRemove( recordName ).then(( err )=>{
						assert.equal( false, err );
						ModelClass.find( recordName ).then(( model )=>{
							assert.deepStrictEqual( null, model );

							server.exit().then(()=>{
								done();
							}).catch( done );
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.find when record does not exists',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';

		let ModelClass		= server.model( namespace );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(()=>{
				ModelClass.find( recordName ).then(( model )=>{
					assert.equal( null, model );

					server.exit().then(()=>{
						done();
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.search finds',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordName2		= 'TestName2';
		let recordData		= {};
		let recordOptions	= {};

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );
		let model2			= new ModelClass( recordName2, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(()=>{
				model.save().then(()=>{
					model2.save().then(()=>{
						ModelClass.search( 'Test' ).then(( models )=>{
							assert.equal( 2, models.length );

							server.exit().then(()=>{
								done();
							}).catch( done );
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.searchAndRemove',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordName2		= 'TestName2';
		let recordData		= {};
		let recordOptions	= {};

		let ModelClass		= server.model( namespace );
		let model			= new ModelClass( recordName, recordData, recordOptions );
		let model2			= new ModelClass( recordName2, recordData, recordOptions );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(()=>{
				model.save().then(()=>{
					model2.save().then(()=>{
						ModelClass.searchAndRemove( 'Test' ).then(( err )=>{
							assert.equal( false, err );
							ModelClass.search( 'Test' ).then(( models )=>{
								assert.equal( 0, models.length );

								server.exit().then(()=>{
									done();
								}).catch( done );
							}).catch( done );
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});

test({
	message			: 'DataServerModel.make creates new entry',
	dataProvider	: TEST_SUITE_DATA_PROVIDER,
	test			: ( done, ServerClass )=>{
		let server			= new ServerClass();
		let namespace		= 'Test';
		let recordName		= 'TestName';
		let recordData		= {};
		let recordOptions	= {};

		let ModelClass		= server.model( namespace );

		server.setUp().then(()=>{
			ModelClass.createNamespace().then(()=>{
				ModelClass.make( recordName, recordData, recordOptions ).then(( model )=>{
					assert.deepStrictEqual( recordData, model.recordData );
					assert.deepStrictEqual( recordName, model.recordName );

					ModelClass.find( recordName ).then(( model )=>{
						assert.deepStrictEqual( recordData, model.recordData );
						assert.deepStrictEqual( recordName, model.recordName );

						server.exit().then(()=>{
							done();
						}).catch( done );
					}).catch( done );
				}).catch( done );
			}).catch( done );
		}).catch( done );
	}
});
