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
	message			: 'ValidationRules.getLength.when.value.is.not.passed',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.getLength(), -1 );

		done();
	}
});

test({
	message			: 'ValidationRules.getLength.when.value.is.object',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.getLength( { test: 'hey' } ), 1 );

		done();
	}
});

test({
	message			: 'ValidationRules.getLength.when.value.matches.nothing',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.getLength( true ), -1 );

		done();
	}
});

test({
	message			: 'ValidationRules.assertIsDate.when.is.date',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertIsDate( '2020/07/26 00:00:00' ), true );

		done();
	}
});

test({
	message			: 'ValidationRules.assertIsDate.when.not.date',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertIsDate(), false );

		done();
	}
});

test({
	message			: 'ValidationRules.assertNotDate.when.is.date',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertNotDate( '2020/07/26 00:00:00' ), false );

		done();
	}
});

test({
	message			: 'ValidationRules.assertNotDate.when.not.date',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertNotDate(), true );

		done();
	}
});

test({
	message			: 'ValidationRules.assertNotDateObject.when.is.date',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertNotDateObject( new Date() ), false );

		done();
	}
});

test({
	message			: 'ValidationRules.assertNotDateObject.when.not.date',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertNotDateObject(), true );

		done();
	}
});

test({
	message			: 'ValidationRules.assertNotValidEmail.when.valid',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertNotValidEmail( 'test@example.com' ), false );

		done();
	}
});

test({
	message			: 'ValidationRules.assertNotValidEmail.when.invalid',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertNotValidEmail( 'test' ), true );

		done();
	}
});

test({
	message			: 'ValidationRules.assertBiggerThan',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertBiggerThan( 10, 5 ), true );
		assert.deepStrictEqual( ValidationRules.assertBiggerThan( 10, 50 ), false );

		done();
	}
});

test({
	message			: 'ValidationRules.assertSmallerThan',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertSmallerThan( 10, 5 ), false );
		assert.deepStrictEqual( ValidationRules.assertSmallerThan( 10, 50 ), true );

		done();
	}
});

test({
	message			: 'ValidationRules.assertFalse.when.not.false',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertFalse(), false );

		done();
	}
});

test({
	message			: 'ValidationRules.assertIsBoolean',
	test			: ( done ) => {
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( true ), true );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( 1 ), true );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( 'true' ), true );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( '1' ), true );

		assert.deepStrictEqual( ValidationRules.assertIsBoolean( false ), true );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( 0 ), true );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( 'false' ), true );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( '0' ), true );

		assert.deepStrictEqual( ValidationRules.assertIsBoolean( 11 ), false );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( '11' ), false );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( 'wrong' ), false );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( [] ), false );
		assert.deepStrictEqual( ValidationRules.assertIsBoolean( {} ), false );

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
