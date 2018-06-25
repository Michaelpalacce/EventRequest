'use strict';

// Dependencies
const { assert, test }	= require( './../testing_suite' );
const Router			= require( './../../server/router' );

test({
	message	: 'Router.constructor does not die',
	test	: ( done )=>{
		assert.doesNotThrow( ()=>{
			new Router();
		});

		done();
	}
});

test({
	message	: 'Router.add throws an exception on invalid middleware',
	test	: ( done )=>{
		let router	= new Router();
		assert.throws( ()=>{
			router.add();
		});
		done();
	}
});

test({
	message	: 'Router.add adds a valid middleware',
	test	: ( done )=>{
		let router	= new Router();
		assert.doesNotThrow( ()=>{
			router.add({});
		});
		done();
	}
});
