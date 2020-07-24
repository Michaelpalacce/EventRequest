'use strict';

const { assert, test }	= require( '../../../test_helper' );
const Bucket			= require( '../../../../server/components/rate_limiter/bucket' );

test({
	message	: 'Bucket.constructor on defaults',
	test	: ( done )=>{
		const bucket	= new Bucket();

		bucket.init().then(() => {
			assert.equal( bucket.refillTime, 60000 );
			assert.equal( bucket.maxAmount, 1000 );
			assert.equal( bucket.refillAmount, 100 );
			done();
		});
	}
});

test({
	message	: 'Bucket.reset resets the value to maxAmount and updates lastUpdate',
	test	: ( done )=>{
		const bucket	= new Bucket();

		bucket.init().then( async () => {
			await bucket.reduce();

			const lastUpdate	= bucket.lastUpdate;

			assert.equal( await bucket._getValue(), 999 );
			assert.notEqual( await bucket._getValue(), bucket.maxAmount );

			setTimeout( async () => {
				await bucket.reset();

				assert.notEqual( await bucket._getLastUpdate(), lastUpdate );
				assert.equal( await bucket._getValue(), bucket.maxAmount );

				done();
			}, 1000 );
		});
	}
});

test({
	message	: 'Bucket.get gets the current amount of tokens',
	test	: ( done )=>{
		const bucket	= new Bucket();

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			await bucket.reduce();
			assert.equal( await bucket.get(), 999 );

			done();
		});
	}
});

test({
	message	: 'Bucket.reduce reduces the amount of tokens and returns true',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 1, 10 );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			assert.equal( await bucket.reduce(), true );
			assert.equal( await bucket.get(), 9 );

			done();
		});
	}
});

test({
	message	: 'Bucket.reduce reduces the amount of tokens and returns false if not enough tokens',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 1, 10 );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			assert.equal( await bucket.reduce( 11 ), false );
			assert.equal( await bucket.get(), bucket.maxAmount );

			done();
		});
	}
});

test({
	message	: 'Bucket.reduce reduces the amount of tokens and refills after time',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 1, 10 );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			assert.equal( await bucket.reduce(), true );
			setTimeout( async () => {
				assert.equal( await bucket.get(), bucket.maxAmount );
				done();
			}, 1050 );
		});
	}
});

test({
	message	: 'Bucket.reduce does not refill more than max',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 1, 10 );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			assert.equal( await bucket.reduce(), true );
			assert.equal( await bucket.get(), 9 );

			setTimeout( async() => {
				// Should have refilled twice but is refilled only once ( and minus one token is 9 )
				assert.equal( await bucket.reduce(), true );
				assert.equal( await bucket.get(), 9 );
				done();
			}, 2100 );
		});
	}
});

test({
	message	: 'Bucket.reduceRaceCondition',
	test	: ( done )=>{
		const bucket	= new Bucket( 1, 100, 10000 );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );

			const promises	= [];

			for ( let i = 0; i < 10000; i ++ )
			{
				promises.push( bucket.reduce() );
			}

			Promise.all( promises ).then(( responses )=>{
				for ( const response of responses )
				{
					if ( response === false )
					{
						return done( 'Could not reduce token even tho there was available ones' );
					}
				}

				done();
			});
		});
	}
});

test({
	message	: 'Bucket.reduceRaceCondition fails after a set amount',
	test	: ( done )=>{
		const bucket				= new Bucket( 1, 100, 10000 );
		const expectedFalseTokens	= 500;

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );

			const promises	= [];

			for ( let i = 0; i < 10500; i ++ )
			{
				promises.push( bucket.reduce() );
			}

			Promise.all( promises ).then(( responses )=>{
				let falseResponses	= 0;
				for ( const response of responses )
				{
					if ( response === false )
					{
						falseResponses	++;
					}
				}

				done(
					falseResponses !== 500
						? `Incorrect amount of false tokens. Expected:${expectedFalseTokens} got: ${falseResponses}`
						: false
				);
			});
		});
	}
});

test({
	message	: 'Bucket.reduceRaceConditionWithRefill',
	test	: ( done )=>{
		const bucket				= new Bucket( 5000, 1, 10000 );
		const expectedFalseTokens	= 5000;

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );

			const promises	= [];

			for ( let i = 0; i < 10000; i ++ )
			{
				promises.push( bucket.reduce() );
			}

			setTimeout( async () => {
				assert.equal( await bucket.isFull(), true )

				for ( let i = 0; i < 15000; i ++ )
				{
					promises.push( bucket.reduce() );
				}

				Promise.all( promises ).then(( responses )=>{
					let falseResponses	= 0;
					for ( const response of responses )
					{
						if ( response === false )
						{
							falseResponses	++;
						}
					}

					done(
						falseResponses !== expectedFalseTokens
							? `Incorrect amount of false tokens. Expected:${expectedFalseTokens} got: ${falseResponses}`
							: false
					);
				});
			}, 2010 );
		});
	}
});
