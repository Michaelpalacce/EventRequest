'use strict';

// Dependencies
const { assert, test }		= require( './../testing_suite' );
const { Server, Router }	= require( './../../index' );
const Cluster				= require( './../../server/components/cluster/cluster' );

test({
	message	: 'Server.constructor starts without crashing',
	test	: ( done )=>{
		assert.doesNotThrow( ()=>{
			new Server();
		});
		done();
	}
});

test({
	message	: 'Server.constructor instantiates a router and a cluster',
	test	: ( done )=>{
		let server	= new Server();
		assert.deepStrictEqual( server.router, new Router() );
		assert.deepStrictEqual( server.cluster, new Cluster( server ) );
		done();
	}
});

test({
	message	: 'Server.constructor options when options are correct',
	test	: ( done )=>{
		let options	= {};
		new Server( options );

		done();
	}
});

test({
	message	: 'Server.constructor options when options are incorrect',
	test	: ( done )=>{
		let options	= new Error();
		new Server( options );

		done();
	}
});
