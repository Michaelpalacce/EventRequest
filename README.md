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
- Plugin Manager

# Event Request

The event request is an object that is created by the server and passed through every single middleware.
It contains the following properties:
* queryString - Object - the query string
* path - String - the current path
* response - Response - the response to be sent to the user 
* request - Request - the request send by the user
* method - String - the current method ( GET, POST, DELETE, PUT, etc)
* headers - Object - the current headers 
* validationHandler - ValidationHandler - A handler used to do input validation
* templateDir - String - the place where the templates are located
* templatingEngine - mixed - the templating engine to be used
* extra - Object - an object that holds extra data that is passed between middlewares
* cookies - Object - the current cookies
* params - Object - request url params that are set by the router
* body - Object - the body of the request set by the body parsers
* block - Array - The execution block of middlewares
* fileStreamHandler - FileStreamHandler - Holds different file streams within himself and is responsible for deciding which one to use
* errorHandler - ErrorHandler - set by the server. This is used to handle errors and format the messages
* logger - Logger - Logs data

Functions exported by the event request:

* cleanUp - cleans up the event request. Usually called at the end of the request. Emits a cleanUp event and a finished event
    This also removes all other event listeners and sets all the properties to undefined
* send( response, statusCode, raw ) - sends the response to the user with the specified statusCode
* * if response is a stream then the stream will be piped to the response
* * if the raw flag is set to true then the payload will not be checked and just force sent, otherwise the payload must be 
a string or if it is not a sting it will be JSON stringified. Emits a 'send' event and calls cleanUp
* setHeader( key, value ) - sets a new header to the response and emits a 'setHeader' event. If the response is finished then an error will be set to the next middleware
* redirect( redirectUrl, statusCode ) - redirect to the given url with the specified status code (defaults to 302 ). 
Emits a 'redirect' event. If the response is finished then an error will be set to the next middleware
* isFinished - checks if the response is finished
* render( templateName, variables, callback ) - this will try to render a template given that a templatingEngine is provided.
This emits a 'render' event
* setBlock - sets the middleware execution block for the event_request
* next - Calls the next middleware in the execution block. If there is nothing else to send and the response has not been sent YET, then send a server error
if the event is stopped and the response has not been set then send a server error
* sendError - Like send but used to send errors 
* getFileStreamHandler - Gets the file stream handler
* streamFile - streams a given file

# Properties exported by the Server:
	Server,				// The actual server to be used
	Router,				// The router. Can be used to add routes to it and then to the main server route
	ErrorHandler,		// Error handler to extend if you want to create a custom error handler
	SessionHandler,		// Session handler to be extended by other security modules
	BodyParserHandler,	// Body parser handler that contains the different body parsers
	DataServer,			// Instance to be extended to implement your own DataServer
	Testing,			// Testing tools ( Mock, Tester( constructor ), logger( logger used by the testing suite ),
						// test( function to use to add tests ), runAllTests( way to run all tests added by test )
	PluginInterface,	// Used to add plugins to the system
	PluginManager,		// Contains ready to use plugins
	Logging

# Server Options

The server is exported from the main module:

>     const { Server } = require( 'event_request' )

The server constructor accepts the following options:

**protocol** - String - The protocol to be used ( http || https ) -> Defaults to http

**httpsOptions** - Object - Options that will be given to the https webserver -> Defaults to {}

**port** - Number - The port to run the webserver/s on -> Defaults to 3000

**errorHandler** - ErrorHandler - The error handler to be called when an error occurs inside of the EventRequest -> Defaults to base errorHandler

## The server is started by calling server.start();

***

The server emits the following events:

* addRoute - ( mixed route ) - When a new route is being added
* serverStart - no arguments - When the server is being started
* serverStop - no arguments - When the server is being stopped
* serverCreationSuccess - ( net.Server server, Number port ) - When the server is successfully started
* serverCreationError - ( net.Server server, Error error ) - When an error occurs while starting the server
* eventRequestResolved - ( EventRequest eventRequest, IncomingMessage request, ServerResponse response ) - When the event request is first created
* eventRequestRequestClosed - ( EventRequest eventRequest, IncomingMessage request ) - When the request gets closed
* eventRequestResponseFinish - ( EventRequest eventRequest, ServerResponse response ) - When the response is finished
* eventRequestResponseError - ( EventRequest eventRequest, ServerResponse response, Error error ) - When there is an error with the response
* eventRequestBlockSetting - ( EventRequest eventRequest, Array block ) - called when the block is retrieved from the router
* eventRequestBlockSet - ( EventRequest eventRequest, Array block ) - called when the block is set in the eventRequest
* eventRequestError - ( EventRequest eventRequest, Error error ) - called when there is an error event emitted by the eventRequest
* eventRequestThrow - ( EventRequest eventRequest, Error error ) - called when an error is thrown from the eventRequest

***
The server has 3 ways of adding routes/middleware

When adding a Route the **server.add(route)** can be used

route accepts 3 parameters:
* handler - Function - The callback function ! Required
* route - String|RegExp - The route to match - optional if omitted the handler will be called on every request
* method - String|Array - The method(s) to be matched for the route - optional if omitted the handler will be called on every request as long as the route matches

***

Plugins can be added by using **server.apply( pluginContainerInstance )**

Read down to the Plugin section for more information

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

* templatingEngine -> Sets a templating engine to be used
* * Accepted options:
* * - engine - Mixed - Must be an object that defines a render function and will accept as first parameter template and as a second variables
* * - templateDir - String - Path to the templates

* bodyParser -> Adds one or many BodyParser descendants
* * Accepted options:
* * - parsers - Array - Array of BodyParser descendants. If the array has a key default these parsers will be added:  { instance : FormBodyParser }, { instance : MultipartFormParser }, { instance : JsonBodyParser }

* parseCookies -> Parses cookies and saves them to event.cookies

* addStaticPath -> adds static resource path
* * Accepted options:
* * - path - String - The path to make available


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

When validation is done a ValidationResult is returned. It has 2 main methods:
    getValidationResult that will return an array of error keys eg: ['string','min','max','range','filled']
    hasValidationFailed that returns a boolean whether there is an error

Example:

>     let body = { stringToValidate: 'str', emailToValidate: 'example@test.com' };
>     event.validationHandler.handle( body, { stringToValidate: 'filled||string||range:2-3',
>                                       emailToValidate: 'optional||email' }
>                                   );

The example will validate that the stringToValidate is filled is a string and is within a range of 2-3 characters
It will also validate that the emailToValidate in case it is provided is an actual email.

In case there is no error False will be returned


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
* skipped - Boolean - defaults to false - If this is set to true the test will be skipped
* incomplete - Boolean - defaults to false - If this is set to true the test will be marked as incomplete
* dataProvider - Array - Optional - If this is provided then an Array of Arrays must be supplied.
* * For each Array supplied, a new test will be created and called with the Array elements set as arguments to the test callback
* test - Function - the callback to execute.
* * the tester provides a done function as the first argument to the test callback. The done should be called just ONCE
and only when the test finishes. If done is called twice within the same test then that will be seen as an error and
the testing will stop.
* * If any arguments that evaluate to true are provided to done then the test will be seen as failed.

Example:

>     test({  
>       message     : 'This test should pass',  
>       dataProvier : [
>           ['first', 2 ],
>           ['firstTwo', 21 ],
>       ]
>       test        : ( done, first, second ) =>{  
>          console.log( first ); this will log 'first', then on the second iterration 'firstTwo'
>          console.log( second ); this will log 2, then on the second iterration 21
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


# PluginInterface
The PluginInterface has a getPluginMiddleware method that must return normal middleware objects implementing handler,
route, method keys or instances of Route. 

The PluginInterface has a setOptions function that can be used to give instructions to the Plugin when it is being 
created and added to the event request

The PluginInterface implements a getPluginDependencies method that returns an Array of needed plugins to work.
These plugins must be installed before the dependant plugin is.

When Using server.apply() you can pass a PluginContainer as well for easier functionality implementation.
This is also done to make it easier for middleware with options to be implemented as to not spaghetti code that is hard
to read and understand.

# Plugin Manager
The Plugin manager contains pre loaded plugins. You can add your own plugins to it for easy control over what is used or 
if you want the bootstrap of the project to be in a different place.

The plugin Manager exports the following functions:

* addPlugin( plugin ) - accepts only a plugin of instance PluginInterface and only if it does not exist already otherwise throws
    an exception
* hasPlugin( id ) - checks if a plugin with the specified id exist
* removePlugin( id ) - removes a plugin 
* getAllPluginIds - returns an array with all the possible plugins
* getPlugin( id ) - returns a PluginInterface otherwise throw

### Available plugins:

* event_request_timeout -> Adds a timeout to the request
##
    * Accepted options:
    * - timeout - Number - the amount of milliseconds after which the request should timeout - Defaults to 60 seconds
##

* event_request_static_resources -> Adds a static resources path to the request
##
    * Accepted options: 
    * - path - String - The path to the static resources to be served. Defaults to 'public'
##

* cache_server -> Adds a memory cache server

* event_request_session -> Handles sessions and security
##
    * DEPENDENCIES:
    * cache_server
##
    * Accepted options:
    * - sessionName - String - the session name ( aka cookie name ) - Defaults to DEFAULT_SESSION_NAME
    * - authenticationRoute - String - The route on which authentication should happen
    * - tokenExpiration - Number - The Time to keep the tokens before they expire - Defaults to DEFAULT_TOKEN_EXPIRATION_TIME
    * - authenticationCallback - Function - The callback to be called when authentication has to happen
    * 						This callback must return a boolean	- Defaults to DEFAULT_AUTHENTICATION_CALLBACK
    * - managers - Array - The managers to be added to the security ( they have 2 parameters : instance which
    * 					must be an instance of SecurityManager and options which are options to be passed
    * 					to that specific manager only


* event_request_templating_engine -> adds a templating engine to the event request ( the templating engine is not included this just adds the functionality )
If you want to add a templating engine you have to set the engine parameters in the options as well as a templating directory

## 
    * Accepted options: 
    * - engine - Object - Instance of a templating engine that has a method render defined that accepts
    *       html as first argument, object of variables as second and a callback as third
    * - options - Object - options to be passed to the engine
    
    
    
    
    
    
    
    