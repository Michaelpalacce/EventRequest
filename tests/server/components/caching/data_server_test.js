'use strict';

const DataServer			= require( '../../../../server/components/caching/data_server' );
const { assert, test }		= require( '../../../test_helper' );
const path					= require( 'path' );
const fs					= require( 'fs' );

const PROJECT_ROOT			= path.parse( require.main.filename ).dir;
const DEFAULT_PERSIST_FILE	= path.join( PROJECT_ROOT, 'cache' );

/**
 * @brief	For linux... wait a certain amount synchronously cause of fast file deletion, creation
 *
 * @param	Number ms
 */
function wait( ms )
{
	const start	= Date.now();
	let now		= start;

	while ( now - start < ms )
	{
		now	= Date.now();
	}
}

/**
 * @brief	Removes the cache file
 */
function removeCache( dataServer )
{
	// Wait cause of vagrant tests
	wait( 100 );
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
	test	: ( done ) => {
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
	test	: ( done ) => {
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
		setTimeout( () => {
			fs.writeFileSync( DEFAULT_PERSIST_FILE, JSON.stringify( data ) );

			const dataServer	= new DataServer();

			assert.deepStrictEqual( dataServer.server, data );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.constructor does not load data or set an interval for saving data if persist is false',
	test	: ( done ) => {
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
		setTimeout( () => {
			fs.writeFileSync( DEFAULT_PERSIST_FILE, JSON.stringify( data ) );

			const dataServer	= new DataServer( { persist: false } );

			assert.equal( dataServer.intervals.length, 1 );
			assert.deepStrictEqual( dataServer.server, {} );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.set sets data',
	test	: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( () => {
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= 'value';
			const ttl			= 100;
			const persist		= true;
			const expected		= { key: { key, value, ttl, persist } };
			let called			= 0;

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			dataServer.on( 'set', () => {
				called ++;
			});

			dataServer.set( key, value, ttl, { persist } );

			assert.equal( typeof dataServer.server[key] === 'object', true );

			const dataSet	= dataServer.server[key];

			assert.equal( dataSet.ttl, expected[key].ttl );
			assert.equal( dataSet.persist, expected[key].persist );
			assert.equal( dataSet.key, key );
			assert.equal( dataSet.value, value );
			assert.equal( typeof dataSet.expirationDate === 'number', true );
			assert.equal( called, 1 );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.set sets data without options',
	test	: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( () => {
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= 'value';
			const persist		= true;
			const ttl			= 100;
			const expected		= { key: { key, value, ttl, persist } };

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			dataServer.set( key, value, ttl );

			assert.equal( typeof dataServer.server[key] === 'object', true );

			const dataSet	= dataServer.server[key];

			assert.equal( dataSet.ttl, expected[key].ttl );
			assert.equal( dataSet.persist, expected[key].persist );
			assert.equal( dataSet.key, key );
			assert.equal( dataSet.value, value );
			assert.equal( typeof dataSet.expirationDate === 'number', true );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.set with ttl === -1',
	test	: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( () => {
			const dataServer	= new DataServer( { persist: false } );
			const key			= 'key';
			const value			= 'value';
			const ttl			= -1;
			const persist		= true;
			const expected		= { key: { key, value, ttl, persist } };

			assert.equal( dataServer.intervals.length, 1 );
			assert.deepStrictEqual( dataServer.server, {} );

			dataServer.set( key, value, ttl, { persist } );

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
		}, 10 );
	}
});

test({
	message			: 'DataServer.set fails on handleError',
	dataProvider	: [
		['key', 'value', 10, 123],
		['key', 'value', 10, 'str'],
		['key', 'value', 10, false],
		['key', 'value', null, { persist: false }],
		['key', 'value', [], { persist: false }],
		['key', 'value', 'str', { persist: false }],
		['key', 'value', false, { persist: false }],
		['key', 'value', {}, { persist: false }],
	],
	test			: ( done, key, value, ttl, options ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );

			assert.equal( await dataServer.set( key, value, ttl, options ), null );
			assert.equal( typeof dataServer.server[key] === 'object', false );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.get gets data',
	test	: ( done ) => {
		removeCache();
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );
			const key			= 'key';
			const value			= 'value';
			const ttl			= 100;
			const persist		= true;
			const expected		= { key: { key, value, ttl, persist } };
			let called			= 0;

			dataServer.on( 'get', () => {
				called ++;
			});

			assert.equal( dataServer.intervals.length, 1 );
			assert.deepStrictEqual( dataServer.server, {} );

			await dataServer.set( key, value, ttl, { persist } );

			assert.equal( typeof dataServer.server[key] === 'object', true );

			const dataSet	= await dataServer.get( key );
			assert.equal( dataSet, value );

			assert.equal( dataServer.server[key].ttl, expected[key].ttl );
			assert.equal( dataServer.server[key].persist, expected[key].persist );
			assert.equal( dataServer.server[key].key, key );
			assert.equal( typeof dataServer.server[key].expirationDate === 'number', true );
			assert.equal( called, 1 );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.get with invalid data',
	dataProvider	: [
		['key', 123],
		['key', false],
		[undefined, {}],
		[null, {}],
		[false, {}],
		[[], {}],
		[{}, {}],
	],
	test			: ( done, key, options ) => {
		removeCache();
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );

			assert.equal( await dataServer.get( key, options ), null );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.get prunes',
	test	: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );
			const key			= 'key';
			const value			= 'value';
			const ttl			= 1;
			const persist		= true;

			assert.equal( dataServer.intervals.length, 1 );
			assert.deepStrictEqual( dataServer.server, {} );

			await dataServer.set( key, value, ttl, { persist } );

			assert.equal( typeof dataServer.server[key] === 'object', true );

			setTimeout( async () => {
				const dataSet	= await dataServer.get( key );

				assert.equal( dataSet, null );

				removeCache( dataServer );
				done();
			}, 1100 );
		}, 10 );
	}
});

test({
	message	: 'DataServer.touch updates expirationDate',
	test	: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );
			const key			= 'key';
			const value			= 'value';
			const ttl			= 1;
			const persist		= true;
			let called			= 0;

			dataServer.on( 'touch', () => {
				called ++;
			});

			assert.equal( dataServer.intervals.length, 1 );
			assert.deepStrictEqual( dataServer.server, {} );

			await dataServer.set( key, value, ttl, { persist } );

			assert.equal( typeof dataServer.server[key] === 'object', true );
			const { expirationDate }	= dataServer.server[key];

			setTimeout( async () => {
				await dataServer.touch( key );
				const dataSet	= await dataServer.get( key );

				assert.equal( dataSet, value );
				const currentExpirationDate	= dataSet.expirationDate;
				assert.notEqual( currentExpirationDate, expirationDate );

				assert.equal( called, 1 );

				removeCache( dataServer );
				done();
			}, 100 );
		}, 10 );
	}
});

test({
	message			: 'DataServer.touch with invalid data',
	dataProvider	: [
		['key', '123', {}],
		[false, '123', {}],
		[[], '123', {}],
		[{}, '123', {}],
		[null, '123', {}],
		[undefined, '123', {}],
		['key', [], {}],
		['key', {}, {}],
		['key', false, {}],
		['key', null, {}],
		['key', null, 123],
		['key', null, 'string'],
		['key', null, false]
	],
	test			: ( done, key, ttl, options ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );
			await dataServer.set( key, '123' );

			assert.equal( await dataServer.touch( key, ttl, options ), false );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer._getExpirationDateFromTtl returns the correct time',
	test	: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( () => {
			const dataServer	= new DataServer( { persist: false } );
			const now			= Math.floor( ( new Date().getTime() / 1000 ) );

			assert.equal( Math.floor( dataServer._getExpirationDateFromTtl( 0 ) ), now + 300 );
			assert.equal( Math.floor( dataServer._getExpirationDateFromTtl( 5 ) ), now + 5 );
			assert.equal( dataServer._getExpirationDateFromTtl( -1 ), Infinity );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer garbageCollects',
	test	: ( done ) => {
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const key	= 'key';
			const dataServer	= new DataServer( { gcInterval: 1, ttl: 1 } );
			await dataServer.set( key, 'value' );

			assert.notEqual( await dataServer.get( key ), null );

			setTimeout( async () => {
				assert.equal( await dataServer.get( key ), null );

				removeCache( dataServer );
				done();
			}, 1100 );
		}, 10 );
	}
});

test({
	message	: 'DataServer persistsData',
	test	: ( done ) => {
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( () => {
			const key			= 'key';
			const keyTwo		= 'keyTwo';
			const keyThree		= 'keyThree';
			const dataServer	= new DataServer( { persistInterval: 2, persistPath: DEFAULT_PERSIST_FILE + '1' } );
			let saveCalled		= false;

			dataServer.on( '_saveData', () => {
				saveCalled	= true;
			});

			dataServer.set( key, 'value' );
			dataServer.set( keyTwo, 'value2', 1, true );
			dataServer.set( keyThree, 'value3', 10000, false );

			assert.notEqual( dataServer.get( key ), null );
			assert.notEqual( dataServer.get( keyTwo ), null );
			assert.notEqual( dataServer.get( keyThree ), null );

			setTimeout(() => {
				const content	= fs.readFileSync( DEFAULT_PERSIST_FILE + '1' );
				const data		= JSON.parse( content.toString( 'utf8' ) );

				assert.deepStrictEqual( Object.keys( data ), [key] );

				removeCache( dataServer );

				done( ! saveCalled );
			}, 2100 );
		}, 10 );
	}
});

test({
	message	: 'DataServer.stop removes data and unlinks file',
	test	: ( done ) => {
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( () => {
			const dataServer	= new DataServer();
			const key			= 'key';
			const value			= { test: 'value' };

			let stopCalled		= false;

			dataServer.on( 'stop', () => {
				stopCalled	= true;
			});

			assert.equal( dataServer.intervals.length, 2 );
			assert.deepStrictEqual( dataServer.server, {} );

			assert.equal( dataServer.set( key, value ) !== null, true );

			assert.equal( typeof dataServer.server[key] === 'object', true );
			assert.equal( fs.existsSync( dataServer.persistPath ), true );

			dataServer.stop();
			assert.deepStrictEqual( dataServer.server, {} );
			assert.equal( fs.existsSync( dataServer.persistPath ), false );

			removeCache( dataServer );
			done( ! stopCalled );
		}, 10 );
	}
});

test({
	message	: 'DataServer.delete removes key and returns true but returns false if it does not exist or not string',
	test	: ( done ) => {
		removeCache();

		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer({ persist: false });
			const key			= 'key';
			const value			= { test: 'value' };
			let called			= 0;

			dataServer.on( 'delete', () => {
				called ++;
			});

			await dataServer.set( key, value );

			assert.equal( await dataServer.delete( 123 ), false );
			assert.equal( await dataServer.delete( key ), true );
			assert.equal( await dataServer.delete( key ), true );
			// 2 because one is with invalid arguments
			assert.equal( called, 2 );

			dataServer.stop();

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message	: 'DataServer.increment increments data',
	dataProvider	: [
		[100, 100, 200],
		[0, 100, 100],
		[-1, 100, 99],
		['string', 100, null],
		[[], 100, null],
		[{}, 100, null],
		[100, null, null],
		[100, 'string', null],
		[100, {}, null],
		[100, [], null],
	],
	test	: async ( done, value, increment, expectedValue ) => {
		removeCache();

		const dataServer	= new DataServer({ persist: false });
		const key			= 'key';
		let called			= 0;

		dataServer.on( 'increment', () => {
			called ++;
		});

		await dataServer.set( key, value ).catch( done );

		const result	= await dataServer.increment( key, increment ).catch( done );

		if ( expectedValue === null )
		{
			dataServer.stop();
			removeCache( dataServer );
			return done( ! ( false === result ) );
		}

		if ( result === null )
		{
			return done( `Result was null but expected: ${expectedValue}` );
		}

		assert.equal( result, expectedValue );
		assert.equal( called, 1 );

		dataServer.stop();

		removeCache( dataServer );
		done();
	}
});

test({
	message	: 'DataServer.decrement decrement data',
	dataProvider	: [
		[100, 100, 0],
		[0, 100, -100],
		[1, 100, -99],
		['string', 100, null],
		[[], 100, null],
		[{}, 100, null],
		[100, null, null],
		[100, 'string', null],
		[100, {}, null],
		[100, [], null],
	],
	test	: async ( done, value, decrement, expectedValue ) => {
		removeCache();

		const dataServer	= new DataServer({ persist: false });
		const key			= 'key';
		let called			= 0;

		dataServer.on( 'decrement', () => {
			called ++;
		});

		await dataServer.set( key, value ).catch( done );

		const result	= await dataServer.decrement( key, decrement ).catch( done );

		if ( expectedValue === null )
		{
			dataServer.stop();
			removeCache( dataServer );
			return done( ! ( false === result ) );
		}

		if ( result === null )
		{
			return done( `Result was null but expected: ${expectedValue}` );
		}

		assert.equal( result, expectedValue );
		assert.equal( called, 1 );

		dataServer.stop();

		removeCache( dataServer );
		done();
	}
});

test({
	message			: 'DataServer.set does not set if invalid data',
	dataProvider	: [
		[null, 'value', 100, true],
		['key', null, 100, true],
		['key', 'value', null, true],
		[123, 'value', 100, true],
		['key', 'value', '100', true],
		['key', 'value', 100, 'true'],
		[null, 'value', 100, 'true'],
		[undefined, 'value', 100, 'true'],
		[[], 'value', 100, 'true'],
		[{}, 'value', 100, 'true'],
		[false, 'value', 100, 'true'],
	],
	test			: ( done, key, value, ttl, persist ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );

			assert.equal( dataServer.intervals.length, 1 );
			assert.deepStrictEqual( dataServer.server, {} );

			assert.equal( await dataServer.set( key, value, ttl, persist ), null );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.constructor on ttl === -1 saves data forever',
	test			: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false, ttl: -1 } );

			assert.deepStrictEqual( dataServer.server, {} );

			await dataServer.set( 'key', 1 );

			assert.deepStrictEqual( dataServer.server.key.expirationDate, Infinity );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.lock locks data correctly',
	test			: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );
			let called			= 0;

			dataServer.on( 'lock', () => {
				called ++;
			});

			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), false );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), false );

			assert.equal( called, 4 );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.lock locks data correctly with double unlock',
	test			: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );

			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), false );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), false );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.unlock always returns true',
	test			: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );
			let called			= 0;

			dataServer.on( 'unlock', () => {
				called ++;
			});

			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( await dataServer.lock( 'key' ), true );
			assert.equal( await dataServer.unlock( 'key' ), true );
			assert.equal( called, 3 );

			removeCache( dataServer );
			done();
		}, 10 );
	}
});

test({
	message			: 'DataServer.lock acquires only one lock',
	test			: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );
			const promises		= [];

			for ( let i = 0; i < 10000; i ++ )
				promises.push( dataServer.lock( 'key' ) );

			Promise.all( promises ).then(( locks ) => {
				let acquiredLocks	= 0;
				for ( const lock of locks )
				{
					if ( lock )
						acquiredLocks ++;
				}

				assert.equal( acquiredLocks, 1 );

				removeCache( dataServer );
				done();
			}).catch( done );
		}, 10 );
	}
});

test({
	message			: 'DataServer.lock acquires another lock with burst of locks',
	test			: ( done ) => {
		// Wait in case the file has not been deleted from the FS
		setTimeout( async () => {
			const dataServer	= new DataServer( { persist: false } );
			const promises		= [];

			for ( let i = 0; i < 50000; i ++ )
				promises.push( dataServer.lock( 'key' ) );

			promises.push( dataServer.unlock( 'key' ) );

			Promise.all( promises ).then(( locks ) => {
				let acquiredLocks	= 0;
				for ( const lock of locks )
				{
					if ( lock )
						acquiredLocks ++;
				}

				assert.equal( acquiredLocks, 2 );

				removeCache( dataServer );
				done();
			}).catch( done );
		}, 10 );
	}
});
