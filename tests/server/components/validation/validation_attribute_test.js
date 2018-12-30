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
		['testKey', 1, 'min:2||numeric', ['min']],
		['testKey', 3, 'min:2||numeric', false],
		['testKey', '123', 'min:2||numeric', ['numeric']],
		['testKey', '1', 'min:2||numeric', ['min', 'numeric']],
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
		['testKey', '', 'something', ['rules']]
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
