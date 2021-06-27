'use strict';

const { assert, test, helpers }	= require( '../../../test_helper' );
const CacheControl				= require( './../../../../server/components/cache-control/cache_control' );

test({
	message	: 'CacheControl.constructor.on.defaults',
	test	: ( done ) => {
		const builder	= new CacheControl();

		assert.deepStrictEqual( builder.options, {} );

		done();
	}
});

const dataProvider	= [
	[
		{
			static			: true
		},
		{
			cacheControl			: 'public',
			expirationDirectives	: {
				'max-age'	: 604800
			},
			revalidation: 'immutable'
		},
		'public, max-age=604800, immutable'
	],
	[
		{
			static			: false
		},
		{},
		''
	],
	[
		{
			static			: 123
		},
		{},
		''
	],
	[
		{
			cacheControl	: 'private'
		},
		{
			cacheControl	: 'private'
		},
		'private'
	],
	[
		{
			cacheControl	: 'no-cache'
		},
		{
			cacheControl	: 'no-cache'
		},
		'no-cache'
	],
	[
		{
			cacheControl	: 'no-store'
		},
		{
			cacheControl	: 'no-store'
		},
		'no-store'
	],
	[
		{
			expirationDirectives	: {
				'max-age'	: 123
			}
		},
		{
			expirationDirectives	: {
				'max-age'	: 123
			}
		},
		'max-age=123'
	],
	[
		{
			expirationDirectives	: {
				's-maxage'	: 123
			}
		},
		{
			expirationDirectives	: {
				's-maxage'	: 123
			}
		},
		's-maxage=123'
	],
	[
		{
			expirationDirectives	: {
				'max-stale'	: 123
			}
		},
		{
			expirationDirectives	: {
				'max-stale'	: 123
			}
		},
		'max-stale=123'
	],
	[
		{
			expirationDirectives	: {
				'min-fresh'	: 123
			}
		},
		{
			expirationDirectives	: {
				'min-fresh'	: 123
			}
		},
		'min-fresh=123'
	],
	[
		{
			expirationDirectives	: {
				'stale-while-revalidate'	: 123
			}
		},
		{
			expirationDirectives	: {
				'stale-while-revalidate'	: 123
			}
		},
		'stale-while-revalidate=123'
	],
	[
		{
			expirationDirectives	: {
				'stale-if-errors'	: 123
			}
		},
		{
			expirationDirectives	: {
				'stale-if-errors'	: 123
			}
		},
		'stale-if-errors=123'
	],
	[
		{
			revalidation	: 'must-revalidate'
		},
		{
			revalidation	: 'must-revalidate'
		},
		'must-revalidate'
	],
	[
		{
			revalidation	: 'proxy-revalidate'
		},
		{
			revalidation	: 'proxy-revalidate'
		},
		'proxy-revalidate'
	],
	[
		{
			revalidation	: 'immutable'
		},
		{
			revalidation	: 'immutable'
		},
		'immutable'
	],
	[
		{
			other	: 'no-transform'
		},
		{
			other	: 'no-transform'
		},
		'no-transform'
	],
	[
		{
			other	: 'only-if-cached'
		},
		{},
		''
	],
	[
		{
			other					: 'no-transform',
			expirationDirectives	: {
				'max-age'	: 123,
				's-maxage'	: 'wrong'
			},
			revalidation			: 'must-revalidate'
		},
		{
			other					: 'no-transform',
			expirationDirectives	: {
				'max-age'	: 123,
			},
			revalidation			: 'must-revalidate'
		},
		'max-age=123, must-revalidate, no-transform'
	],
	[
		{
			cacheControl			: 'private',
			other					: 'only-if-cached',
			expirationDirectives	: {
				'max-age'	: 123,
				'min-fresh'	: 123123,
				's-maxage'	: 'wrong'
			},
			revalidation			: 'must-revalidate',
			wrong					: '123123'
		},
		{
			cacheControl			: 'private',
			expirationDirectives	: {
				'max-age'	: 123,
				'min-fresh'	: 123123,
			},
			revalidation			: 'must-revalidate'
		},
		'private, max-age=123, min-fresh=123123, must-revalidate'
	],
	[
		{
			revalidation	: 'wrong'
		},
		{},
		''
	],
	[
		{
			other	: 'wrong'
		},
		{},
		''
	],
	[
		{
			expirationDirectives	: {
				'max-age'	: 'wrong'
			}
		},
		{},
		''
	],
	[
		{
			expirationDirectives	: {
				'stale-if-errors'	: 'wrong'
			}
		},
		{},
		''
	],
	[
		{
			expirationDirectives	: {
				'stale-while-revalidate'	: 'wrong'
			}
		},
		{},
		''
	],
	[
		{
			expirationDirectives	: {
				'min-fresh'	: 'wrong'
			}
		},
		{},
		''
	],
	[
		{
			expirationDirectives	: {
				'max-stale'	: 'wrong'
			}
		},
		{},
		''
	],
	[
		{
			expirationDirectives	: {
				's-maxage'	: 'wrong'
			}
		},
		{},
		''
	],
	[
		{
			cacheControl	: 'wrong'
		},
		{},
		''
	],
	[
		{},
		{},
		''
	],
];

test({
	message	: 'CacheControl._configure',
	dataProvider,
	test	: ( done, options, expectedOptions, expectedBuildResult ) => {
		const builder	= new CacheControl();

		builder._configure( options )

		assert.deepStrictEqual( builder.options, expectedOptions );

		done();
	}
});

test({
	message	: 'CacheControl._configure.with.options',
	dataProvider,
	test	: ( done, options, expectedOptions, expectedBuildResult ) => {
		const builder	= new CacheControl();

		builder._configure( options );

		assert.deepStrictEqual( builder.options, expectedOptions );

		done();
	}
});

test({
	message	: 'CacheControl._configure.with.nothing',
	dataProvider,
	test	: ( done ) => {
		const builder	= new CacheControl();

		builder._configure();

		assert.deepStrictEqual( builder.options, {} );

		done();
	}
});

test({
	message	: 'CacheControl.build',
	dataProvider,
	test	: ( done, options, expectedOptions, expectedBuildResult ) => {
		const builder	= new CacheControl();

		assert.deepStrictEqual( builder.build( options ), expectedBuildResult );

		done();
	}
});

test({
	message	: 'CacheControl.build.resets.options.and.can.build.again',
	dataProvider,
	test	: ( done, options, expectedOptions, expectedBuildResult ) => {
		const builder	= new CacheControl();

		assert.deepStrictEqual( builder.build( options ), expectedBuildResult );
		assert.deepStrictEqual( builder.options, {} );
		assert.deepStrictEqual( builder.build(), '' );

		done();
	}
});
