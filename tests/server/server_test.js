'use strict';

// Dependencies
const { assert, test }		= require( './../testing_suite' );
const { Server, Router }	= require( './../../index' );
const Cluster				= require( './../../server/components/cluster/cluster' );
const http					= require( 'http' );
const querystring			= require( 'querystring' );

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

test({
	message	: 'Server is started',
	test	: ( done ) =>{

		const postData = querystring.stringify({});

		const options = {
			hostname	: 'localhost',
			port		: 3333,
			path		: '/ping',
			method		: 'GET',
			headers		: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength( postData )
			}
		};

		let req	= http.request( options, ( res ) =>{
			console.log(`STATUS: ${res.statusCode}`);
			done();
		});

		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});

		req.write( postData );
		req.end();
	}
});

// Cannot test the server more since until i figure out how to test clusters efficiently