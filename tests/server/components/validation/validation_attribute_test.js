'use strict';

const { assert, test }		= require( '../../../test_helper' );
const ValidationAttribute	= require( './../../../../server/components/validation/validation_attribute' );

test({
	message			: 'ValidationAttribute validateSelf',
	dataProvider	: [
		['testKey', 'testValue', 'string', false],
		['testKey', '', 'optional', false],
		['testKey', '', 'optional||string', false],
		['testKey', 1, 'optional||notString', false],
		['testKey', 'string', 'optional||notString', ['notString']],
		['testKey', '', 'optional||numeric', false],
		['testKey', '', 'numeric', ['numeric']],
		['testKey', 'string', 'numeric', ['numeric']],
		['testKey', '', 'filled', ['filled']],
		['testKey', 'TheValueIsFilled', 'filled', false],
		['testKey', 'xxx', 'range:3-5', false],
		['testKey', 'xxxxx', 'range:3-5', false],
		['testKey', 'xxxxxy', 'range:3-5', ['range']],
		['testKey', 'xx', 'range:3-5', ['range']],
		['testKey', 'xx', 'range:3-5-2', ['rules']],
		['testKey', 'xx', 'range:5-2', ['range']],
		['testKey', 'xx', 'min:2', false],
		['testKey', 'xx', 'min:2:3', ['rules']],
		['testKey', 1, 'numeric||min:2', ['min']],
		['testKey', 3, 'numeric||min:2', false],
		['testKey', '123', 'numeric||min:50', false],
		['testKey', '123', 'string||min:2', false],
		['testKey', '123', 'string||min:3', false],
		['testKey', '123', 'string||min:4', ['min']],
		['testKey', '123', 'string||range:5-6', ['range']],
		['testKey', '123', 'string||range:2-4', false],
		['testKey', '123', 'numeric||range:50-150', false],
		['testKey', '151', 'numeric||range:50-150', ['range']],
		['testKey', '1', 'numeric||min:2', ['min']],
		['testKey', '1', 'max:2', false],
		['testKey', '1xx', 'max:2', ['max']],
		['testKey', 1, 'max:2', false],
		['testKey', 1, 'max:2:3', ['rules']],
		['testKey', 3, 'max:2', ['max']],
		['testKey', 'test@email.com', 'email', false],
		['testKey', 'testemai.com', 'email', ['email']],
		['testKey', 'true', 'isTrue', false],
		['testKey', true, 'isTrue', false],
		['testKey', 1, 'isTrue', false],
		['testKey', null, 'isTrue', ['isTrue']],
		['testKey', 'string', 'isTrue', ['isTrue']],
		['testKey', 0, 'isTrue', ['isTrue']],
		['testKey', 'false', 'isFalse', false],
		['testKey', false, 'isFalse', false],
		['testKey', 0, 'isFalse', false],
		['testKey', 1, 'isFalse', ['isFalse']],
		['testKey', 'string', 'isFalse', ['isFalse']],
		['testKey', 'true', 'boolean', false],
		['testKey', 'false', 'boolean', false],
		['testKey', true, 'boolean', false],
		['testKey', false, 'boolean', false],
		['testKey', 0, 'boolean', false],
		['testKey', 1, 'boolean', false],
		['testKey', 'string', 'boolean', ['boolean']],
		['testKey', 2, 'boolean', ['boolean']],
		['testKey', 'true', 'notBoolean', false],
		['testKey', 'false', 'notBoolean', false],
		['testKey', true, 'notBoolean', ['notBoolean']],
		['testKey', false, 'notBoolean', ['notBoolean']],
		['testKey', 0, 'notBoolean', false],
		['testKey', 1, 'notBoolean', false],
		['testKey', 'string', 'notBoolean', false],
		['testKey', 2, 'notBoolean', false],
		['testKey', 'test', 'equals:test', false],
		['testKey', 'test2', 'equals:test', ['equals']],
		['testKey', '', 'something', ['rules']],
		['testKey', [], 'array', false],
		['testKey', [], 'array||range:0-1', false],
		['testKey', [], 'array||range:1-2', ['range']],
		['testKey', [], 'array||min:0', false],
		['testKey', [], 'array||min:1', ['min']],
		['testKey', [], 'notArray', ['notArray']],
		['testKey', [1,2,3], 'array||max:1', ['max']],
		['testKey', [1,2,3], 'array||max:4', false],
		['testKey', [1,2,3], 'array||range:1-4', false],
		['testKey', [1,2,3], 'array||range:5-6', ['range']],
		['testKey', [1,2,3], 'array||min:2', false],
	],
	test			: ( done, key, value, rules, anythingInvalid )=>{
		let dataToValidate		= {
			[key]	: value
		};

		let validationAttribute	= new ValidationAttribute( key, value, rules, dataToValidate );

		assert.deepStrictEqual( validationAttribute.validateSelf(), anythingInvalid );
		done();
	}
});

test({
	message			: 'ValidationAttribute validateSelf changes the value',
	dataProvider	: [
		['testKey', 'testValue', 'string', 'testValue'],
		['testKey', 12, 'string', '12'],
		['testKey', 12, 'string||min:2', '12'],
		['testKey', 1, 'boolean', true],
		['testKey', '1', 'boolean', true],
		['testKey', true, 'boolean', true],
		['testKey', 'true', 'boolean', true],
		['testKey', 'false', 'boolean', false],
		['testKey', '0', 'boolean', false],
		['testKey', 0, 'boolean', false],
		['testKey', false, 'boolean', false],
		['testKey', 'true', 'isTrue', true],
		['testKey', '1', 'isTrue', true],
		['testKey', 1, 'isTrue', true],
		['testKey', true, 'isTrue', true],
		['testKey', false, 'isFalse', false],
		['testKey', 0, 'isFalse', false],
		['testKey', '0', 'isFalse', false],
		['testKey', 'false', 'isFalse', false],
		['testKey', '1', 'numeric', 1],
		['testKey', '5125125', 'numeric', 5125125],
		['testKey', 'false', 'numeric', 'false'],
		['testKey', 1, 'numeric', 1],
		['testKey', 50, 'numeric||min:50', 50],
	],
	test			: ( done, key, value, rules, expectedValue )=>{
		let dataToValidate		= {
			[key]	: value
		};

		let validationAttribute	= new ValidationAttribute( key, value, rules, dataToValidate );
		validationAttribute.validateSelf();

		assert.deepStrictEqual( validationAttribute.value, expectedValue );
		done();
	}
});

test({
	message			: 'ValidationAttribute validateSelf with same and different',
	dataProvider	: [
		['testKey', 'test', 'same:testKey2', { testKey: 'test', testKey2: 'test' }, false],
		['testKey', 'test', 'same:testKey2', { testKey: 'test', testKey2: 'test2' }, ['same']],
		['testKey', 'test', 'different:testKey2', { testKey: 'test', testKey2: 'test' }, ['different']],
		['testKey', 'test', 'different:testKey2', { testKey: 'test', testKey2: 'test2' }, false],
	],
	test			: ( done, key, value, rules, data, anythingInvalid )=>{
		let validationAttribute	= new ValidationAttribute( key, value, rules, data );

		assert.deepStrictEqual( validationAttribute.validateSelf(), anythingInvalid );
		done();
	}
});
