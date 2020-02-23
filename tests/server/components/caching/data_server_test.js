'use strict';

const DataServer			= require( '../../../../server/components/caching/data_server' );
const { assert, test }		= require( '../../../test_helper' );
const path					= require( 'path' );
const fs					= require( 'fs' );

const PROJECT_ROOT			= path.parse( require.main.filename ).dir;
const DEFAULT_PERSIST_FILE	= path.join( PROJECT_ROOT, 'cache' );

/**
 * @brief	Removes the cache file
 */
function removeCache( dataServer )
{
	if ( dataServer )
	{
		dataServer.stop();
	}
	else
	{
		if ( fs.existsSync( DEFAULT_PERSIST_FILE ) )
			fs.unlinkSync( DEFAULT_PERSIST_FILE );
	}
}

test({
	message	: 'DataServer.constructor sets defaults and creates file if it does not exist',
	test	: ( done )=>{
		removeCache();

		const dataServer	= new DataServer();

		assert.deepEqual( dataServer.server, {} );
		assert.equal( dataServer.defaultTtl, 300 );
		assert.equal( dataServer.persistPath, DEFAULT_PERSIST_FILE );
		assert.equal( fs.existsSync( dataServer.persistPath ), true );
		assert.equal( dataServer.persistInterval, 10000 );
		assert.equal( dataServer.intervals.length, 2 );

		removeCache( dataServer );
		done();
	}
});

test({
	message	: 'DataServer.constructor loads data if file exists',
	test	: ( done )=>{
		const ttl	= 50;
		const value	= { route: '/get' };
		const now	= ( new Date().getTime() / 1000 );

		const data	= {
			test: {
				key: 'test',
				value,
				ttl,
				expirationDate: now + ttl,
				persist: true
			}
		};

		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			fs.writeFileSync( DEFAULT_PERSIST_FILE, JSON.stringify( data ) );

			const dataServer	= new DataServer();

			assert.deepStrictEqual( dataServer.server, data );

			removeCache( dataServer );
			done();
		}, 50 );
	}
});

test({
	message	: 'DataServer.constructor does not load data or set an interval for saving data if persist is false',
	test	: ( done )=>{
		const ttl	= 50;
		const value	= { route: '/get' };
		const now	= ( new Date().getTime() / 1000 );

		const data	= {
			test: {
				key: 'test',
				value,
				ttl,
				expirationDate: now + ttl,
				persist: true
			}
		};

		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			fs.writeFileSync( DEFAULT_PERSIST_FILE, JSON.stringify( data ) );

			const dataServer	= new DataServer( { persist: false } );

			assert.equal( dataServer.intervals.length, 1 );
			assert.deepStrictEqual( dataServer.server, {} );

			removeCache( dataServer );
			done();
		}, 50 );
	}
});

test({
	message	: 'DataServer.set sets data',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= 'value';
			const ttl			= 100;
			const persist		= true;
			const expected		= { key: { key, value, ttl, persist } };

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			dataServer.set( key, value, ttl, persist );

			assert.equal( typeof dataServer.server[key] === 'object', true );

			const dataSet	= dataServer.server[key];

			assert.equal( dataSet.ttl, expected[key].ttl );
			assert.equal( dataSet.persist, expected[key].persist );
			assert.equal( dataSet.key, key );
			assert.equal( dataSet.value, value );
			assert.equal( typeof dataSet.expirationDate === 'number', true );

			removeCache( dataServer );
			done();
		}, 50 );
	}
});

test({
	message	: 'DataServer.set with ttl === -1',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= 'value';
			const ttl			= -1;
			const persist		= true;
			const expected		= { key: { key, value, ttl, persist } };

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			dataServer.set( key, value, ttl, persist );

			assert.equal( typeof dataServer.server[key] === 'object', true );

			const dataSet	= dataServer.server[key];

			assert.equal( dataSet.ttl, expected[key].ttl );
			assert.equal( dataSet.expirationDate, Infinity );
			assert.equal( dataSet.persist, expected[key].persist );
			assert.equal( dataSet.key, key );
			assert.equal( dataSet.value, value );
			assert.equal( typeof dataSet.expirationDate === 'number', true );

			removeCache( dataServer );
			done();
		}, 50 );
	}
});

test({
	message	: 'DataServer.get gets data',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= 'value';
			const ttl			= 100;
			const persist		= true;
			const expected		= { key: { key, value, ttl, persist } };

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			dataServer.set( key, value, ttl, persist );

			assert.equal( typeof dataServer.server[key] === 'object', true );

			const dataSet	= dataServer.get( key );

			assert.equal( dataSet.ttl, expected[key].ttl );
			assert.equal( dataSet.persist, expected[key].persist );
			assert.equal( dataSet.key, key );
			assert.equal( dataSet.value, value );
			assert.equal( typeof dataSet.expirationDate === 'number', true );

			removeCache( dataServer );
			done();
		}, 50 );
	}
});

test({
	message	: 'DataServer.get prunes',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= 'value';
			const ttl			= 1;
			const persist		= true;

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			dataServer.set( key, value, ttl, persist );

			assert.equal( typeof dataServer.server[key] === 'object', true );

			setTimeout(()=>{
				const dataSet	= dataServer.get( key );

				assert.equal( dataSet, null );

				removeCache( dataServer );
				done();
			}, 1100 );
		}, 50 );
	}
});

test({
	message	: 'DataServer.touch updates expirationDate',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= 'value';
			const ttl			= 1;
			const persist		= true;

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			dataServer.set( key, value, ttl, persist );

			assert.equal( typeof dataServer.server[key] === 'object', true );
			const { expirationDate }	= dataServer.server[key];

			setTimeout(()=>{
				dataServer.touch( key );
				const dataSet	= dataServer.get( key );

				assert.equal( typeof dataSet === 'object', true );
				const currentExpirationDate	= dataSet.expirationDate;

				assert.notEqual( currentExpirationDate, expirationDate );

				removeCache( dataServer );
				done();
			}, 10 );
		}, 50 );
	}
});

test({
	message	: 'DataServer._getExpirationDateFromTtl returns the correct time',
	test	: ( done )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();
			const now			= Math.floor( ( new Date().getTime() / 1000 ) );

			assert.equal( Math.floor( dataServer._getExpirationDateFromTtl( 0 ) ), now + 300 );
			assert.equal( Math.floor( dataServer._getExpirationDateFromTtl( 5 ) ), now + 5 );
			assert.equal( dataServer._getExpirationDateFromTtl( -1 ), Infinity );

			removeCache( dataServer );
			done();
		}, 50 );
	}
});

test({
	message	: 'DataServer garbageCollects',
	test	: ( done )=>{
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const key	= 'key';
			const dataServer	= new DataServer( { gcInterval: 1, ttl: 1 } );
			dataServer.set( key, 'value' );

			assert.notEqual( dataServer.get( key ), null );

			setTimeout(()=>{
				assert.equal( dataServer.get( key ), null );

				removeCache( dataServer );
				done();
			}, 1100 );
		}, 50 );
	}
});

test({
	message	: 'DataServer persistsData',
	test	: ( done )=>{
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const key			= 'key';
			const keyTwo		= 'keyTwo';
			const keyThree		= 'keyThree';
			const dataServer	= new DataServer( { persistInterval: 2, persistPath: DEFAULT_PERSIST_FILE + '1' } );
			dataServer.set( key, 'value' );
			dataServer.set( keyTwo, 'value2', 1, true );
			dataServer.set( keyThree, 'value3', 10000, false );

			assert.notEqual( dataServer.get( key ), null );
			assert.notEqual( dataServer.get( keyTwo ), null );
			assert.notEqual( dataServer.get( keyThree ), null );

			setTimeout(()=>{
				const content	= fs.readFileSync( DEFAULT_PERSIST_FILE + '1' );
				const data		= JSON.parse( content.toString( 'utf8' ) );

				assert.deepStrictEqual( Object.keys( data ), [key] );

				removeCache( dataServer );

				done();
			}, 2100 );
		}, 50 );
	}
});

test({
	message	: 'DataServer.stop removes data and unlinks file',
	test	: ( done )=>{
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= { test: 'value' };

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			assert.equal( dataServer.set( key, value ) !== null, true );

			assert.equal( typeof dataServer.server[key] === 'object', true );
			assert.equal( fs.existsSync( dataServer.persistPath ), true );

			dataServer.stop();
			assert.deepStrictEqual( dataServer.server, {} );
			assert.equal( fs.existsSync( dataServer.persistPath ), false );

			removeCache( dataServer );
			done();
		}, 50 );
	}
});

test({
	message	: 'DataServer.delete removes key and returns true but returns false if it does not exist or not string',
	test	: ( done )=>{
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= { test: 'value' };

			dataServer.set( key, value );

			assert.equal( dataServer.delete( 123 ), false );
			assert.equal( dataServer.delete( key ), true );
			assert.equal( dataServer.delete( key ), false );

			dataServer.stop();

			removeCache( dataServer );
			done();
		}, 50 );
	}
});

test({
	message			: 'DataServer.set does not set if invalid data',
	dataProvider	: [
		[null, 'value', 100, true],
		['key', null, 100, true],
		['key', 'value', null, true],
		['key', 'value', 100, null],
		[123, 'value', 100, true],
		['key', 'value', '100', true],
		['key', 'value', 100, 'true'],
	],
	test			: ( done, key, value, ttl, persist )=>{
		// Wait in case the file has not been deleted from the FS
		setTimeout( ()=>{
			const dataServer	= new DataServer();

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			assert.equal( dataServer.set( key, value, ttl, persist ), null );

			removeCache( dataServer );
			done();
		}, 50 );
	}
});
