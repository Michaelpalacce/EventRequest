'use strict';

const { assert, test, helpers }	= require( '../../../test_helper' );
const JsonBodyParser			= require( '../../../../server/components/body_parsers/json_body_parser' );

test({
	message	: 'JsonBodyParser.constructor on defaults does not die',
	test	: ( done ) => {
		let jsonBodyParser	= new JsonBodyParser();
		assert.equal( jsonBodyParser.maxPayloadLength, 100 * 1048576 );
		assert.equal( jsonBodyParser.strict, false );

		done();
	}
});

test({
	message	: 'JsonBodyParser.constructor on correct arguments',
	test	: ( done ) => {
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
	test	: ( done ) => {
		let maxPayloadLength	= 'test';
		let strict				= 'test';

		let jsonBodyParser	= new JsonBodyParser( { maxPayloadLength, strict } );
		assert.equal( jsonBodyParser.maxPayloadLength, 100 * 1048576 );
		assert.equal( jsonBodyParser.strict, false );

		done();
	}
});

test({
	message	: 'JsonBodyParser.supports returns correct results',
	test	: ( done ) => {
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
	message	: 'JsonBodyParser.parse.parses.event.request.body',
	test	: ( done ) => {
		let expectedBody	= { body: { key: 'value' }, rawBody: '{"key":"value"}' };
		let bodyToStream	= JSON.stringify( { key: 'value' } );
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{ 'content-type' : 'application/json' }
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback ) => {
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

		jsonBodyParser.parse( eventRequest ).then(( body ) => {
			assert.deepStrictEqual( body, expectedBody );
			done();
		}).catch( done );
	}
});

test({
	message	: 'JsonBodyParser.parse.parses.event.request.body.is.invalid',
	test	: ( done ) => {
		let bodyToStream	= '{"foo": 1,}';
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{ 'content-type' : 'application/json' }
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback ) => {
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

		jsonBodyParser.parse( eventRequest ).then(( body ) => {
			done( 'Should not have been called!' );
		}).catch( ( error )=>{
			assert.deepStrictEqual( error, { code: 'app.er.bodyParser.json.errorParsing' } );
			done();
		} );
	}
});

test({
	message	: 'JsonBodyParser.parse.when.event.is.finished',
	test	: ( done ) => {
		let bodyToStream	= JSON.stringify( { key: 'value' } );
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{ 'content-type' : 'application/json' }
		);
		eventRequest.request._mock({
			method			: 'on',
			shouldReturn	: ( event, callback ) => {
				if ( event === 'data' )
				{
					eventRequest.finished	= true;

					callback( Buffer.from( bodyToStream ) )
				}
				else if ( event === 'end' )
				{
					callback();
				}
			}
		});
		let jsonBodyParser	= new JsonBodyParser( { strict: false } );

		jsonBodyParser.parse( eventRequest ).then(() => { done( 'Should not have been called' ); }).catch( done );

		setTimeout(() => {
			// The json body parser was never done, since the event finished prematurely
			done();
		}, 50 );
	}
});

test({
	message	: 'JsonBodyParser.parse does not parse if maxPayloadLength is reached and is not strict',
	test	: ( done ) => {
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
			shouldReturn	: ( event, callback ) => {
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
		let jsonBodyParser	= new JsonBodyParser( { strict: true, maxPayloadLength : 1 } );

		jsonBodyParser.parse( eventRequest ).then(( body ) => {
			assert.deepStrictEqual( body, { body: {}, rawBody: {} } );

			done();
		}).catch(( err ) => {
			done( err );
		});
	}
});

test({
	message	: 'JsonBodyParser.parse parses if maxPayloadLength is reached and is strict',
	test	: ( done ) => {
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
			shouldReturn	: ( event, callback ) => {
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
		let jsonBodyParser	= new JsonBodyParser( { strict: true, maxPayloadLength : 1 } );

		jsonBodyParser.parse( eventRequest ).then(( body ) => {
			assert.deepStrictEqual( body, { body: {}, rawBody: {} } );

			done();
		}).catch(( err ) => {
			done( err );
		});
	}
});

test({
	message	: 'JsonBodyParser.parse does not parse if strict is true and content-length is not correct',
	test	: ( done ) => {
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
			shouldReturn	: ( event, callback ) => {
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

		jsonBodyParser.parse( eventRequest ).then(( body ) => {
			assert.deepStrictEqual( body, { body: {}, rawBody: {} } );

			done();
		}).catch(( err ) => {
			done( err );
		});
	}
});

test({
	message	: 'JsonBodyParser.parse does not parse if content-type does not match',
	test	: ( done ) => {
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{
				'content-type'		: 'application/test',
				'content-length'	: 10000,
			}
		);
		let jsonBodyParser	= new JsonBodyParser( { strict: false } );

		jsonBodyParser.parse( eventRequest ).then(() => { done( 'Should have rejected' ); } ).catch(( err ) => {
			assert.equal( err !== false, true );
			done();
		});
	}
});
