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
			let method				= typeof mockMethodOptions.method === 'string'
									? mockMethodOptions.method
									: null;

			let shouldReturn		= typeof mockMethodOptions.shouldReturn !== 'undefined'
									? mockMethodOptions.shouldReturn
									: null;

			let withArguments		= Array.isArray( mockMethodOptions.with )
									? mockMethodOptions.with
									: [];

			let called				= typeof mockMethodOptions.called === 'number'
									? mockMethodOptions.called
									: null;

			let onConsecutiveCalls	= Array.isArray( mockMethodOptions.onConsecutiveCalls )
									? mockMethodOptions.onConsecutiveCalls
									: null;

			if ( method === null || ( shouldReturn === null && onConsecutiveCalls === null ) )
			{
				throw new Error( 'Invalid mock options provided' );
			}

			onConsecutiveCalls	= shouldReturn === null ? onConsecutiveCalls : [shouldReturn];

			if ( typeof this[method] !== 'function' )
			{
				throw new Error( 'Trying to mock a method that does not exist.' );
			}

			let functionCalled	= 0;

			this[method]		= ( ...args ) => {
				functionCalled ++;
				if ( called !== null && called < functionCalled )
				{
					throw new Error( `Method ${method} was not expected to be called more than ${called} times.` );
				}

				if ( withArguments.length > 0 )
				{
					let currentArguments	= withArguments.length === 1 ? withArguments[0] : withArguments.shift();
					if ( ! Array.isArray( currentArguments ) )
					{
						throw new Error( 'Invalid arguments provided' );
					}
					for ( let index = 0; index < currentArguments.length; ++ index )
					{
						let value	= currentArguments[index];
						assert.strictEqual( value, args[index], `Failed asserting that ${method} was called `
							+ ` with correct argument at position ${index}. `
							+ `${value} was expected, but ${args[index]} received`
						)
					}
				}

				let functionToExecute	= onConsecutiveCalls.length > 1 ? onConsecutiveCalls.shift() : onConsecutiveCalls[0];

				if ( typeof functionToExecute === 'function' )
				{
					return functionToExecute.call( this, args )
				}
				else
				{
					return functionToExecute;
				}
			};

			return this;
		}
	}

	return MockedClass;
};

class Test
{
	methodToMock() { return 'hey'; }
}

let MockedTest	= Mock( Test );
let mockedTest	= new MockedTest();
mockedTest._mock({
	method				: 'methodToMock',
	onConsecutiveCalls	: ['MOCKED', ()=>{ return 'MOCKED AGAIN'; }],
	with				: [
		['hello', 'test'],
		['secondHello', 'secondTest']
	],
	called				: 2
});

console.log( mockedTest.methodToMock( 'hello', 'test' ) );
console.log( mockedTest.methodToMock( 'secondHello', 'secondTest' ) );