'use strict';

// Dependencies
const { assert, test, helpers }	= require( './../testing_suite' );
const { Server, Router }		= require( './../../index' );
const Cluster					= require( './../../server/components/cluster/cluster' );
const http						= require( 'http' );
const querystring				= require( 'querystring' );

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
		helpers.sendServerRequest( '', '/ping', 'GET', ( err, response )=>{
			if ( err )
			{
				done( err );
			}
			else
			{
				response.statusCode === 200 ? done() : done( 'Wrong status code returned' );
			}
		});
	}
});

// Cannot test the server more since until i figure out how to test clusters efficiently