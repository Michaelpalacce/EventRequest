'use strict';

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
 * @brief	Assert that the given value is a string
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertIsString		= ( actual ) => {
	return getType( actual ) === 'string';
};

/**
 * @brief	Assert that the given value is NOT a string
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertNotString		= ( actual ) => {
	return getType( actual ) !== 'string';
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

};

/**
 * @brief	Assert that the given value is NOT a Date Object
 *
 * @param	mixed actual
 *
 * @return	Boolean
 */
assert.assertIsDateObject	= ( actual ) => {
	return ! ( actual instanceof Date );
};

module.exports	= assert;
