'use strict';

const { test, helpers }	= require( '../../../test_helper' );
const RawBodyParser		= require( '../../../../server/components/body_parsers/raw_body_parser' );

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
		let rawBodyParser	= new RawBodyParser( { strict: false } );

		rawBodyParser.parse( eventRequest ).then(() => { done( 'Should not have been called' ); }).catch( done );

		setTimeout(() => {
			// The json body parser was never done, since the event finished prematurely
			done();
		}, 100 );
	}
});
