'use strict';

const { assert, test }	= require( '../../../test_helper' );
const Bucket			= require( '../../../../server/components/rate_limiter/bucket' );

test({
	message	: 'Bucket.constructor on defaults',
	test	: ( done )=>{
		const bucket	= new Bucket();

		assert.equal( bucket.refillTime, 60 );
		assert.equal( bucket.maxAmount, 1000 );
		assert.equal( bucket.refillAmount, 100 );
		assert.equal( bucket.value, bucket.maxAmount );
		assert.equal( typeof bucket.lastUpdate === 'number', true );

		done();
	}
});

test({
	message	: 'Bucket.reset resets the value to maxAmount and updates lastUpdate',
	test	: ( done )=>{
		const bucket	= new Bucket();
		bucket.reduce();

		const lastUpdate	= bucket.lastUpdate;

		assert.equal( bucket.value, 999 );
		assert.notEqual( bucket.value, bucket.maxAmount );

		setTimeout(()=>{
			bucket.reset();

			assert.notEqual( bucket.lastUpdate, lastUpdate );
			assert.equal( bucket.value, bucket.maxAmount );

			done();
		}, 1000 );
	}
});

test({
	message	: 'Bucket.get gets the current amount of tokens',
	test	: ( done )=>{
		const bucket	= new Bucket();

		assert.equal( bucket.get(), bucket.maxAmount );
		bucket.reduce();
		assert.equal( bucket.get(), 999 );

		done();
	}
});

test({
	message	: 'Bucket.reduce reduces the amount of tokens and returns true',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 1, 10 );

		assert.equal( bucket.get(), bucket.maxAmount );
		assert.equal( bucket.reduce(), true );
		assert.equal( bucket.get(), 9 );

		done();
	}
});

test({
	message	: 'Bucket.reduce reduces the amount of tokens and returns false if not enough tokens',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 1, 10 );

		assert.equal( bucket.get(), bucket.maxAmount );
		assert.equal( bucket.reduce( 11 ), false );
		assert.equal( bucket.get(), bucket.maxAmount );

		done();
	}
});

test({
	message	: 'Bucket.reduce reduces the amount of tokens and refills after time',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 1, 10 );

		assert.equal( bucket.get(), bucket.maxAmount );
		assert.equal( bucket.reduce(), true );
		setTimeout(()=>{
			assert.equal( bucket.get(), bucket.maxAmount );
			done();
		}, 1100 );
	}
});


test({
	message	: 'Bucket.reduce does not refill more than max',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 1, 10 );

		assert.equal( bucket.get(), bucket.maxAmount );
		assert.equal( bucket.reduce(), true );
		assert.equal( bucket.get(), 9 );

		setTimeout(()=>{
			// Should have refilled twice but is refilled only once ( and minus one token is 9 )
			assert.equal( bucket.reduce(), true );
			assert.equal( bucket.get(), 9 );
			done();
		}, 1100 );
	}
});
