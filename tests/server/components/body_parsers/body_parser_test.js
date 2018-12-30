'use strict';

const { assert, test, helpers }	= require( '../../../test_helper' );
const { BodyParser }			= require( '../../../../server/components/body_parsers/body_parser_handler' );

test({
	message	: 'BodyParser.constructor on defaults does not die',
	test	: ( done )=>{
		new BodyParser();

		done();
	}
});

test({
	message	: 'BodyParser.getInstance returns the same as constructor',
	test	: ( done )=>{
		assert.deepStrictEqual( new BodyParser(), BodyParser.getInstance() );

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
		new BodyParser().parse( helpers.getEventRequest(), ( err )=>{
			assert.equal( err, 'Not implemented' );
		} );

		done();
	}
});
