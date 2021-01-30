'use strict';

const { Mock, assert, test }	= require( '../../../test_helper' );
const DataServerMap			= require( '../../../../server/components/caching/data_server_map' );
const Bucket					= require( '../../../../server/components/rate_limiter/bucket' );

test({
	message	: 'Bucket.with.big.map.constructor.on.new.data.server',
	test	: ( done ) => {
		const dataStore	= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket	= new Bucket( 100, 60, 1000, Bucket.DEFAULT_PREFIX, null, dataStore );

		bucket.init().then(() => {
			assert.equal( bucket.refillTime, 60000 );
			assert.equal( bucket.maxAmount, 1000 );
			assert.equal( bucket.refillAmount, 100 );
			done();
		});
	}
});

test({
	message	: 'Bucket.with.big.map.handleError.on.error.throws',
	test	: ( done ) => {
		const MockDataServer	= Mock( DataServerMap );
		const dataServer		= new MockDataServer( { persist: false, useBigMap: true } );
		const bucket			= new Bucket( undefined, undefined, undefined, undefined, undefined, dataServer );

		process.once( 'uncaughtException', ( reason, p ) => {
			done();
		});

		bucket.init().then( async () => {
			dataServer._mock({
				method			: 'set',
				shouldReturn	: async () => {
					throw new Error( 'error' );
				}
			});

			await bucket._setValue( 'test' );
		});
	}
});

test({
	message	: 'Bucket.with.big.map.reset.resets.the.value.to.maxAmount.and.updates.lastUpdate',
	test	: ( done ) => {
		const dataServer	= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket		= new Bucket( undefined, undefined, undefined, undefined, undefined, dataServer );

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
	message	: 'Bucket.with.big.map.get.gets.the.current.amount.of.tokens',
	test	: ( done ) => {
		const dataServer	= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket		= new Bucket( undefined, undefined, undefined, undefined, undefined, dataServer );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			await bucket.reduce();
			assert.equal( await bucket.get(), 999 );

			done();
		});
	}
});

test({
	message	: 'Bucket.with.big.map.reduce.reduces.the.amount.of.tokens.and.returns.true',
	test	: ( done ) => {
		const dataServer	= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket		= new Bucket( 1, 1, 10, undefined, undefined, dataServer );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			assert.equal( await bucket.reduce(), true );
			assert.equal( await bucket.get(), 9 );

			done();
		});
	}
});

test({
	message	: 'Bucket.with.big.map.reduce.reduces.the.amount.of.tokens.and.returns.false.if.not.enough.tokens',
	test	: ( done ) => {
		const dataServer	= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket		= new Bucket( 1, 1, 10, undefined, undefined, dataServer );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			assert.equal( await bucket.reduce( 11 ), false );
			assert.equal( await bucket.get(), bucket.maxAmount );

			done();
		});
	}
});

test({
	message	: 'Bucket.with.big.map.reduce.reduces.the.amount.of.tokens.and.refills.after.time',
	test	: ( done ) => {
		const dataServer	= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket		= new Bucket( 1, 1/10, 10, undefined, undefined, dataServer );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			assert.equal( await bucket.reduce(), true );
			setTimeout( async () => {
				assert.equal( await bucket.get(), bucket.maxAmount );
				done();
			}, 125 );
		});
	}
});

test({
	message	: 'Bucket.with.big.map.reduce.does.not.refill.more.than.max',
	test	: ( done ) => {
		const dataServer	= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket		= new Bucket( 1, 1/10, 10, undefined, undefined, dataServer );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );
			assert.equal( await bucket.reduce(), true );
			assert.equal( await bucket.get(), 9 );

			setTimeout( async() => {
				// Should have refilled twice but is refilled only once ( and minus one token is 9 )
				assert.equal( await bucket.reduce(), true );
				assert.equal( await bucket.get(), 9 );
				done();
			}, 210 );
		});
	}
});

test({
	message	: 'Bucket.with.big.map.reduceRaceCondition',
	test	: ( done ) => {
		const dataServer	= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket		= new Bucket( 1, 100, 10000, undefined, undefined, dataServer );

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );

			const promises	= [];

			for ( let i = 0; i < 10000; i ++ )
			{
				promises.push( bucket.reduce() );
			}

			Promise.all( promises ).then(( responses ) => {
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
	message	: 'Bucket.with.big.map.reduceRaceCondition.fails.after.a.set.amount',
	test	: ( done ) => {
		const dataServer			= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket				= new Bucket( 1, 100, 10000, undefined, undefined, dataServer );
		const expectedFalseTokens	= 500;

		bucket.init().then( async () => {
			assert.equal( await bucket.get(), bucket.maxAmount );

			const promises	= [];

			for ( let i = 0; i < 10500; i ++ )
			{
				promises.push( bucket.reduce() );
			}

			Promise.all( promises ).then(( responses ) => {
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
	message	: 'Bucket.with.big.map.reduceRaceConditionWithRefill',
	test	: ( done ) => {
		const dataServer			= new DataServerMap( { persist: false, useBigMap: true } );
		const bucket				= new Bucket( 5000, 1, 10000, undefined, undefined, dataServer );
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

				Promise.all( promises ).then(( responses ) => {
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

test({
	message	: 'Bucket.with.big.map._doLock.if.max.counter.is.reached',
	test	: ( done ) => {
		const MockDataServer	= Mock( DataServerMap );
		const dataServer		= new MockDataServer( { persist: false, useBigMap: true } );
		const bucket			= new Bucket( undefined, undefined, undefined, undefined, undefined, dataServer );
		bucket.maxCounter		= 10;

		bucket.init().then( async () => {
			dataServer._mock({
				method			: 'lock',
				shouldReturn	: async () => {
					return false;
				}
			});

			const promise	= new Promise( ( resolve, reject ) => {
				bucket._doLock( resolve, reject, 0 ).catch( done );
			});

			promise.then(( status ) => { status === false ? done() : done( `Status should have been false but is ${status}` ); }).catch( done );
		});
	}
});

test({
	message	: 'Bucket.with.big.map.reduce.when.cannot.obtain.lock',
	test	: ( done ) => {
		const MockDataServer	= Mock( DataServerMap );
		const dataServer		= new MockDataServer( { persist: false, useBigMap: true } );
		const bucket			= new Bucket( undefined, undefined, undefined, undefined, undefined, dataServer );
		bucket.maxCounter		= 10;

		bucket.init().then( async () => {
			dataServer._mock({
				method			: 'lock',
				shouldReturn	: async () => {
					return false;
				}
			});

			await bucket.reduce().catch( done ) === false ? done() : done( 'Should not have reduced' );
		});
	}
});
