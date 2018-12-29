'use strict';

const { assert, test, helpers }	= require( '../../../test_helper' );
const { JsonBodyParser }		= require( './../../../../server/components/body_parser_handler' );

test({
	message	: 'JsonBodyParser.constructor on defaults does not die',
	test	: ( done )=>{
		let jsonBodyParser	= new JsonBodyParser();
		assert.equal( jsonBodyParser.maxPayloadLength, 10 * 1048576 );
		assert.equal( jsonBodyParser.strict, true );

		done();
	}
});

test({
	message	: 'JsonBodyParser.constructor on correct arguments',
	test	: ( done )=>{
		let maxPayloadLength	= 1;
		let strict				= false;

		let jsonBodyParser	= new JsonBodyParser( { maxPayloadLength, strict } );
		assert.equal( jsonBodyParser.maxPayloadLength, maxPayloadLength );
		assert.equal( jsonBodyParser.strict, strict );

		done();
	}
});

test({
	message	: 'JsonBodyParser.constructor on incorrect arguments',
	test	: ( done )=>{
		let maxPayloadLength	= 'test';
		let strict				= 'test';

		let jsonBodyParser	= new JsonBodyParser( { maxPayloadLength, strict } );
		assert.equal( jsonBodyParser.maxPayloadLength, 10 * 1048576 );
		assert.equal( jsonBodyParser.strict, true );

		done();
	}
});

test({
	message	: 'JsonBodyParser.supports returns correct results',
	test	: ( done )=>{
		let jsonBodyParser	= new JsonBodyParser();
		assert.equal( jsonBodyParser.supports( helpers.getEventRequest() ), false );
		assert.equal( jsonBodyParser.supports(
			helpers.getEventRequest(
				undefined,
				undefined,
				{ 'content-type' : 'application/json' }
			)
		), true );
		assert.equal( jsonBodyParser.supports(
			helpers.getEventRequest(
				undefined,
				undefined,
				{ 'content-type' : 'application/x-www-form-urlencoded' }
			)
		), false );

		done();
	}
});


test({
	message	: 'JsonBodyParser.parse parses event request body',
	test	: ( done )=>{
		let expectedBody	= { key: 'value' };
		let bodyToStream	= JSON.stringify( expectedBody );
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{ 'content-type' : 'application/json' }
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback )=>{
				if ( event === 'data' )
				{
					callback( Buffer.from( bodyToStream ) )
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});
		let jsonBodyParser	= new JsonBodyParser( { strict: false } );

		jsonBodyParser.parse( eventRequest, ( err, body )=>{
			assert.equal( err, false );
			assert.deepStrictEqual( body, expectedBody );
			done();
		} );
	}
});

test({
	message	: 'JsonBodyParser.parse does not parse if maxPayloadLength is reached',
	test	: ( done )=>{
		let bodyToStream	= { key : 'value' };
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'application/json',
				'content-length'	: 10000,
			}
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback )=>{
				if ( event === 'data' )
				{
					callback( Buffer.from( JSON.stringify( bodyToStream ) ) )
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});
		let jsonBodyParser	= new JsonBodyParser( { strict: false, maxPayloadLength : 1 } );

		jsonBodyParser.parse( eventRequest, ( err, body )=>{
			assert.equal( err !== false, true );
			done();
		} );
	}
});

test({
	message	: 'JsonBodyParser.parse does not parse if strict is true and content-length is not correct',
	test	: ( done )=>{
		let bodyToStream	= { key : 'value' };
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'application/json',
				'content-length'	: 10000,
			}
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback )=>{
				if ( event === 'data' )
				{
					callback( Buffer.from( JSON.stringify( bodyToStream ) ) )
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});
		let jsonBodyParser	= new JsonBodyParser( { strict: true } );

		jsonBodyParser.parse( eventRequest, ( err, body )=>{
			assert.equal( err !== false, true );
			done();
		} );
	}
});

test({
	message	: 'JsonBodyParser.parse does not parse if content-type does not match',
	test	: ( done )=>{
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'application/test',
				'content-length'	: 10000,
			}
		);
		let jsonBodyParser	= new JsonBodyParser( { strict: false } );

		jsonBodyParser.parse( eventRequest, ( err, body )=>{
			assert.equal( err !== false, true );
			done();
		} );
	}
});
