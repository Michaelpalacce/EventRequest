'use strict';

const { assert, Mock, test, helpers }	= require( './../testing_suite' );
const middlewareContainer				= require( './../../server/middleware_container' );
const Router							= require( './../../server/router' );
const ErrorHandler						= require( './../../server/components/error_handler' );

test({
	message	: 'MiddlewareContainer error handler defaults',
	test	: ( done )=>{
		let eventRequest	= helpers.getEventRequest();
		let router			= new Router();
		router.add( middlewareContainer.errorHandler( {} ) );

		eventRequest.setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );
		assert.equal( eventRequest.errorHandler, null );
		eventRequest.next();
		assert.equal( eventRequest.errorHandler instanceof ErrorHandler, true );

		done();
	}
});