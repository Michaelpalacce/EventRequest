'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const { Session }				= require( './../../../../server/components/session/session' );

test({
	message	: 'Session constructor on default throws',
	test	: ( done )=>{
		assert.throws(()=>{
			new Session()
		});

		done();
	}
});

test({
	message	: 'Session constructor on default throws',
	test	: ( done )=>{
		let eventRequest			= helpers.getEventRequest();
		eventRequest.cachingServer	= helpers.getCachingServer();
		let session					= null;
		assert.doesNotThrow(()=>{
			session	= new Session( eventRequest )
		});

		done();
	}
});
