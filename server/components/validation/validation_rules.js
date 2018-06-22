'use strict';

// Container
let assert	= {};

/**
 * @brief	Gets the type of the value
 *
 * @param	mixed value
 *
 * @return	String
 */
function getType( value )
{
	return typeof value
}

/**
 * @brief	Gets the array of the value
 *
 * @param	mixed value
 *
 * @return	Number
 */
function getLength( value )
{
	if ( value === undefined )
	{
		return -1;
	}

	if ( Array.isArray( value ) )
	{
		return value.length;
	}

	if( getType( value ) === 'number' )
	{
		return value;
	}

	if( getType( value ) === 'string' )
	{
		return value.length;
	}

	if ( getType( value ) === 'object'  )
	{
		return Object.keys( value ).length;
	}

	return -1;
}

/**
 * @var	RegExp EMAIL_REGEX
 */
const EMAIL_REGEX	= /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * @brief	Assert if the two values are equal ignoring type coercion
 *
 * @param	mixed actual
 * @param	mixed expected
 *
 * @return	Boolean
 */
assert.assertEqual	= ( actual, expected ) => {
	return actual == expected;
};

/**
 * @brief	Assert if the two values are equal acknowledges type coercion
 *
 * @param	mixed actual
 * @param	mixed expected
 *
 * @return	Boolean
 */
assert.assertStrictEqual	= ( actual, expected ) => {
	return actual === expected;
};

/**
 * @brief	Assert if the two values are NOT equal ignoring type coercion
 *
 * @param	mixed actual
 * @param	mixed expected
 *
 * @return	Boolean
 */
assert.assertNotEqual	= ( actual, expected ) => {
	return actual != expected;
};

/**
 * @brief	Assert if the two values are NOT equal acknowledges type coercion
 *
 * @param	mixed actual
 * @param	mixed expected
 *
 * @return	Boolean
 */
assert.assertStrictNotEqual	= ( actual, expected ) => {
	return actual !== expected;
};

/**
 * @brief	Assert that the given value is a string
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertIsString		= ( actual ) => {
	return assert.assertIsInternalType( actual, 'string' );
};

/**
 * @brief	Assert that the given value is NOT a string
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertNotString		= ( actual ) => {
	return assert.assertNotInternalType( actual, 'string' );
};

/**
 * @brief	Assert that the given value is a number
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertIsNumeric		= ( actual ) => {
	let check	= Number( actual );

	return ! isNaN( check ) && actual === check;
};

/**
 * @brief	Asserts that the given value is NOT a number
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertNotNumeric		= ( actual ) => {
	return isNaN( Number( actual ) );
};

/**
 * @brief	Assert that the given value is empty
 *
 * @details	Will check for an empty String, empty Object or empty Array
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertIsEmpty		= ( actual ) => {
	return actual === ''
		|| ( getType( actual ) === 'object' && Object.keys( actual ).length === 0 )
		|| ( Array.isArray( actual ) && actual.length === 0 );
};

/**
 * @brief	Assert that the given value is empty
 *
 * @details	Will check for a non empty String, non empty Object and non empty Array
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertNotEmpty		= ( actual ) => {
	if ( actual === undefined || actual === null )
	{
		return false;
	}

	if ( Array.isArray( actual ) )
	{
		return actual.length > 0;
	}

	if ( getType( actual ) === 'object' )
	{
		return Object.keys( actual ).length > 0;
	}

	return actual !== '';
};

/**
 * @brief	Assert that the given value is a Date Object or a value that can be cast to a date
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertIsDate			= ( actual ) => {
	return ! isNaN( Date.parse( actual ) );
};

/**
 * @brief	Assert that the given value is a Date Object
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertIsDateObject	= ( actual ) => {
	return actual instanceof Date;
};

/**
 * @brief	Assert that the given value is NOT a Date Object or a value that can be cast to a date
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertNotDate		= ( actual ) => {
	return isNaN( Date.parse( actual ) );
};

/**
 * @brief	Assert that the given value is NOT a Date Object
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertNotDateObject	= ( actual ) => {
	return ! ( actual instanceof Date );
};

/**
 * @brief	Assert that the given value is the given internal type like: string, number, array etc
 *
 * @param	mixed actual
 * @param	String internalType
 *
 * @return	Boolean
 */
assert.assertIsInternalType	= ( actual, internalType ) => {
	return getType( actual ) === internalType;
};

/**
 * @brief	Assert that the given value is NOT the given internal type like: string, number, array etc
 *
 * @param	mixed actual
 * @param	String internalType
 *
 * @return	Boolean
 */
assert.assertNotInternalType	= ( actual, internalType ) => {
	return getType( actual ) !== internalType;
};

/**
 * @brief	Asserts that the given value is a valid email address
 *
 * @param	String actual
 *
 * @return	Boolean
 */
assert.assertIsValidEmail		= ( actual ) => {
	return EMAIL_REGEX.test( String( actual ).toLowerCase() );
};

/**
 * @brief	Asserts that the given value is NOT a valid email address
 *
 * @param	String actual
 *
 * @return	Boolean
 */
assert.assertNotValidEmail		= ( actual ) => {
	return ! EMAIL_REGEX.test( String( actual ).toLowerCase() );
};

/**
 * @brief	Asserts that the given value is bigger than the given comparator
 *
 * @param	mixed actual
 * @param	mixed comparator
 *
 * @return	Boolean
 */
assert.assertBiggerThan			= ( actual, comparator ) => {
	return getLength( actual ) > getLength( comparator );
};

/**
 * @brief	Asserts that the given value is bigger or equal in regards to the given comparator
 *
 * @param	mixed actual
 * @param	mixed comparator
 *
 * @return	Boolean
 */
assert.assertBiggerOrEqual		= ( actual, comparator ) => {
	return getLength( actual ) >= getLength( comparator );
};

/**
 * @brief	Asserts that the given value is smaller than the given comparator
 *
 * @param	mixed actual
 * @param	mixed comparator
 *
 * @return	Boolean
 */
assert.assertSmallerThan		= ( actual, comparator ) => {
	return getLength( actual ) < getLength( comparator );
};

/**
 * @brief	Asserts that the given value is smaller or equal in regards to the given comparator
 *
 * @param	mixed actual
 * @param	mixed comparator
 *
 * @return	Boolean
 */
assert.assertSmallerOrEqual		= ( actual, comparator ) => {
	return getLength( actual ) <= getLength( comparator );
};

/**
 * @brief	Assert that the given value is a Boolean
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertIsBoolean			= ( actual ) => {
	return assert.assertIsInternalType( actual, 'boolean' )
			? true
			: assert.assertTrue( actual ) || assert.assertFalse( actual );
};

/**
 * @brief	Assert that the given value is NOT a Boolean
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertNotBoolean			= ( actual ) => {
	return assert.assertNotInternalType( actual, 'boolean' );
};

/**
 * @brief	Asserts that the given value is or casts to TRUE
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertTrue				= ( actual ) => {
	if ( assert.assertIsInternalType( actual, 'boolean' ) )
	{
		return actual === true;
	}

	if ( assert.assertIsInternalType( actual, 'number' ) )
	{
		return actual === 1;
	}

	if ( assert.assertIsInternalType( actual, 'string' ) )
	{
		return actual === 'true' || actual === '1';
	}

	return false;
};

/**
 * @brief	Asserts that the given value is or casts to FALSE
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertFalse			= ( actual ) => {
	if ( assert.assertIsInternalType( actual, 'boolean' ) )
	{
		return actual === false;
	}

	if ( assert.assertIsInternalType( actual, 'number' ) )
	{
		return actual === 0;
	}

	if ( assert.assertIsInternalType( actual, 'string' ) )
	{
		return actual === 'false' || actual === '0';
	}

	return false;
};

assert.getLength				= getLength;

module.exports	= assert;
