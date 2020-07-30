const { assert, test }	= require( '../../../test_helper' );
const BigMap			= require( '../../../../server/components/big_map/big_map' );

test({
	message	: 'BigMap.constructor',
	test	: ( done ) => {
		const map	= new BigMap();

		assert.deepStrictEqual( map.maps, [new Map()] );
		assert.deepStrictEqual( map._limit, 8000000 );

		done();
	}
});

test({
	message	: 'BigMap.constructor.with.params',
	test	: ( done ) => {
		const init	= [[1, 'value'],[2, 'valueTwo']];
		const map	= new BigMap( init );

		assert.deepStrictEqual( map.maps, [new Map( init )] );
		assert.deepStrictEqual( map._limit, 8000000 );

		done();
	}
});

test({
	message	: 'BigMap.set',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 'key', 'value' );

		assert.deepStrictEqual( map.get( 'key' ), 'value' );
		assert.deepStrictEqual( map.maps, [new Map([['key', 'value']])] );

		done();
	}
});

test({
	message	: 'BigMap.set.with.not.a.string',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, 'value' );
		map.set( true, 'value' );

		assert.deepStrictEqual( map.get( 1 ), 'value' );
		assert.deepStrictEqual( map.get( true ), 'value' );

		done();
	}
});

test({
	message	: 'BigMap.set.twice',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 'key', 'value' );
		map.set( 'key', 'value' );

		assert.deepStrictEqual( map.get( 'key' ), 'value' );
		assert.deepStrictEqual( map.maps, [new Map([['key', 'value']])] );

		done();
	}
});

test({
	message	: 'BigMap.set.if.limit.is.reached',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 'key', 'value' );
		map.set( 'keyTwo', 'value' );

		assert.deepStrictEqual( map.get( 'key' ), 'value' );
		assert.deepStrictEqual( map.maps, [new Map([['key', 'value']]), new Map([['keyTwo', 'value']])] );

		done();
	}
});

test({
	message	: 'BigMap.get',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 'key', 'value' );

		assert.deepStrictEqual( map.get( 'key' ), 'value' );

		done();
	}
});

test({
	message	: 'BigMap.get.when.not.exists',
	test	: ( done ) => {
		const map	= new BigMap();

		assert.deepStrictEqual( map.get( 'key' ), undefined );

		done();
	}
});

test({
	message	: 'BigMap.get.when.key.is.in.another.bucket',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, 'value' );
		map.set( 2, 'value' );
		map.set( 3, 'value' );
		map.set( 4, 'value' );
		map.set( 5, 'value' );

		assert.deepStrictEqual( map.get( 3 ), 'value' );

		done();
	}
});

test({
	message	: 'BigMap.delete.when.key.is.in.another.bucket.deletes.bucket.when.empty',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, 'value' );
		map.set( 2, 'value' );
		map.set( 3, 'value' );
		map.set( 4, 'value' );
		map.set( 5, 'value' );

		assert.deepStrictEqual( map.delete( 3 ), true );
		assert.deepStrictEqual( map.get( 3 ), undefined );
		assert.deepStrictEqual( map.maps, [new Map([[1, 'value']]),new Map([[2, 'value']]),new Map([[4, 'value']]),new Map([[5, 'value']])] );

		done();
	}
});

test({
	message	: 'BigMap.delete.does.not.delete.if.last.bucket',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, 'value' );

		assert.deepStrictEqual( map.delete( 1 ), true );
		assert.deepStrictEqual( map.get( 1 ), undefined );
		assert.deepStrictEqual( map.maps, [new Map()] );

		done();
	}
});

test({
	message	: 'BigMap.delete',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, 'value' );
		map.set( 2, 'value' );

		assert.deepStrictEqual( map.delete( 1 ), true );
		assert.deepStrictEqual( map.delete( 1 ), false );
		assert.deepStrictEqual( map.get( 1 ), undefined );
		assert.deepStrictEqual( map.maps, [new Map([[2, 'value']])] );

		done();
	}
});

test({
	message	: 'BigMap.has',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, 'value' );

		assert.deepStrictEqual( map.has( 1 ), true );

		done();
	}
});

test({
	message	: 'BigMap.has.when.not.has',
	test	: ( done ) => {
		const map	= new BigMap();

		assert.deepStrictEqual( map.has( 1 ), false );

		done();
	}
});

test({
	message	: 'BigMap.clear.clears.all.maps',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, 'value' );
		map.set( 2, 'value' );
		map.set( 3, 'value' );
		map.set( 4, 'value' );
		map.set( 5, 'value' );

		map.clear();

		assert.deepStrictEqual( map.maps, [new Map()] );

		done();
	}
});

test({
	message	: 'BigMap.size.with.one.map',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, 'value' );
		map.set( 2, 'value' );
		map.set( 3, 'value' );
		map.set( 4, 'value' );
		map.set( 5, 'value' );

		assert.deepStrictEqual( map.size, 5 );

		done();
	}
});

test({
	message	: 'BigMap.size.with.many.maps',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, 'value' );
		map.set( 2, 'value' );
		map.set( 3, 'value' );
		map.set( 4, 'value' );
		map.set( 5, 'value' );

		assert.deepStrictEqual( map.size, 5 );

		done();
	}
});

test({
	message	: 'BigMap.forEach.with.one.map',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		map.forEach( ( value, key, mapForEach ) => {
			counter ++;
			assert.deepStrictEqual( counter, key );
			assert.deepStrictEqual( `${counter}value`, value );
			assert.deepStrictEqual( mapForEach, map );
		});

		counter = 0;

		map.forEach( ( value, key, mapForEach ) => {
			counter ++;
			assert.deepStrictEqual( counter, key );
			assert.deepStrictEqual( `${counter}value`, value );
			assert.deepStrictEqual( mapForEach, map );
		}, map );

		done();
	}
});

test({
	message	: 'BigMap.forEach.with.many.maps',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		map.forEach( ( value, key, mapForEach ) => {
			counter ++;
			assert.deepStrictEqual( counter, key );
			assert.deepStrictEqual( `${counter}value`, value );
			assert.deepStrictEqual( mapForEach, map );
		});

		counter = 0;

		map.forEach( ( value, key, mapForEach ) => {
			counter ++;
			assert.deepStrictEqual( counter, key );
			assert.deepStrictEqual( `${counter}value`, value );
			assert.deepStrictEqual( mapForEach, map );
		}, map );

		done();
	}
});

test({
	message	: 'BigMap.entries.with.one.map',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		for ( const entry of map.entries() )
		{
			counter ++;
			assert.deepStrictEqual( entry, [counter, `${counter}value`] );
		}

		done();
	}
});


test({
	message	: 'BigMap.entries.with.many.map',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		for ( const entry of map.entries() )
		{
			counter ++;
			assert.deepStrictEqual( entry, [counter, `${counter}value`] );
		}

		done();
	}
});

test({
	message	: 'BigMap.for.of.with.one.map',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		for ( const entry of map )
		{
			counter ++;
			assert.deepStrictEqual( entry, [counter, `${counter}value`] );
		}

		done();
	}
});


test({
	message	: 'BigMap.for.of.with.many.maps',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		for ( const entry of map )
		{
			counter ++;
			assert.deepStrictEqual( entry, [counter, `${counter}value`] );
		}

		done();
	}
});

test({
	message	: 'BigMap.keys.with.one.map',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		for ( const key of map.keys() )
		{
			counter ++;
			assert.deepStrictEqual( key, counter );
		}

		done();
	}
});

test({
	message	: 'BigMap.keys.with.many.map',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		for ( const key of map.keys() )
		{
			counter ++;
			assert.deepStrictEqual( key, counter );
		}

		done();
	}
});

test({
	message	: 'BigMap.values.with.one.map',
	test	: ( done ) => {
		const map	= new BigMap();

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		for ( const value of map.values() )
		{
			counter ++;
			assert.deepStrictEqual( value, `${counter}value` );
		}

		done();
	}
});

test({
	message	: 'BigMap.values.with.many.map',
	test	: ( done ) => {
		const map	= new BigMap();
		map._limit	= 1;

		map.set( 1, '1value' );
		map.set( 2, '2value' );
		map.set( 3, '3value' );
		map.set( 4, '4value' );
		map.set( 5, '5value' );

		let counter	= 0;

		for ( const value of map.values() )
		{
			counter ++;
			assert.deepStrictEqual( value, `${counter}value` );
		}

		done();
	}
});
