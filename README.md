# EventRequest
A backend server in NodeJs

Includes:
- Body parsers
1) Form Body Parser
2) Multipart Body Parser
3) Json Body Parser
- Cookie parser
- Session security
- File streams
- Easy Routing
- Middlewares
- Logging
1) Console
2) File
- Static Routes
- Request timeout
- Error handling
- Caching ( in memory )
- Input Validation

# Properties exported by the Server:
	Server,				// The actual server to be used
	Router,				// The router. Can be used to add routes to it and then to the main server route
	ErrorHandler,		// Error handler to extend if you want to create a custom error handler
	SessionHandler,		// Session handler to be extended by other security modules
	BodyParserHandler,	// Body parser handler that contains the different body parsers
	DataServer,			// Instance to be extended to implement your own DataServer
	Testing,			// Testing tools ( Mock, Tester( constructor ), logger( logger used by the testing suite ),
						// test( function to use to add tests ), runAllTests( way to run all tests added by test )
	Logging

# Server Options

The server is exported from the main module:

>     const { Server } = require( 'event_request' )

The server constructor accepts the following options:

**protocol** - String - The protocol to be used ( http || https ) -> Defaults to http

**httpsOptions** - Object - Options that will be given to the https webserver -> Defaults to {}

**port** - Number - The port to run the webserver/s on -> Defaults to 3000

**clusters** - Number - The amount of instances of the webserver to be started. Cannot be more than the machine's CPUs -> Defaults to the max amount of CPUs of the machine's

**communicationManager**- CommunicationManager - The communication manager to be used for the IPC communication between the master and the workers -> Defaults to base CommunicationManager

**errorHandler** - ErrorHandler - The error handler to be called when an error occurs inside of the EventRequest -> Defaults to base errorHandler

**cachingServer** - DataServer - The caching server to be used through the application. Defaults to Memory Data Server which should **NOT** be used in production under any circumstances. The data server will be changed to default to something else in the future or not be set up at all.

**cachingServerOptions** - Object - The options to be passed to the setup of the caching server

## The server is started by calling server.start();

***
The server has 2 ways of adding routes/middleware

When adding a Route the **server.add(route)** can be used

route accepts 3 parameters:
* handler - Function - The callback function ! Required
* route - String|RegExp - The route to match - optional if omitted the handler will be called on every request
* method - String|Array - The method(s) to be matched for the route - optional if omitted the handler will be called on every request as long as the route matches


***

Middlewares can be added by **server.use('middlewareName', middlewareOptions)**

Available middleware:
* logger -> Sets up the logger
* * Accepted options:
* * - logger - Logger - which must be provided in order for the logger to be added and must be an instance of Logger

* setFileStream

* errorHandler -> Sets the error handler if not uses the event's default
* * Accepted options:
* * - errorHandler - ErrorHandler - The error handler to use -> Defaults to ErrorHandler

* session -> Adds one or many SecurityManager descendants
* * Accepted options:
* * - sessionName - String - the session name ( aka cookie name ) - Defaults to sid
* * - authenticationRoute - String - The route on which authentication should happen ! Required
* * - tokenExpiration - Number - The Time to keep the tokens before they expire - Defaults to 0 which is forever
* * - authenticationCallback - Function - The callback to be called when authentication has to happen. This callback must return a boolean - Defaults to ()=>{ return false; };
* * - managers - Array - The managers to be added to the security ( they have 2 parameters : instance which must be an instance of SecurityManager and options which are options to be passed to that specific manager only - Defaults to { instance : AuthenticationManager }, { instance : SessionAuthenticationManager }, { instance : LoginManager }, { instance : SessionSaveManager } if default is passed to the array

* bodyParser -> Adds one or many BodyParser descendants
* * Accepted options:
* * - parsers - Array - Array of BodyParser descendants. If the array has a key default these parsers will be added:  { instance : FormBodyParser }, { instance : MultipartFormParser }, { instance : JsonBodyParser }

* parseCookies -> Parses cookies and saves them to event.cookies

* addStaticPath -> adds static resource path
* * Accepted options:
* * - path - String - The path to make available

* timeout -> Adds a timeout to the request
* * Accepted options:
* * - timeout - Number - the amount of milliseconds after which the request should timeout - Defaults to 60 seconds



# Logging

The Loggur can be accessed by directly from the server { Loggur }

The Loggur can be used to create Loggers which accept the following options:
* **serverName** - String - The name of the server to be concatenated with the uniqueId - Defaults to empty
* **transports** - Array - Array of the transports to be added to the logger - Defaults to empty
* **logLevel** - Number - The log severity level -> Defaults to error
*  **logLevels** - Object - JSON object with all the log severity levels and their values All added log levels will be attached to the instance of the logger class -> Defaults to LOG_LEVELS
* **capture** - Boolean - Whether to attach event listeners for process.on uncaughtException and unhandledRejection - Defaults to false
* **dieOnCapture** - Boolean - If the process should exit in case of a caught exception -> Defaults to true
* **unhandledExceptionLevel** - Number - What level should the unhandled exceptions be logged at -> Defaults to error

Loggers can be added to the main instance of the Loggur who later can be used by: Loggur.log and will call all added Loggers

Each Logger can have it's own transport layers.
There are 2 predefined transport layers:
* **Console**
* * Accepted options:
* * - color - Boolean - Whether the log should be colored -> Defaults to true
* * - logColors - Object - The colors to use -> Defaults to
* *  [LOG_LEVELS.error]	: 'red',
* *  [LOG_LEVELS.warning]	: 'yellow',
* *  [LOG_LEVELS.notice]	: 'green',
* *  [LOG_LEVELS.info]		: 'blue',
* *  [LOG_LEVELS.verbose]	: 'cyan',
* *  [LOG_LEVELS.debug]	: 'white'

* **File**
* * Accepted options:
* * - filePath - String - the location of the file to log to -> if it is not provided the transport will not log


### Default log levels:
	error	: 100,
	warning	: 200,
	notice	: 300,
	info	: 400,
	verbose	: 500,
	debug	: 600

When logging an object can be passed that accepts 2 options: level, message. Alternatively a string can be passed which will be interpreted as an error

# Validation

The validation is done by using:
>     event.validationHandler.validate( objectToValidate, skeleton )

skeleton must have the keys that are to be validated that point to a string of rules separated by ||

## Possible rules are:

* rules - if malformed rules string is passed
* optional - if set as long as the input is empty it will always be valid. if not empty other possible rules will be called
* filled - checks if the input is filled
* string - checks if the input is a string
* notString - checks if the input is NOT a string
* range - Is followed by min and max aka: range:1-2 where 1 is the minimum and 2 maximum.
* min - minimum input length
* max - maximum input length
* email - checks if the input is a valid email
* isTrue - checks if the input evaluates to true
* isFalse - checks if the input evaluates to false
* boolean - checks if the input is a boolean
* notBoolean - checks if the input is not a boolean
* numeric - checks if the input is a number
* notNumeric  - checks if the input is not a number
* date  - checks if the input is a date
* same  - checks if the input is the same as another input aka: same:emailInput
* different  - checks if the input is different from another input aka: different:emailInput
* equals  - checks if the input equals another given string: equals:makeSureToEqualToThis

If any errors occur they will be returned as an array of keys eg: ['string','min','max','range','filled']

Example:

>     let body = { stringToValidate: 'str', emailToValidate: 'example@test.com' };
>     event.validationHandler.handle( body, { stringToValidate: 'filled||string||range:2-3',
>                                       emailToValidate: 'optional||email' }
>                                   );

The example will validate that the stringToValidate is filled is a string and is within a range of 2-3 characters
It will also validate that the emailToValidate in case it is provided is an actual email.


# Testing

If you need to test your project, then you can use the Testing tools included in the project.

>     const { TestingTools }  = require( 'event_request' );

The testing tools include a mocker. The mocker class can be retrieved with:

>     const { Mock }    = TestingTools;

The exported Mock is a Function that should be used directly on the constructor of the class you want to mock. For example:

>     class Test { mockThis(){} };  
>     let MockedTest    = Mock( Test );  

This will return the same class but with an extra _mock function added directly to it so make sure your original class does NOT
have a _mock function otherwise it will be overwritten. From here you can use the _mock function to mock any other function/parameter
that is attached to the 'Test' class:

>     let testDouble    = new MockedTest();  
>       testDouble._mock({  
>       method        : 'mockThis',  
>       shouldReturn  : ''  
>     });  

Note: As you can see when you mock a class you MUST specify what it should return from now on. You can also give instructions
on what should be returned on consecutive calls to this method like so :

>     let testDouble    = new MockedTest();  
>       testDouble._mock({  
>       method              : 'mockThis',  
>       onConsecutiveCalls  : ['first', 'secondAndOnwards']  
>     });

This will result in the following:
1. The first time you make a call to mockThis you will get 'first' as a return
2. The second time you make a call to mockThis you will get 'secondAndOnwards' as a return
3. Third time you make a call and any other following you will also get 'secondAndOnwards'


When making a mock of a class you can specify the MAX amount of times an object should be called. Since javascript uses
an async approach and relies heavily on callbacks, a minimum cannot be set.


>     let testDouble    = new MockedTest();  
>        testDouble._mock({  
>        method        : 'mockThis',  
>        shouldReturn  : '',  
>        called        : 1  
>     });

This way if the method mockThis is called more than once an error will be thrown.


You can also Specify the arguments that should be provided to the mocked method like so:


>     let testDouble    = new MockedTest();  
>       testDouble._mock({  
>       method        : 'mockThis',  
>       shouldReturn  : '',  
>       called        : 1,  
>       with:         [  
>           [ 'firstArgument', 'secondArgument' ]  
>           [ 'secondCallFirstArgument', 'secondCallSecondArgument' ]  
>        ]  
>     });  

The 'with' option accepts an array of arrays where each array in the with array is a call. Again if it's called more than
the times the with arguments, the last one will be returned. In case of mismatch an Error will be thrown.
If you do not want the mocker to check one of the arguments, then undefined should be passed

If you wan an environment to run your tests then you can use the test and runAllTests provided by the testing tools:

>     const { test, runAllTests }    = TestingTools;

The 'runAllTests' function accepts an object that accepts the following options:
* dieOnFirstError - Boolean - Whether the testing should stop on the first error - Defaults to true
* debug - Boolean - Whether errors thrown should show their entire stack or just the message - Defaults to false
* silent - Boolean - This will set the consoleLogger logLevel to error, meaning only errors will be displayed - Defaults to false
* filter - String - the string to search for and filter by when testing - Defaults to false

The run all tests will run all tests added by the test function.

The 'test' function accepts an object with the following options:

* message - String - the name of the test
* test - Function - the callback to execute.
* * the tester provides a done function as the first argument to the test callback. The done should be called just ONCE
and only when the test finishes. If done is called twice within the same test then that will be seen as an error and
the testing will stop.
* * If any arguments that evaluate to true are provided to done then the test will be seen as failed.

Example:

>     test({  
>       message    : 'This test should pass',  
>       test       : ( done ) =>{  
>          let one = 1;  
>            
>         one === 1 ? done() : done( 'One does not equal to one what are you doing?!' );  
>       }  
>     });  


You can also create your own Tester if you want separate test cases:

>     const { Tester }    = TestingTools;  
>     let tester          = new Tester();  

The tester has the same functions: 'test', 'runAllTests'

###Mocker
You can also use the Mocker class by:
 >      Mocker( classToMock, methodToMockOptions )
 where the methodToMockOptions are the same
as the _mock function of a testDouble. Note that this can alter a class before it is actually instantiated and WILL alter
the original class passed so it is suggested to be used ONLY on testDoubles


The TestingTools export:

	Tester, -> Tester constructor
	Mock,   -> Mock function
	Mocker,   -> the class used to mock methods of testDoubles. Please note that if you use this class you will alter the original one
	assert, -> nodejs assert module
	logger		: tester.consoleLogger, -> Predefined logger that has 3 log levels: error, success, info
	test		: tester.addTest.bind( tester ),
	runAllTests	: tester.runAllTests.bind( tester )



# Caching
There is an built-in in-memory caching server that works with promises

Below are the methods supported by the base DataServer and the in memory data server implements them

	/**
	 * @brief	Gets a instance of the current DataServer
	 *
	 * @return	DataServer
	 */
	static getInstance( options = {} );

	/**
	 * @brief	Sanitizes the configuration
	 *
	 * @param	Object options
	 */
	sanitize( options );

	/**
	 * @brief	Sets up the data server
	 *
	 * @details	Any connections to external sources should be done here if needed
	 *
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	setUp( options = {} );

	/**
	 * @brief	Disconnects from the data server
	 *
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	exit( options = {} );

	/**
	 * @brief	Create the namespace
	 *
	 * @details	If the Data Server supports namespaces ( folders on the file system, tables in CQL/SQl, etc )
	 *
	 * @param	String namespace
	 * @param	String options
	 *
	 * @return	Promise
	 */
	createNamespace( namespace, options = {} );

	/**
	 * @brief	Checks whether the namespace exists
	 *
	 * @details	Returns true if the namespace exists
	 *
	 * @param	String namespace
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	existsNamespace( namespace, options = {} );

	/**
	 * @brief	Deletes the namespace if it exists
	 *
	 * @details	Returns true if the namespace was deleted
	 *
	 * @param	String namespace
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	removeNamespace( namespace, options = {} );

	/**
	 * @brief	Create the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	mixed data
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	create( namespace, recordName, data = {}, options = {} );

	/**
	 * @brief	Checks whether the record exists
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	exists( namespace, recordName, options = {} );

	/**
	 * @brief	Update the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	mixed data
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	update( namespace, recordName, data = {}, options = {} );

	/**
	 * @brief	Read the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	read( namespace, recordName, options = {} );

	/**
	 * @brief	Delete the record
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	delete( namespace, recordName, options = {} );

	/**
	 * @brief	Get all records from the namespace
	 *
	 * @param	String namespace
	 * @param	Object options
	 *
	 * @return	Promise
	 */
	getAll( namespace, options = {} );

The create, update, read all accept ttl as an options which must be a number in milliseconds stating for how long the entry should be kept within the memory

The caching server is added to every event: event.cachingServer and can be used anywhere

### Again this caching server should not be used in production and is solely for development purposes.
