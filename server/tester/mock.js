'use strict';

// Dependencies
const Mocker	= require( './mocker' );

/**
 * @brief	Used to create a MockedObject
 *
 * @param	{Object} objectToMock
 *
 * @return	MockedClass
 */
let Mock	= function ( objectToMock )
{
	if ( typeof objectToMock === 'object' )
	{
		/**
		 * @brief	Method used to mock other methods
		 *
		 * @param	{Object} mockMethodOptions
		 *
		 * @return	Object
		 */
		objectToMock._mock = ( mockMethodOptions )=>
		{
			Mocker( objectToMock, mockMethodOptions );

			return objectToMock;
		};

		return objectToMock;
	}

	class MockedClass extends objectToMock
	{
		/**
		 * @brief	Method used to mock other methods
		 *
		 * @param	{Object} mockMethodOptions
		 *
		 * @return	MockedClass
		 */
		_mock( mockMethodOptions )
		{
			Mocker( this, mockMethodOptions );

			return this;
		}
	}

	return MockedClass;
};

module.exports	= Mock;