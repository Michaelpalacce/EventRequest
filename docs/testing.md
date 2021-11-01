
# [Testing](#testing)
If you need to test your project, then you can use the Testing tools included in the project.

~~~javascript
     const { Testing } = require( 'event_request' );
~~~

#### Accepted CLI arguments

**--filter=**
- Accepts a string to filter by
- Example: node test.js --filter=DataServer

**--silent**
- Silences the errors
- Example: node test.js --silent

**--debug**
- Sets it to debug
- Example: node test.js --debug

**--dieOnFirstError=**
- Accepts 1 or 0 whether the tester should die on first error
- Example: node test.js --dieOnFirstError=1
- Example: node test.js --dieOnFirstError=0

#### Notes:
The testing tools include a mocker. The mocker class can be retrieved with:

~~~javascript
     const { Mock } = Testing;
~~~
The exported Mock is a Function that should be used directly on the constructor of the class you want to mock. For example:

~~~javascript
     class Test { mockThis(){} }; 
 
     const MockedTest = Mock( Test );  
~~~

This will return the same class but with an extra _mock function added directly to it so make sure your original class does NOT
have a _mock function otherwise it will be overwritten. From here you can use the _mock function to mock any other function/parameter
that is attached to the 'Test' class:

~~~javascript
     const testDouble = new MockedTest();  
       testDouble._mock({  
       method        : 'mockThis',  
       shouldReturn  : ''  
     });  
~~~

Note: As you can see when you mock a class you MUST specify what it should return from now on. You can also give instructions
on what should be returned on consecutive calls to this method like so :

~~~javascript
     const testDouble = new MockedTest();  
       testDouble._mock({  
       method              : 'mockThis',  
       onConsecutiveCalls  : ['first', 'secondAndOnwards']  
     });
~~~

This will result in the following:
1. The first time you make a call to mockThis you will get 'first' as a return
2. The second time you make a call to mockThis you will get 'secondAndOnwards' as a return
3. Third time you make a call and any other following you will also get 'secondAndOnwards'


When making a mock of a class you can specify the MAX amount of times an object should be called. Since javascript uses
an async approach and relies heavily on callbacks, a minimum cannot be set.

~~~javascript
     const testDouble = new MockedTest();  
        testDouble._mock({  
        method        : 'mockThis',  
        shouldReturn  : '',  
        called        : 1  
     });
~~~

This way if the method mockThis is called more than once an error will be thrown.

You can also Specify the arguments that should be provided to the mocked method like so:
~~~javascript
     const testDouble = new MockedTest();  
       testDouble._mock({  
       method        : 'mockThis',  
       shouldReturn  : '',  
       called        : 1,  
       with:         [
           [ 'firstArgument', 'secondArgument' ],  
           [ 'secondCallFirstArgument', 'secondCallSecondArgument' ], 
           [ 'iWantToCheckThis', undefined ],
           [ undefined, 'iWantToCheckThis' ]  
        ]  
     });  
~~~

The 'with' option accepts an array of arrays where each array in the with array is a call. Again if it's called more than
the times the with arguments, the last one will be returned. In case of mismatch an Error will be thrown.
If you do not want the mocker to check one of the arguments, then undefined should be passed

If you wan an environment to run your tests then you can use the test and runAllTests provided by the testing tools:

~~~javascript
     const { test, runAllTests } = TestingTools;
~~~

The 'runAllTests' function accepts an object that accepts the following options:

**dieOnFirstError: Boolean**
- Whether the testing should stop on the first error
- Defaults to true

**debug: Boolean**
- Whether errors thrown should show their entire stack or just the message
- Defaults to false

**silent: Boolean**
- This will set the consoleLogger logLevel to error, meaning only errors will be displayed
- Defaults to false

**filter: String**
- the string to search for and filter by when testing
- Defaults to false

**callback: Function**
- Callback to be called when testing is complete

***

- The run all tests will run all tests added by the test function.
- If there is an err or an Error is thrown then the process with exit with code 1 otherwise it will exit with code 0

***
### The 'test' function accepts an object with the following options:

**message: String**
- the name of the test

**skipped: Boolean**
- defaults to false
- If this is set to true the test will be skipped

**incomplete: Boolean**
- defaults to false
- If this is set to true the test will be marked as incomplete

**dataProvider: Array**
- Optional
- If this is provided then an Array of Arrays must be supplied.
- For each Array supplied, a new test will be created and called with the Array elements set as arguments to the test callback

**test: Function**
- the callback to execute.
- the tester provides a done function as the first argument to the test callback.
- The done should be called just ONCE and only when the test finishes.
- If done is called twice within the same test then that will be seen as an error and the testing will stop.
- If any arguments that evaluate to true are provided to done then the test will be seen as failed.

***
~~~javascript
     test({  
       message     : 'This test should pass',  
       dataProvier : [
           ['first', 2 ],
           ['firstTwo', 21 ],
       ],
       test        : ( done, first, second ) => {  
          console.log( first ); //this will log 'first', then on the second iterration 'firstTwo'
          console.log( second ); //this will log 2, then on the second iterration 21
          done()
       }  
     });  
~~~

- You can also create your own Tester if you want separate test cases:
~~~javascript
     const { Tester }    = TestingTools;  
     let tester          = new Tester();  
~~~

- The tester has the same functions: 'test', 'runAllTests'

### [Mocker](#mocker)
You can also use the Mocker class by:
~~~javascript
       Mocker( classToMock, methodToMockOptions )
~~~

- The methodToMockOptions are the same as the _mock function of a testDouble.
- Note that this can alter a class before it is actually instantiated and WILL alter the original class passed so it is suggested to be used ONLY on testDoubles


The TestingTools export:

- Tester, -> Tester constructor
- Mock,   -> Mock function
- Mocker,   -> the class used to mock methods of testDoubles. Please note that if you use this class you will alter the original one
- assert, -> nodejs assert module
- tester, -> Already created tester
- test        : tester.addTest.bind( tester ),
- runAllTests    : tester.runAllTests.bind( tester )

***
***
***
