'use strict';

const { Mock, assert, test, helpers, Mocker }	= require( '../../../test_helper' );
const ValidationRules							= require( './../../../../server/components/validation/validation_rules' );

test({
	message	: 'ValidationRules assertStrictEqual',
	test	: ( done )=>{
		let testProvider	= [
			{
				first	: 0,
				second	: 0,
				result	: true
			},
			{
				first	: '1',
				second	: '1',
				result	: true
			},
			{
				first	: 'string',
				second	: 'string',
				result	: true
			},
			{
				first	: true,
				second	: true,
				result	: true
			},
			{
				first	: 0,
				second	: '0',
				result	: false
			},
			{
				first	: '1',
				second	: 1,
				result	: false
			},
			{
				first	: 'string',
				second	: 'wrong',
				result	: false
			},
			{
				first	: 0,
				second	: false,
				result	: false
			}
		];

		testProvider.forEach( ( value )=>{
			let shouldBeEqual	= value.result;
			let result			= ValidationRules.assertStrictEqual( value.first, value.second );

			assert.equal( result, shouldBeEqual );
		});

		done();
	}
});

test({
	message	: 'ValidationRules assertEqual',
	test	: ( done )=>{
		let testProvider	= [
			{
				first	: 0,
				second	: 0,
				result	: true
			},
			{
				first	: '1',
				second	: '1',
				result	: true
			},
			{
				first	: 'string',
				second	: 'string',
				result	: true
			},
			{
				first	: true,
				second	: true,
				result	: true
			},
			{
				first	: 0,
				second	: '0',
				result	: true
			},
			{
				first	: '1',
				second	: 1,
				result	: true
			},
			{
				first	: 'string',
				second	: 'wrong',
				result	: false
			},
			{
				first	: 0,
				second	: false,
				result	: true
			}
		];

		testProvider.forEach( ( value )=>{
			let shouldBeEqual	= value.result;
			let result			= ValidationRules.assertEqual( value.first, value.second );

			assert.equal( result, shouldBeEqual );
		});

		done();
	}
});
