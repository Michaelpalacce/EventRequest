'use strict';

const assert	= require( 'assert' );

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
			let method			= typeof mockMethodOptions.method === 'string'
								? mockMethodOptions.method
								: null;

			let shouldReturn	= typeof mockMethodOptions.shouldReturn !== 'undefined'
								? mockMethodOptions.shouldReturn
								: null;

			let withArguments	= Array.isArray( mockMethodOptions.with )
								? mockMethodOptions.with
								: [];

			if ( method === null || shouldReturn === null )
			{
				throw new Error( 'Invalid mock options provided' );
			}

			if ( typeof this[method] !== 'function' )
			{
				throw new Error( 'Trying to mock a method that does not exist.' );
			}

			this[method]	= ( ...args ) => {
				if ( withArguments.length > 0 )
				{
					for ( let index = 0; index < withArguments.length; ++ index )
					{
						let value	= withArguments[index];
						assert.strictEqual( value, args[index], `Failed asserting that ${method} was called `
							+ ` with correct argument at position ${index}. `
							+ `${value} was expected, but ${args[index]} received`
						)
					}
				}

				if ( typeof shouldReturn === 'function' )
				{
					return shouldReturn.call( this, args )
				}
				else
				{
					return shouldReturn;
				}
			};

			return this;
		}
	}

	return MockedClass;
};

class Test
{
	constructor()
	{}

	methodToMock()
	{
		return 'hey';
	}
}

let MockedTest	= Mock( Test );
let mockedTest	= new MockedTest();
mockedTest._mock({
	method			: 'methodToMock',
	shouldReturn	: 'MOCKED',
	with			: [
		'hello',
		'secondTest'
	]
});

console.log( mockedTest.methodToMock( 'hello', 'secondTest' ) );