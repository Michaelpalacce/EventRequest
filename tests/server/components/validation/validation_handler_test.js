'use strict';

const { assert, test }	= require( '../../../test_helper' );
const validationHandler	= require( './../../../../server/components/validation/validation_handler' );

test({
	message	: 'ValidationHandler.validation',
	test	: ( done ) => {
		const dataToValidate	= {
			testOne	: 123,
			testTwo	: '123',
			123			: [1,2,3,4,5],
			testThree	: {
				'deepOne'	: 123,
				deepTwo		: {
					deeperOne	: 123,
					deeperTwo	: '123',
					deeperFour	: '4'
				},
				deepThree	: [
					{
						deepThreeOne: 'stringOne',
						deepThreeTwo: '1542'
					},
					{
						deepThreeOne: 'stringOne',
						deepThreeTwo: 1542,
					}
				]
			},
			testFour	: true,
			testFive	: 'true',
			testSix		: '1',
		};

		const result	= validationHandler.validate(
			dataToValidate,
			{
				testOne		: 'string||range:2-4',
				testTwo		: 'numeric||range:123-124',
				123			: 'array||range:4-6',
				testThree	: {
					deepOne		: 'numeric||range:122-124',
					deepTwo		: {
						deeperOne	: 'string||range:2-4',
						deeperTwo	: 'numeric||range:123-124',
						deeperThree	: { $rules: 'optional||min:2||max:5', $default: 4 },
						deeperFour	: { $rules: 'optional||numeric||min:2||max:5', $default: 4 }
					},
					deepThree	: [
						{
							deepThreeOne: 'string',
							deepThreeTwo: 'numeric',
						}
					]
				},
				testFour	: 'boolean',
				testFive	: 'boolean',
				testSix		: 'boolean',
				testSeven	: { $rules: 'optional||min:2||max:5', $default: 4 }
			}
		);

		assert.equal( result.hasValidationFailed(), false );
		assert.deepStrictEqual(
			result.getValidationResult(),
			{
				'123'	: [1,2,3,4,5],
				testOne	: '123',
				testTwo	: 123,
				testThree	: {
					deepOne		: 123,
					deepTwo		: {
						deeperOne	: '123',
						deeperTwo	: 123,
						deeperThree	: 4,
						deeperFour	: 4
					},
					deepThree	: [
						{
							deepThreeOne: 'stringOne',
							deepThreeTwo: 1542
						},
						{
							deepThreeOne: 'stringOne',
							deepThreeTwo: 1542
						}
					]
				},
				testFour	: true,
				testFive	: true,
				testSix		: true,
				testSeven	: 4,
			}
		);

		done();
	}
});

test({
	message	: 'ValidationHandler.validation.with.missing',
	test	: ( done ) => {
		const dataToValidate	= {
			testOne	: 123,
			testTwo	: '123',
			123			: [1,2,3,4,5],
			testThree	: {
				'deepOne'	: 123,
				deepTwo	: {
					deeperOne	: 123,
					deeperTwo	: '123',
					deeperFour	: '4'
				},
				deepThree	: [
					{
						deepThreeOne: 'stringOne',
						deepThreeTwo: '1542'
					},
					{
						deepThreeOne: 'stringOne',
						deepThreeTwo: 'wrong'
					}
				]
			},
			testFour	: true,
			testFive	: 'true',
			testSix		: '1',
			testNine	: {
				weakString	: 'weakString',
				weakBoolean	: true,
				weakNumeric	: 123,
				weakIsTrue	: true,
				weakIsFalse	: false,
			}
		};

		const result	= validationHandler.validate(
			dataToValidate,
			{
				testOne		: 'string||range:2-4',
				testTwo		: 'numeric||range:123-124',
				123			: 'array||range:4-6',
				testThree	: {
					deepOne	: 'numeric||range:122-124',
					deepTwo	: {
						deeperOne	: 'string||range:2-4',
						deeperTwo	: 'numeric||range:123-124',
						deeperThree	: { $rules: 'optional||min:2||max:5', $default: 4 },
						deeperFour	: { $rules: 'optional||numeric||min:2||max:5', $default: 4 }
					},
					deepThree	: [
						{
							deepThreeOne: 'string',
							deepThreeTwo: 'numeric'
						}
					]
				},
				testFour	: 'boolean',
				testFive	: 'boolean',
				testSix		: 'boolean',
				testSeven	: { $rules: 'optional||min:2||max:5', $default: 4 },
				testEight	: 'numeric',
				testNine	: {
					weakString	: 'weakString',
					weakBoolean	: 'weakBoolean',
					weakNumeric	: 'weakNumeric',
					weakIsTrue	: 'weakIsTrue',
					weakIsFalse	: 'weakIsFalse',
					deep	: {
						deeper	: {
							deepest: 'string'
						}
					}
				}
			}
		);

		assert.equal( result.hasValidationFailed(), true );
		assert.deepStrictEqual( result.getValidationResult(), {
				testThree: {
					deepThree: {
						1: {
							deepThreeTwo: ['numeric']
						}
					}
				},
				testEight: ['numeric'],
				testNine: {
					deep: {
						deeper: {
							deepest: ['string']
						}
					}
				}
			}
		);

		done();
	}
});

test({
	message	: 'ValidationHandler.validation.when.validationInput.is.empty',
	test	: ( done ) => {
		const result	= validationHandler.validate();

		assert.deepStrictEqual( result.hasValidationFailed(), false );
		assert.deepStrictEqual( result.getValidationResult(), {} );

		done();
	}
});

test({
	message	: 'ValidationHandler.validation.with.arrays',
	test	: ( done ) => {
		const input		= [
			{
				one: 123,
				two: 456,
				three: [
					{
						four: 123,
					}
				]
			},
			{
				one: 123,
				two: 456,
			},
			{},
		];
		const result	= validationHandler.validate( input, [{ one: 'numeric', two: 'numeric', three: [{four:'string'}] }]);

		assert.deepStrictEqual( result.hasValidationFailed(), true );
		assert.deepStrictEqual( result.getValidationResult(),
			{
				1: {
					three: {
						0: {
							'four': ['string']
						}
					}
				},
				2: {
					one: ['numeric'],
					two: ['numeric'],
					three: {
						0: {
							four: ['string']
						}
					}
				}
			}
		);

		done();
	}
});


test({
	message	: 'ValidationHandler.validation.with.arrays',
	test	: ( done ) => {
		const input		= [
			{
				one: 123,
				two: 456,
				three: [
					{
						four: 123,
					}
				]
			},
			{
				one: 123,
				two: 456,
				three: [
					{
						four: 123,
					}
				]
			}
		];
		const result	= validationHandler.validate( input, [{ one: 'numeric', two: 'numeric', three: [{four:'string'}] }]);

		assert.deepStrictEqual( result.hasValidationFailed(), false );
		assert.deepStrictEqual( result.getValidationResult(),
			[
				{
					one: 123,
					two: 456,
					three: [
						{
							four: '123',
						}
					]
				},
				{
					one: 123,
					two: 456,
					three: [
						{
							four: '123',
						}
					]
				}
			]
		);

		done();
	}
});
