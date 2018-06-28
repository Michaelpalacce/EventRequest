'use strict';

const assert	= require( 'assert' );

/**
 * @brief	Method mock. This class is responsible for mocking a method and attaching it to the mocked class
 */
class MethodMock
{
	constructor( mockedClass, mockMethodOptions )
	{
		this.mockedClass		= mockedClass;
		this.mockedMethod		= ()=>{};

		this.method				= typeof mockMethodOptions.method === 'string'
								? mockMethodOptions.method
								: null;

		this.withArguments		= Array.isArray( mockMethodOptions.with )
								? mockMethodOptions.with
								: [];

		this.executionTimes		= typeof mockMethodOptions.called === 'number'
								? mockMethodOptions.called
								: null;

		let shouldReturn		= typeof mockMethodOptions.shouldReturn !== 'undefined'
								? mockMethodOptions.shouldReturn
								: null;

		let onConsecutiveCalls	= Array.isArray( mockMethodOptions.onConsecutiveCalls )
								? mockMethodOptions.onConsecutiveCalls
								: null;

		if (
			this.mockedClass === undefined
			|| this.method === null
			|| ( shouldReturn === null && onConsecutiveCalls === null )
		) {
			throw new Error( 'Invalid mock options provided' );
		}

		this.executionBlock	= shouldReturn === null ? onConsecutiveCalls : [shouldReturn];

		this.setUpMockedMethod();
	}

	/**
	 * @brief	Creates the mocked method that should later be attached to the mocked class
	 *
	 * @return	void
	 */
	setUpMockedMethod()
	{
		let functionCalled	= 0;

		this.mockedMethod	= ( ...args ) => {
			functionCalled ++;

			if ( this.executionTimes !== null && this.executionTimes < functionCalled )
			{
				throw new Error( `Method ${this.method} was not expected to be called more than ${this.executionTimes} times.` );
			}

			this.assertWithArguments( args );

			return this.getNextExecutionFunction( args );
		};
	}

	/**
	 * @brief	Assert whether correct with arguments are passed
	 *
	 * @return	void
	 */
	assertWithArguments( args )
	{
		if ( this.hasWithArguments() )
		{
			let currentArguments	= this.getWithArguments();
			if ( ! Array.isArray( currentArguments ) )
			{
				throw new Error( 'Invalid arguments provided' );
			}
			for ( let index = 0; index < currentArguments.length; ++ index )
			{
				let value	= currentArguments[index];
				if ( value === undefined )
				{
					continue;
				}

				assert.deepStrictEqual( value, args[index], `Failed asserting that ${this.method} was called `
					+ ` with correct argument at position ${index}. `
					+ `${value} was expected, but ${args[index]} received`
				)
			}
		}
	}

	/**
	 * @brief	Attaches the mocked method to the mocked class
	 *
	 * @return	void
	 */
	attachMockedMethod()
	{
		if ( typeof this.mockedClass[this.method] === 'undefined' )
		{
			throw new Error( 'Trying to mock a method that does not exist.' );
		}
		else if ( typeof this.mockedClass[this.method] === 'function' )
		{
			this.mockedClass[this.method]	= this.mockedMethod;
		}
		else
		{
			this.mockedClass[this.method]	= this.getNextExecutionFunction( [] );
		}
	}

	/**
	 * @brief	Checks to see if there are with arguments
	 *
	 * @return	Boolean
	 */
	hasWithArguments()
	{
		return this.withArguments.length > 0;
	}

	/**
	 * @brief	Gets the next with arguments
	 *
	 * @return	Array
	 */
	getWithArguments()
	{
		return this.withArguments.length === 1 ? this.withArguments[0] : this.withArguments.shift();
	}

	/**
	 * @brief	Gets the next function to execute
	 *
	 * @param	Array args
	 *
	 * @return	mixed
	 */
	getNextExecutionFunction( args )
	{
		let functionToExecute	= this.executionBlock.length > 1 ? this.executionBlock.shift() : this.executionBlock[0];

		if ( typeof functionToExecute === 'function' )
		{
			return functionToExecute.apply( this.mockedClass, args )
		}
		else
		{
			return functionToExecute;
		}
	}
}

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
			let methodMock	= new MethodMock( this, mockMethodOptions );
			methodMock.attachMockedMethod();

			return this;
		}
	}

	return MockedClass;
};

module.exports	= Mock;