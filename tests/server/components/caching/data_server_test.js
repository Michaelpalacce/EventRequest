'use strict';

const { Mock, assert, test, Mocker }	= require( '../../../test_helper' );
const { DataServer }					= require( './../../../../server/components/caching/data_server' );

test({
	message	: 'DataServer.constructor throws an exception since sanitize is not changed',
	test	: ( done )=>{
		assert.throws(()=>{
			new DataServer();
		});

		done();
	}
});

test({
	message	: 'DataServer.constructor calls sanitize',
	test	: ( done )=>{
		let called				= 0;
		let MockedDataServer	= Mock( DataServer );
		Mocker( MockedDataServer, {
			method			: 'sanitize',
			shouldReturn	: ()=>{
				++ called;
			},
			called			: 1
		} );
		new MockedDataServer();

		called === 1 ? done() : done( 'Sanitize should have been called but it was not' );
	}
});

test({
	message	: 'DataServer.getInstance returns an instance of DataServer',
	test	: ( done )=>{
		let MockedDataServer	= Mock( DataServer );
		Mocker( MockedDataServer, {
			method			: 'sanitize',
			shouldReturn	: ()=>{}
		} );

		assert.deepStrictEqual( new MockedDataServer(), MockedDataServer.getInstance() );

		done();
	}
});
