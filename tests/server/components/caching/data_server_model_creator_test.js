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
