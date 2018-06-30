'use strict';

// Dependencies
const { assert, test, Mock }	= require( './../../../../../testing_suite' );
const { LOG_LEVELS, File, Log }	= require( './../../../../../../server/components/logger/loggur' );

test({
	message	: 'File.constructor on defaults',
	test	: ( done )=>{
		new File();

		done();
	}
});