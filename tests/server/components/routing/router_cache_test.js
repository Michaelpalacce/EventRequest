'use strict';

// Dependencies
const { assert, test, helpers, tester }	= require( '../../../test_helper' );
const RouterCache						= require( '../../../../server/components/routing/router_cache' );

test({
	message	: 'RouterCache.constructor',
	test	: ( done ) => {
		const cache	= new RouterCache();

		assert.deepStrictEqual( cache._cache, {} );
		assert.deepStrictEqual( cache.keyLimit, 5000 );
		assert.deepStrictEqual( cache.lastClearCacheAttempt, 0 );
		assert.deepStrictEqual( cache.ttl, 60 * 60 * 1000 );
		assert.deepStrictEqual( cache.cacheClearDebounce, 60 * 1000 );
		assert.deepStrictEqual( RouterCache.DEFAULT_KEY_LIMIT, 5000 );

		done();
	}
});

test({
	message	: 'RouterCache.setKeyLimit',
	test	: ( done ) => {
		const cache	= new RouterCache();

		cache.setKeyLimit( 500 );
		assert.deepStrictEqual( cache.keyLimit, 500 );

		done();
	}
});

test({
	message	: 'RouterCache.setKeyLimit.with.no.argument.sets.key.to.default',
	test	: ( done ) => {
		const cache	= new RouterCache();

		cache.setKeyLimit();
		assert.deepStrictEqual( cache.keyLimit, 5000 );

		done();
	}
});

test({
	message	: 'RouterCache.getBlock.returns.block.if.block.exists',
	test	: ( done ) => {
		const cache	= new RouterCache();
		const key	= 'blockKey';
		const block	= { date: Date.now(), params: {}, block: [] };

		cache.setBlock( key, block );
		assert.deepStrictEqual( cache.getBlock( key ).params, block.params );
		assert.deepStrictEqual( cache.getBlock( key ).block, block.block );
		assert.deepStrictEqual( typeof cache.getBlock( key ).date === 'number', true );

		done();
	}
});

test({
	message	: 'RouterCache.getBlock.returns.null.if.block.does.not.exist',
	test	: ( done ) => {
		const cache	= new RouterCache();
		const key	= 'blockKey';

		assert.deepStrictEqual( cache.getBlock( key ), null );

		done();
	}
});

test({
	message	: 'RouterCache.getBlock.clears',
	test	: ( done ) => {
		const cache					= new RouterCache();
		const key					= 'blockKey';
		const keyTwo				= 'blockKeyTwo';

		cache.ttl					= 100;
		cache.cacheClearDebounce	= 0;

		cache.setBlock( key, { params: {}, block: [] } );

		setTimeout(() => {
			const { date }	= cache.setBlock( keyTwo, { params: {}, block: [] } );

			setTimeout(() => {
				const activeBlock	= cache.getBlock( keyTwo );

				assert.deepStrictEqual( cache.getBlock( key ), null );
				assert.deepStrictEqual( activeBlock !== null, true );
				assert.deepStrictEqual( activeBlock.date !== date, true );
				done();
			}, 50 );
		}, 75 );
	}
});

test({
	message	: 'RouterCache.getBlock.renews',
	test	: ( done ) => {
		const cache	= new RouterCache();
		const key	= 'blockKey';
		const block	= cache.setBlock( key, { params: {}, block: [] } );

		setTimeout(() => {
			const { date }	= cache.getBlock( key );

			assert.deepStrictEqual( block.date, date );

			done();
		}, 75 );
	}
});

test({
	message	: 'RouterCache._renewBlock.renews',
	test	: ( done ) => {
		const cache	= new RouterCache();
		const key	= 'blockKey';
		const block	= cache.setBlock( key, { params: {}, block: [] } );

		setTimeout(() => {
			const { date }	= cache._renewBlock( block );

			assert.deepStrictEqual( block.date, date );

			done();
		}, 75 );
	}
});

test({
	message	: 'RouterCache.deleteBlock.deletes',
	test	: ( done ) => {
		const cache	= new RouterCache();
		const key	= 'blockKey';
		cache.setBlock( key, { params: {}, block: [] } );


		assert.deepStrictEqual( cache.getBlock( key ) !== null, true );
		cache.deleteBlock( key );
		assert.deepStrictEqual( cache.getBlock( key ) !== null, false );
		cache.deleteBlock( key );
		assert.deepStrictEqual( cache.getBlock( key ) !== null, false );

		done();
	}
});

test({
	message	: 'RouterCache.setBlock.sets.a.new.block.and.updates.date',
	test	: ( done ) => {
		const cache	= new RouterCache();
		const key	= 'blockKey';

		const block	= cache.setBlock( key, { params: {}, block: [] } );

		assert.deepStrictEqual( typeof block.date, 'number' );
		assert.deepStrictEqual( typeof cache._cache[key], 'object' );

		done();
	}
});

test({
	message	: 'RouterCache.clear',
	test	: ( done ) => {
		const cache					= new RouterCache();
		const key					= 'blockKey';
		const keyTwo				= 'blockKeyTwo';

		cache.ttl					= 100;
		cache.cacheClearDebounce	= 0;

		cache.setBlock( key, { params: {}, block: [] } );

		setTimeout(() => {
			cache.setBlock( keyTwo, { params: {}, block: [] } );

			setTimeout(() => {
				cache.clear();

				assert.deepStrictEqual( cache._cache[key], undefined );
				assert.deepStrictEqual( cache._cache[keyTwo] !== undefined, true );
				done();
			}, 50 );
		}, 75 );
	}
});

test({
	message	: 'RouterCache.clear.with.debounce',
	test	: ( done ) => {
		const cache					= new RouterCache();
		const key					= 'blockKey';

		cache.ttl					= 10;
		cache.cacheClearDebounce	= 50;

		cache.setBlock( key, { params: {}, block: [] } );
		cache.lastClearCacheAttempt	= Date.now();
		setTimeout(() => {
			cache.clear();
			cache.clear();
			cache.clear();
			cache.clear();
			assert.deepStrictEqual( typeof cache._cache[key], 'object' );

			setTimeout(() => {
				cache.clear();
				assert.deepStrictEqual( cache._cache[key], undefined );
				done();
			}, 60 );
		}, 10 );
	}
});

test({
	message	: 'RouterCache.isFull.when.not.full',
	test	: ( done ) => {
		const cache	= new RouterCache();

		cache.setBlock( '1', {} );

		assert.deepStrictEqual( cache.isFull(), false );

		done();
	}
});

test({
	message	: 'RouterCache.isFull.when.full',
	test	: ( done ) => {
		const cache	= new RouterCache();
		cache.setKeyLimit( 1 );

		cache.setBlock( '1', {} );

		assert.deepStrictEqual( cache.isFull(), true );

		done();
	}
});

test({
	message	: 'RouterCache.isFull.when.keyLimits.is.zero',
	test	: ( done ) => {
		const cache	= new RouterCache();
		cache.setKeyLimit( 0 );

		cache.setBlock( '1', {} );
		cache.setBlock( '2', {} );

		assert.deepStrictEqual( cache.isFull(), false );

		done();
	}
});
