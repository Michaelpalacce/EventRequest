'use strict';

const { assert, test, helpers }	= require( '../../../test_helper' );
const BodyParser				= require( '../../../../server/components/body_parsers/body_parser' );

test({
	message	: 'BodyParser.constructor on defaults does not die',
	test	: ( done )=>{
		new BodyParser();

		done();
	}
});

test({
	message	: 'BodyParser.supports returns false by default',
	test	: ( done )=>{
		assert.equal( new BodyParser().supports( helpers.getEventRequest() ), false );

		done();
	}
});

test({
	message	: 'BodyParser.parse callbacks error: Not implemented',
	test	: ( done )=>{
		new BodyParser().parse( helpers.getEventRequest() ).then( done ).catch(( err )=>{
			assert.equal( err, 'Not implemented' );
			done();
		});
	}
});
