'use strict';

const { assert, test }	= require( '../../../test_helper' );
const uniqueId			= require( '../../../../server/components/helpers/unique_id' );

test({
	message	: 'UniqueId.makeId makes a random ID with the correct length',
	test	: ( done ) => {
		const idOne	= uniqueId.makeId( 10 );
		const idTwo	= uniqueId.makeId( 20 );

		assert.equal( idOne.length, 10 );
		assert.equal( idTwo.length, 20 );
		assert.notEqual( idOne, idTwo );

		done();
	}
});

test({
	message	: 'UniqueId.makeId.with.not.a.number.argument',
	test	: ( done ) => {
		const idOne	= uniqueId.makeId( 10 );
		const idTwo	= uniqueId.makeId( 'wrong' );

		assert.equal( idOne.length, 10 );
		assert.equal( idTwo.length, 10 );
		assert.notEqual( idOne, idTwo );

		done();
	}
});
