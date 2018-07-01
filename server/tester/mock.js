'use strict';

// Dependencies
const Mocker	= require( './mocker' );

/**
 * @brief	Used to create a MockedObject
 *
 * @param	Object objectToMock
 *
 * @return	MockedClass
 */
let Mock	= function ( objectToMock )
{
	class MockedClass extends objectToMock
	{
		/**
		 * @brief	Method used to mock other methods
		 *
		 * @param	Object mockMethodOptions
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