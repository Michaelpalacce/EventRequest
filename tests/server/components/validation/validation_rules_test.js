'use strict';

const { assert, test }	= require( '../../../test_helper' );
const ValidationRules	= require( './../../../../server/components/validation/validation_rules' );

test({
	message	: 'ValidationRules assertStrictEqual',
	dataProvider	: [
		[0, 0, true],
		['1', '1', true],
		['string', 'string', true],
		[true, true, true],
		[0, '0', false],
		['string', 'wrong', false],
		[0, false, false]
	],
	test			: ( done, first, second, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertStrictEqual( first, second ), shouldBeEqual );

		done();
	}
});

test({
	message			: 'ValidationRules assertEqual',
	dataProvider	: [
		[0, 0, true],
		['1', '1', true],
		['string', 'string', true],
		[true, true, true],
		[0, '0', true],
		['string', 'wrong', false],
		[0, false, true]
	],
	test			: ( done, first, second, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertEqual( first, second ), shouldBeEqual );

		done();
	}
});

test({
	message			: 'ValidationRules assertNotEqual',
	dataProvider	: [
		[0, 0, false],
		['1', '1', false],
		['string', 'string', false],
		[true, true, false],
		[0, '0', false],
		['string', 'wrong', true],
		[0, false, false]
	],
	test			: ( done, first, second, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertNotEqual( first, second ), shouldBeEqual );

		done();
	}
});

test({
	message			: 'ValidationRules assertStrictNotEqual',
	dataProvider	: [
		[0, 0, false],
		['1', '1', false],
		['string', 'string', false],
		[true, true, false],
		[0, '0', true],
		['string', 'wrong', true],
		[0, false, true]
	],
	test			: ( done, first, second, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertStrictNotEqual( first, second ), shouldBeEqual );
		done();
	}
});

test({
	message			: 'ValidationRules assertIsString',
	dataProvider	: [
		['', true],
		['hey', true],
		[1, false],
		[false, false],
		[[], false]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertIsString( value ), shouldBeEqual );

		done();
	}
});

test({
	message			: 'ValidationRules assertNotString',
	dataProvider	: [
		['', false],
		['hey', false],
		[1, true],
		[false, true],
		[[], true]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertNotString( value ), shouldBeEqual );

		done();
	}
});

test({
	message			: 'ValidationRules assertIsNumeric',
	dataProvider	: [
		[0, true],
		[false, false],
		[[], false],
		['string', false],
		[NaN, false]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertIsNumeric( value ), shouldBeEqual );

		done();
	}
});


test({
	message			: 'ValidationRules assertNotNumeric',
	dataProvider	: [
		['string', true],
		[NaN, true],
		[[], false],
		[false, false],
		[1, false]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertNotNumeric( value ), shouldBeEqual );

		done();
	}
});

test({
	message			: 'ValidationRules assertIsEmpty',
	dataProvider	: [
		['', true],
		[{}, true],
		[[], true],
		[true, false],
		[1, false],
		[{key:'value'}, false],
		[[1,2,3], false],
		['string', false]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertIsEmpty( value ), shouldBeEqual );

		done();
	}
});

test({
	message			: 'ValidationRules assertIsEmpty',
	dataProvider	: [
		['', false],
		[{}, false],
		[[], false],
		[true, true],
		[1, true],
		[{key:'value'}, true],
		[[1,2,3], true]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertNotEmpty( value ), shouldBeEqual );
		done();
	}
});

test({
	message			: 'ValidationRules assertIsArray',
	dataProvider	: [
		['', false],
		[{}, false],
		[[], true],
		[true, false],
		[1, false],
		[{key:'value'}, false],
		[[1,2,3], true]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertIsArray( value ), shouldBeEqual );
		done();
	}
});

test({
	message			: 'ValidationRules assertNotArray',
	dataProvider	: [
		['', true],
		[{}, true],
		[[], false],
		[true, true],
		[1, true],
		[{key:'value'}, true],
		[[1,2,3], false]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertNotArray( value ), shouldBeEqual );
		done();
	}
});

test({
	message			: 'ValidationRules assertIsDateObject',
	dataProvider	: [
		[new Date(), true],
		['string', false]
	],
	test			: ( done, value, shouldBeEqual ) => {
		assert.equal( ValidationRules.assertIsDateObject( value ), shouldBeEqual );

		done();
	}
});
