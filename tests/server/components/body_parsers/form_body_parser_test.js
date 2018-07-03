'use strict';

const { Mock, Mocker, assert, test, helpers }	= require( './../../../testing_suite' );
const { FormBodyParser }						= require( './../../../../server/components/body_parser_handler' );

test({
	message	: 'FormBodyParser.constructor on defaults does not die',
	test	: ( done )=>{
		let formBodyParser	= new FormBodyParser();
		assert.equal( formBodyParser.maxPayloadLength, 10 * 1048576 );
		assert.equal( formBodyParser.strict, true );

		done();
	}
});

test({
	message	: 'FormBodyParser.constructor on correct arguments',
	test	: ( done )=>{
		let maxPayloadLength	= 1;
		let strict				= false;

		let formBodyParser	= new FormBodyParser( { maxPayloadLength, strict } );
		assert.equal( formBodyParser.maxPayloadLength, maxPayloadLength );
		assert.equal( formBodyParser.strict, strict );

		done();
	}
});

test({
	message	: 'FormBodyParser.constructor on incorrect arguments',
	test	: ( done )=>{
		let maxPayloadLength	= 'test';
		let strict				= 'test';

		let formBodyParser	= new FormBodyParser( { maxPayloadLength, strict } );
		assert.equal( formBodyParser.maxPayloadLength, 10 * 1048576 );
		assert.equal( formBodyParser.strict, true );

		done();
	}
});

test({
	message	: 'FormBodyParser.supports returns correct results',
	test	: ( done )=>{
		let formBodyParser	= new FormBodyParser();
		assert.equal( formBodyParser.supports( helpers.getEventRequest() ), false );
		assert.equal( formBodyParser.supports(
			helpers.getEventRequest(
				undefined,
				undefined,
				{ 'content-type' : 'application/x-www-form-urlencoded' }
			)
		), true );
		assert.equal( formBodyParser.supports(
			helpers.getEventRequest(
				undefined,
				undefined,
				{ 'content-type' : 'application/json' }
			)
		), false );

		done();
	}
});

test({
	message	: 'FormBodyParser.parse parses event request body',
	incomplete	: true,
	test	: ( done )=>{
		done();
	}
});
