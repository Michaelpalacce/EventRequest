'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../test_helper' );
const { Server, Router }		= require( './../../index' );

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
	message	: 'Server.constructor instantiates a router',
	test	: ( done )=>{
		let server	= new Server();
		assert.deepStrictEqual( server.router, new Router() );
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
