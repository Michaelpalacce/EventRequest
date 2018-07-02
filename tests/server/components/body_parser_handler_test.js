'use strict';

const { Mock, assert, test, helpers }	= require( './../../testing_suite' );
const {
	BodyParserHandler,
	BodyParser,
	MultipartFormParser,
	JsonBodyParser,
	FormBodyParser
}										= require( './../../../server/components/body_parser_handler' );

test({
	message	: 'BodyParserHandler.constructor on defaults throws because EventRequest is invalid',
	test	: ( done )=>{
		assert.throws(()=>{
			new BodyParserHandler();
		});

		done();
	}
});

test({
	message	: 'BodyParserHandler.constructor does not throw with valid arguments',
	test	: ( done )=>{
		assert.doesNotThrow(()=>{
			new BodyParserHandler( helpers.getEventRequest() );
		});
		done();
	}
});
