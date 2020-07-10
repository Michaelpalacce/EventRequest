'use strict';

const { assert, test }	= require( '../../../test_helper' );
const ValidationHandler	= require( './../../../../server/components/validation/validation_handler' );

test({
	message	: 'ValidationHandler.validation',
	test	: ( done )=>{
		const validationHandler	= new ValidationHandler();
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
				}
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
					deepOne	: 'numeric||range:122-124',
					deepTwo	: {
						deeperOne	: 'string||range:2-4',
						deeperTwo	: 'numeric||range:123-124',
						deeperThree	: { $rules: 'optional||min:2||max:5', $default: 4 },
						deeperFour	: { $rules: 'optional||numeric||min:2||max:5', $default: 4 }
					}
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
					deepOne	: 123,
					deepTwo	: {
						deeperOne	: '123',
						deeperTwo	: 123,
						deeperThree	: 4,
						deeperFour	: 4
					}
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
	test	: ( done )=>{
		const validationHandler	= new ValidationHandler();
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
				}
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
					deepOne	: 'numeric||range:122-124',
					deepTwo	: {
						deeperOne	: 'string||range:2-4',
						deeperTwo	: 'numeric||range:123-124',
						deeperThree	: { $rules: 'optional||min:2||max:5', $default: 4 },
						deeperFour	: { $rules: 'optional||numeric||min:2||max:5', $default: 4 }
					}
				},
				testFour	: 'boolean',
				testFive	: 'boolean',
				testSix		: 'boolean',
				testSeven	: { $rules: 'optional||min:2||max:5', $default: 4 },
				testEight	: 'numeric'
			}
		);

		assert.equal( result.hasValidationFailed(), true );
		assert.deepStrictEqual( result.getValidationResult(), { testEight: ['numeric'] } );

		done();
	}
});
