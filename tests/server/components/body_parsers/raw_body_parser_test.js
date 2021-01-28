'use strict';

const { test, helpers, assert }	= require( '../../../test_helper' );
const RawBodyParser				= require( '../../../../server/components/body_parsers/raw_body_parser' );

test({
	message	: 'RawBodyParser.parse.when.event.is.finished',
	test	: ( done ) => {
		let bodyToStream	= 'test';
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{ 'content-type' : '*/*' }
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
		let rawBodyParser	= new RawBodyParser();

		rawBodyParser.parse( eventRequest ).then(() => { done( 'Should not have been called' ); }).catch( () => { done( 'Should not have been called' ); } );

		setTimeout(() => {
			done();
		}, 100 );
	}
});

test({
	message	: 'RawBodyParser.with.defaults',
	test	: ( done ) => {
		let bodyToStream	= 'test';
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{ 'content-type' : '*/*' }
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
		let rawBodyParser	= new RawBodyParser();

		rawBodyParser.parse( eventRequest ).then(( body ) => {
			assert.deepStrictEqual( body.body, 'test' );
			assert.deepStrictEqual( body.rawBody, 'test' );

			done();
		}).catch( done );
	}
});

test({
	message	: 'RawBodyParser.with.maxPayloadLength',
	test	: ( done ) => {
		let bodyToStream	= 'test';
		let eventRequest	= helpers.getEventRequest(
			undefined,
			undefined,
			{ 'content-type' : '*/*' }
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
		let rawBodyParser	= new RawBodyParser( { maxPayloadLength: 1 });

		rawBodyParser.parse( eventRequest ).then(( body ) => {
			assert.deepStrictEqual( body.body, {} );
			assert.deepStrictEqual( body.rawBody, {} );
			done();
		}).catch( done );
	}
});
