# EventRequest
A highly customizable backend server in NodeJs

# Installation
~~~bash
npm i event_request --save -g

event_request install ./NewProject
~~~


# Set up
~~~javascript
const { Server, Loggur }	= require( 'event_request' );

/**
 * @brief	Instantiate the server
 */
const server	= Server();

// Add a new Route
server.get( '/', ( event ) => {
	event.send( '<h1>Hello World!</h1>' );
});

server.start( ()=>{
	Loggur.log( 'Server started' );
});
~~~

#Properties exported by the Module:
	Server,				// Server callback. Use this to create a new server. The server instance can be retrieved from anywhere by: Server();
	Development,		// Holds Development tools
	Testing,			// Testing tools ( Mock, Tester( constructor ), logger( logger used by the testing suite ),
						// test( function to use to add tests ), runAllTests( way to run all tests added by test )
	Logging,			// Contains helpful logging functions
	Loggur,				// Easier access to the Logging.Loggur instance
	LOG_LEVELS,			// Easier access to the Logging.LOG_LEVELS object
### Properties exported by Development:
	PluginInterface,	// Used to add plugins to the system
	DataServer,			// Instance to be extended to implement your own DataServer

***
***
***

# Event Request
The event request is an object that is created by the server and passed through every single middleware.

### Properties of eventRequest
**queryString** - Object - the query string

***

**path** - String - the current path

***

**response** - Response - the response to be sent to the user 

***

**request** - Request - the request send by the user

***

**method** - String - the current method ( GET, POST, DELETE, PUT, etc)

***

**headers** - Object - the current headers 

***

**validationHandler** - ValidationHandler - A handler used to do input validation

***

**extra** - Object - an object that holds extra data that is passed between middlewares

***

**cookies** - Object - the current cookies

***

**params** - Object - request url params that are set by the router

***

**block** - Array - The execution block of middlewares

***

**logger** - Logger - Logs data

***


###Functions exported by the event request:

**setCookie( name, value )** - > sets a new cookie

***

**setStatusCode( Number code )** - > sets the status code of the response

***

**cleanUp** - cleans up the event request. Usually called at the end of the request. Emits a cleanUp event and a finished event. This also removes all other event listeners and sets all the properties to undefined

***

**send( response, statusCode, raw )** - sends the response to the user with the specified statusCode
* if response is a stream then the stream will be piped to the response
* if the raw flag is set to true then the payload will not be checked and just force sent, otherwise the payload must be a string or if it is not a sting it will be JSON stringified. Emits a 'send' event and calls cleanUp

***

**setHeader( key, value )** - sets a new header to the response and emits a 'setHeader' event. If the response is finished then an error will be set to the next middleware

***

**redirect( redirectUrl, statusCode )** - redirect to the given url with the specified status code (defaults to 302 ). Emits a 'redirect' event. If the response is finished then an error will be set to the next middleware

***

**isFinished()** - returns a Boolean. Checks if the response is finished

***

**next** - Calls the next middleware in the execution block. If there is nothing else to send and the response has not been sent YET, then send a server error. If the event is stopped and the response has not been set then send a server error

***

**sendError( error = '', code = 500 )** - Like send but used to send errors. This will emit an 'on_error' event as well as the usual send events 

***

### Events emitted by the EventRequest

**cleanUp** - no arguments - Emitted when the event request is cleaning up after finishing

***

**finished** - no arguments - Emitted when even cleaning up has finished and the eventRequest is completed

***

**send** - ( Object sendData ) - Emitted when a response has been sent.
sendData contains: 
    
    **code** - Number - the status code returned
    **raw** - Boolean - Whether the response was tried to be sent raw without parsing it to string first
    **response** - Mixed - The response that was returned
    **headers** - Object - The headers that were sent

***

**setHeader** - ( Object headerData ) - Emitted when a new header was added to the response
headerData contains:
    
    **key** - String - The header name
    **value** - String - The header value

***

**redirect** - ( Object redirectData ) - Emitted when a redirect response was sent
redirectData contains:
    
    **redirectUrl** - String - the url to which the redirect response was sent
    **statusCode** - String - the status code returned

***


***
***
***

# Server
The main object of the framework. Holds the server that is listening for incoming requests, router  and the pluginManager. Can be configured.
The Server exported from the event_request module is created like :
~~~javascript
const { Server } = require( 'event_request' );
let server = Server();
~~~
No more than one server can be created, so every time Server() is called it will return the same instance.
When creating the first instance, make sure to pass the desired options.

### The server callback accepts the following options:

**protocol** - String - The protocol to be used ( http || https ) -> Defaults to http

***

**httpsOptions** - Object - Options that will be given to the https webserver -> Defaults to {}

***

**port** - Number - The port to run the web-server on -> Defaults to 3000

***

**plugins** - Boolean - A flag that determines if the pre-installed plugins should be enabled or not -> Defaults to true

***

### Functions exported by the server:
**getPluginManager()** - returns PluginManager - Returns an instance of the plugin manager attached to the server

***

**add( Object|Route route )** - Adds a new route to the server

***

**apply( String|Object plugin, Object options )** - Applies a new plugin with the specified options

***

**getPlugin( String pluginId )** - PluginInterface returns the desired plugin

***

**hasPlugin( String pluginId )** - Boolean - Checks whether a plugin has been added to the server. Note this does not work with the plugin manager

***

**start( Function callback )** - Starts the server. Uses a negative callback. If there were no errors then false will be returned as well as the created server as a second argument

***

**stop()** - Stops the server

***

### Events emitted by the server
**addRoute** - ( mixed route ) - When a new route is being added

***

**serverStart** - no arguments - When the server is being started

***

**serverStop** - no arguments - When the server is being stopped

***

**serverCreationSuccess** - ( net.Server server, Number port ) - When the server is successfully started

***

**serverCreationError** - ( net.Server server, Error error ) - When an error occurs while starting the server

***

**eventRequestResolved** - ( EventRequest eventRequest, IncomingMessage request, ServerResponse response ) - When the event request is first created

***

**eventRequestRequestClosed** - ( EventRequest eventRequest, IncomingMessage request ) - When the request gets closed

***

**eventRequestResponseFinish** - ( EventRequest eventRequest, ServerResponse response ) - When the response is finished

***

**eventRequestResponseError** - ( EventRequest eventRequest, ServerResponse response, Error error ) - When there is an error with the response

***

**eventRequestBlockSetting** - ( EventRequest eventRequest, Array block ) - called when the block is retrieved from the router

***

**eventRequestBlockSet** - ( EventRequest eventRequest, Array block ) - called when the block is set in the eventRequest

***

**eventRequestError** - ( EventRequest eventRequest, Error error ) - called when there is an error event emitted by the eventRequest

***

**eventRequestThrow** - ( EventRequest eventRequest, Error error ) - called when an error is thrown from the eventRequest
***

***
### Ways to add routes using the Router or the Server:
When adding routes you have to use the Router class. 
The route url can have a part separated by ":" on both sides that will be extracted and set to event.params


~~~javascript
let { Server } = require( 'event_request' );

// You can create your own router
let router  = Server().Router();
router.add(...);

// To attach a router to the server simply call the add function of th server.
// Just like you would do to add a normal route.
Server().add( router );

// You can also get the router attached to the Server and use that directly
let serverRouter    = Server().router;
serverRouter.add(...);
~~~

The server has 2 ways of adding routes/middleware

***
You can use .post, .put, .get, .delete methods from the server that accept Required parameters: ( String|RegExp route, Function handler )

**route** -> String|RegExp-> the route to witch the middleware should be attached

***

**handler** -> Function -> the middleware to be added

***

~~~javascript
let server	= Server();

server.get( '/', ( event )=>{
	event.send( '<h1>Hello World!</h1>');
} );

server.post( '/', ( event )=>{
	event.send( ['ok']);
} );

server.delete( '/', ( event )=>{
	event.send( ['ok']);
} );

server.put( '/', ( event )=>{
	event.send( ['ok']);
} );

server.get( '/users/:user:', ( event )=>{
	console.log( event.params.user ); // Will print out whatever is passed in the url ( /users/John => 'John' )
	event.send( ['ok']);
} );

server.start();
~~~

***
When adding a Route the **server.add(route)** can be used. This can be used to attach another router
to the current one: server.add( router );


~~~javascript
server.add({
	route	: '/',
	method	: 'GET',
	handler	: ( event ) => {
		event.next( '<h1>Hello World!</h1>' )
	}
});
~~~
**handler** - Function - The callback function ! Required

***

**route** - String|RegExp - The route to match - optional if omitted the handler will be called on every request

***

**method** - String|Array - The method(s) to be matched for the route - optional if omitted the handler will be called on every request as long as the route matches

***

***
### Plugins
Plugins can be added by using **server.apply( pluginContainerInstance||'pluginId', options )**
Plugins can be added to the server.pluginManager and configured. Later on if you want to apply the preconfigured
plugin all you have to do is do: server.apply( 'pluginId' )

~~~javascript
const PluginManager	= server.getPluginManager();
let timeoutPlugin	= PluginManager.getPlugin( 'er_timeout' );

timeoutPlugin.setOptions( { timeout : 10 * 1000 } );
server.apply( timeoutPlugin );
server.apply( timeoutPlugin, {  timeout : 10 * 1000 } );// This will accomplish the same thing as the rows above
server.apply( 'er_timeout' ); // This is also valid.
server.apply( 'er_timeout', {  timeout : 10 * 1000 } ); // This is also valid.
~~~

###PRE-INSTALLED PLUGINS
These plugins are automatically added to the eventRequest. They can be preconfigured before calling server.start() the same
as other plugins by fetching them and configuring them as you wish. They can not be removed:

**er_static_resources**

***

**er_body_parser_json**

***

**er_body_parser_form**

***


###Read down to the Plugin section for more information

***
***
***

# Logging

The Loggur can be accessed directly from the server { Loggur }
It has a default logger attached to it that will log to the console. it can be enabled or disabled by calling
Loggur.enableDefault() or Loggur.disableDefault()

The Loggur can be used to create Loggers which accept the following options:

**serverName** - String - The name of the server to be concatenated with the uniqueId - Defaults to empty

***

**transports** - Array - Array of the transports to be added to the logger - Defaults to empty

***

**logLevel** - Number - The log severity level -> Defaults to error

***

**logLevels** - Object - JSON object with all the log severity levels and their values All added log levels will be attached to the instance of the logger class -> Defaults to LOG_LEVELS

***

**capture** - Boolean - Whether to attach event listeners for process.on uncaughtException and unhandledRejection - Defaults to false

***

**dieOnCapture** - Boolean - If the process should exit in case of a caught exception -> Defaults to true

***

**unhandledExceptionLevel** - Number - What level should the unhandled exceptions be logged at -> Defaults to error

***

Loggers can be added to the main instance of the Loggur who later can be used by: Loggur.log and will call all added Loggers
~~~javascript
let logger	= Loggur.createLogger({
	transports	: [
		new Console( { logLevel : LOG_LEVELS.notice } ),
	]
});

Loggur.addLogger( 'logger_id', logger );
~~~

Logger.log accepts 2 parameters: 
~~~javascript
    logger.log( 'Log' ); // This logs by default to an error level
    logger.log( 'Log', LOG_LEVELS.debug ); // LOG_LEVELS.debug === Number, this will log 'Log' with debug level
~~~

Each Logger can have it's own transport layers.
There are 2 predefined transport layers:

**Console**
    
    Accepted options:
    **color** - Boolean - Whether the log should be colored -> Defaults to true
    **logColors** - Object - The colors to use -> Defaults to
        [LOG_LEVELS.error]		: 'red',
        [LOG_LEVELS.warning]	: 'yellow',
        [LOG_LEVELS.notice]	: 'green',
        [LOG_LEVELS.info]		: 'blue',
        [LOG_LEVELS.verbose]	: 'cyan',
        [LOG_LEVELS.debug]		: 'white'

**File**
    
    Accepted options:
    **filePath** - String - the location of the file to log to -> if it is not provided the transport will not log

~~~javascript
const { Logging }							= require( 'event_request' );
const { Loggur, LOG_LEVELS, Console, File }	= Logging;

// Create a custom Logger
let logger	= Loggur.createLogger({
	serverName	: 'Test', // The name of the logger
	logLevel	: LOG_LEVELS.debug, // The logLevel for which the logger should be fired
	capture		: false, // Do not capture thrown errors
	transports	: [
		new Console( { logLevel : LOG_LEVELS.notice } ), // Console logger that logs everything below notice
		new File({ // File logger
			logLevel	: LOG_LEVELS.notice, // Logs everything below notice
			filePath	: '/logs/access.log', // Log to this place ( this is calculated from the root folder ( where index.js is )
			logLevels	: { notice : LOG_LEVELS.notice } // The Log levels that this logger can only log to ( it will only log if the message to be logged is AT notice level )
		}),
		new File({
			logLevel	: LOG_LEVELS.error,
			filePath	: '/logs/error_log.log',
		}),
		new File({
			logLevel	: LOG_LEVELS.debug,
			filePath	: '/logs/debug_log.log'
		})
	]
});
~~~

### Default log levels:
	error	: 100,
	warning	: 200,
	notice	: 300,
	info	: 400,
	verbose	: 500,
	debug	: 600

***
***
***

# Validation
The validation is done by using:

~~~javascript
    event.validationHandler.validate( objectToValidate, skeleton )
~~~

skeleton must have the keys that are to be validated that point to a string of rules separated by ||

### Possible rules are:

**rules** - if malformed rules string is passed

***

**optional** - if set as long as the input is empty it will always be valid. if not empty other possible rules will be called

***

**filled** - checks if the input is filled

***

**string** - checks if the input is a string

***

**notString** - checks if the input is NOT a string

***

**range** - Is followed by min and max aka: range:1-2 where 1 is the minimum and 2 maximum.

***

**min** - minimum input length

***

**max** - maximum input length

***

**email** - checks if the input is a valid email

***

**isTrue** - checks if the input evaluates to true

***

**isFalse** - checks if the input evaluates to false

***

**boolean** - checks if the input is a boolean

***

**notBoolean** - checks if the input is not a boolean

***

**numeric** - checks if the input is a number

***

**notNumeric** - checks if the input is not a number

***

**date** - checks if the input is a date

***

**same** - checks if the input is the same as another input aka: same:emailInput

***

**different** - checks if the input is different from another input aka: different:emailInput

***

**equals** - checks if the input equals another given string: equals:makeSureToEqualToThis

***


When validation is done a ValidationResult is returned. It has 2 main methods:
    getValidationResult that will return an object with the fields tested mapped to the errors found. Otherwise 
                        it will be an object with the fields tested mapped to the values ( done only if no errors found )
    hasValidationFailed that returns a boolean whether there is an error

~~~javascript
     let result	= event.validationHandler.validate(
        event.body,
        { username : 'filled||string', password : 'filled||string' } 
     );

    console.log( result.hasValidationFailed() );
    console.log( result.getValidationResult() );
    
    // If errors were found hasValidationFailed would return true and getValidationResult will have a map 
    // of which input failed for whatever reason. Otherwise getValidationResult will return an object :
    // { 'username':'username', 'password': 'password'}
~~~

The example will validate that the stringToValidate is filled is a string and is within a range of 2-3 characters
It will also validate that the emailToValidate in case it is provided is an actual email.

In case there is no error False will be returned


***
***
***

# Testing
If you need to test your project, then you can use the Testing tools included in the project.

~~~javascript
     const { TestingTools }  = require( 'event_request' );
~~~
The testing tools include a mocker. The mocker class can be retrieved with:

~~~javascript
     const { Mock }    = TestingTools;
~~~
The exported Mock is a Function that should be used directly on the constructor of the class you want to mock. For example:

~~~javascript
     class Test { mockThis(){} };  
     let MockedTest    = Mock( Test );  
~~~

This will return the same class but with an extra _mock function added directly to it so make sure your original class does NOT
have a _mock function otherwise it will be overwritten. From here you can use the _mock function to mock any other function/parameter
that is attached to the 'Test' class:

~~~javascript
     let testDouble    = new MockedTest();  
       testDouble._mock({  
       method        : 'mockThis',  
       shouldReturn  : ''  
     });  
~~~

Note: As you can see when you mock a class you MUST specify what it should return from now on. You can also give instructions
on what should be returned on consecutive calls to this method like so :

~~~javascript
     let testDouble    = new MockedTest();  
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
     let testDouble    = new MockedTest();  
        testDouble._mock({  
        method        : 'mockThis',  
        shouldReturn  : '',  
        called        : 1  
     });
~~~

This way if the method mockThis is called more than once an error will be thrown.

You can also Specify the arguments that should be provided to the mocked method like so:
~~~javascript
     let testDouble    = new MockedTest();  
       testDouble._mock({  
       method        : 'mockThis',  
       shouldReturn  : '',  
       called        : 1,  
       with:         [  
           [ 'firstArgument', 'secondArgument' ]  
           [ 'secondCallFirstArgument', 'secondCallSecondArgument' ]  
        ]  
     });  
~~~

The 'with' option accepts an array of arrays where each array in the with array is a call. Again if it's called more than
the times the with arguments, the last one will be returned. In case of mismatch an Error will be thrown.
If you do not want the mocker to check one of the arguments, then undefined should be passed

If you wan an environment to run your tests then you can use the test and runAllTests provided by the testing tools:

~~~javascript
     const { test, runAllTests }    = TestingTools;
~~~

The 'runAllTests' function accepts an object that accepts the following options:

**dieOnFirstError** - Boolean - Whether the testing should stop on the first error - Defaults to true

***

**debug** - Boolean - Whether errors thrown should show their entire stack or just the message - Defaults to false

***

**silent** - Boolean - This will set the consoleLogger logLevel to error, meaning only errors will be displayed - Defaults to false

***

**filter** - String - the string to search for and filter by when testing - Defaults to false

***

**callback** - Function - Callback to be called when testing is complete

***

The run all tests will run all tests added by the test function.

The 'test' function accepts an object with the following options:

**message** - String - the name of the test

***

**skipped** - Boolean - defaults to false - If this is set to true the test will be skipped

***

**incomplete** - Boolean - defaults to false - If this is set to true the test will be marked as incomplete

***

**dataProvider** - Array - Optional - If this is provided then an Array of Arrays must be supplied.

***

    
    For each Array supplied, a new test will be created and called with the Array elements set as arguments to the test callback
    
**test** - Function - the callback to execute.

    the tester provides a done function as the first argument to the test callback. The done should be called just ONCE
    and only when the test finishes. If done is called twice within the same test then that will be seen as an error and
    the testing will stop.
    If any arguments that evaluate to true are provided to done then the test will be seen as failed.

~~~javascript
     test({  
       message     : 'This test should pass',  
       dataProvier : [
           ['first', 2 ],
           ['firstTwo', 21 ],
       ],
       test        : ( done, first, second ) =>{  
          console.log( first ); this will log 'first', then on the second iterration 'firstTwo'
          console.log( second ); this will log 2, then on the second iterration 21
          let one = 1;  

         one === 1 ? done() : done( 'One does not equal to one what are you doing?!' );  
       }  
     });  
~~~

You can also create your own Tester if you want separate test cases:

~~~javascript
     const { Tester }    = TestingTools;  
     let tester          = new Tester();  
~~~

The tester has the same functions: 'test', 'runAllTests'

###Mocker
You can also use the Mocker class by:
~~~javascript
       Mocker( classToMock, methodToMockOptions )
~~~
 
Where the methodToMockOptions are the same as the _mock function of a testDouble. Note that this can alter a class before it is actually instantiated and WILL alter
the original class passed so it is suggested to be used ONLY on testDoubles


The TestingTools export:

	Tester, -> Tester constructor
	Mock,   -> Mock function
	Mocker,   -> the class used to mock methods of testDoubles. Please note that if you use this class you will alter the original one
	assert, -> nodejs assert module
	logger		: tester.consoleLogger, -> Predefined logger that has 3 log levels: error, success, info
	test		: tester.addTest.bind( tester ),
	runAllTests	: tester.runAllTests.bind( tester )

***
***
***

# Caching
There is an built-in in-memory and memory caching server that works with promises

NOTE: Memory caching server is deprecated
Both data servers have the same functionality 
The in-memory data server is loaded in the process.dataServer and is faster that the memory one 
which is an external service.

The data servers have several states that can be retrieved with getServerState():
~~~javascript
const SERVER_STATES	= {
	inactive		: 0,
	starting		: 1,
	running			: 2,
	stopping		: 3,
	stopped			: 4,
	startupError	: 5,
	stoppingError	: 6,
};
~~~

NOTICE: resolving with err will always be false. This is done so the negative callback is supported.

**getServerState()** -> Number, Returns the current server state

***

**setUp( Object options = {} )** -> Promise, resolve( false, status ), does not reject
memory_data_server:
    
    AcceptedOptions
        **memoryLimit** -> Number, the amount of bytes of data to be allocated to the server in bytes

***

**exit( Object options = {} )** -> Promise, resolve( false ), does not reject

***

**createNamespace( String namespace, Object options = {} )** -> Promise, resolve( false ), reject( err )

***

**existsNamespace( String namespace, Object options = {} )** -> Promise, resolve( Boolean exists ), reject( err ). 
 If the promise is rejected it would be in case of an error, not in case of the namespace not existing

***

**removeNamespace( String namespace, Object options = {} )** -> Promise, resolve( false ), reject( err ).
 This will reject if the namespace does not exist, so always do existsNamespace before hand.

***
 
**create( String namespace, String recordName, Object data = {}, Object options = {} )** -> Promise, resolve( false ), reject( err )
 This will reject if the namespace does not exist. 
 
    Accepted options:
        **ttl** -> Number, after how many milliseconds should the record be deleted

***

**exists( String namespace, String recordName, Object options = {} )** -> Promise, resolve( exists ), reject( err )
 This will resolve even if the namespace does not exist

***

**delete( String namespace, String recordName, Object options = {} )** -> Promise, resolve( false ), reject( err )
 This will reject if the namespace or if the record does not exist

***

**getAll( String namespace, Object options = {} )** -> Promise, resolve( Object data ), reject( err )
 Resolves with the entire namespace as an object. Rejects if the namespace does not exist

***

**read( String namespace, String recordName, Object options = {} )** -> Promise, resolve( Object data ), reject( err )
 Resolves with one record containing an object of the data stored with create or null if not found, Rejects on errors, does not reject if not found!

***

**touch( String namespace, String recordName, Object options = {} )** -> Promise, resolve( false ), reject( err )
 Rejects if the record does not exist
 
    Accepted options
        **ttl** -> Number, time to live

***

**update( String namespace, String recordName, Object recordData = {}, Object options = {} )** -> Promise, resolve( false ), reject ( err )
 Rejects if the record does not exist
 
    Accepted options
        **ttl** -> Number, time to live

# DataServerModel
Any Data Server created using the DataServer class will be cached and will be returned directly next time the model function is called
Any Data Server created using the DataServer class exported by the module has access to a 

**model( String namespace, Object options )** -> ModelClass

method that creates a new class that can be used to interact with the Data Servers.
 Options are intended for future implementations

The model class constructor accepts recordName, recordData, recordOptions. 

**recordName** -> String, The name under which the recordData will be stored

***

**recordData** -> Object, The data to be stored

***

**recordOptions** -> Object, The default options for the model. **NOTE** these should be set again if the model is retrieved from the data server

    Accepted options:
        **ttl** - Time for the data to live

***

### Function exported by the class:
**static getDataServer()** -> DataServer, the data server attached to the model

***

**save( Object options = {} )** -> Promise, resolve( false ), reject( err ) Saves the data to DataServer
 Will reject if the namespace is not created. This is a save return so even if the name is changed immediately or the data is, 
 the old one will still be saved

***

**delete( Object options = {} )** -> Promise, resolve( false ), reject( err ), Deletes the record if it exists
 Will not reject if it does not exist

***

**touch( Number ttl = 0, Object options = {} )** -> Promise, resolve( false ), reject( err ), Updates the records ttl if it exists
 Will reject if it does not exist

***

**static removeNamespaceIfExists( Object options = {} )** -> Promise, resolve( false ), reject( err ), Removes the namespace of the model if it exists
 Will not reject if it does not exist

***

**static createNamespaceIfNotExists( Object options = {} )** -> Promise, resolve( false ), reject( err ), Creates the namespace of the model if it exists
 Will not reject if it exists

***

**static createNamespace( Object options = {} )** -> Promise, resolve( false ), reject( err ), Creates the namespace of the model, deleting it if it exists
 Will not reject if it exists

***

**static existsNamespace( Object options = {} )** -> Promise, resolve( exists ), reject( err ), Returns whether the namespace exists

***

**static find( String recordName, Object options = {} )** -> Promise, resolve( Model|null model ), reject( err ), 
Returns a new model ( WITHOUT THE OPTIONS ) given the EXACT name. If it does not exist, null will be returned.
This does not reject if the namespace does not exist or the record does not exist

***

**static search( String searchQuery, Object options = {} )** -> Promise, resolve( [Model model] ), reject( err ), 
Returns all the records( WITHOUT THE OPTIONS ) given part of their name. Empty array is returned if none are found
This does not reject if the namespace does not exist or the record does not exist

***

**static findAndRemove( String recordName, Object options = {} )** -> Promise, resolve( false ), reject( err ), 
Finds and removes the EXACT record
This does not reject if the namespace does not exist or the record does not exist

***

**static searchAndRemove( String searchQuery, Object options = {} )** -> Promise, resolve( false ), reject( err ), 
DELETES all the records given part of their name.
This does not reject if the namespace does not exist or the record does not exist

***

**static make( String recordName = '', Object recordData = {}, Object recordOptions = {} )** -> Promise, resolve( Model model ), reject( err ), 
Creates and RETURNS a model. This will reject if the namespace does not exist

***

**static getAll( Object options = {} )** -> Promise, resolve( [Model model] ), reject( err ), 
Returns all the records( WITHOUT THE OPTIONS ) for the namespace.
This does not reject if the namespace does not exist.

***
***
***

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
The manager can be extracted from the created Server by:
~~~javascript
let pluginManager   = server.getPluginManager();
~~~

The Plugin manager contains pre loaded plugins. You can add your own plugins to it for easy control over what is used or 
if you want the bootstrap of the project to be in a different place.

The plugin Manager exports the following functions:

**addPlugin( plugin )** - accepts only a plugin of instance PluginInterface and only if it does not exist already otherwise throws an exception

**hasPlugin( id )** - checks if a plugin with the specified id exist

**removePlugin( id )** - removes a plugin 

**getAllPluginIds()** - returns an array with all the possible plugins

**getPlugin( id )** - returns a PluginInterface otherwise throw

## Available plugins:


###er_timeout
Adds a timeout to the request

    * Accepted options:
    **timeout** - Number - the amount of milliseconds after which the request should timeout - Defaults to 60 seconds
***
~~~javascript
const PluginManager	= server.getPluginManager();
let timeoutPlugin	= PluginManager.getPlugin( 'er_timeout' );
timeoutPlugin.setOptions( { timeout : envConfig.requestTimeout } );
server.apply( timeoutPlugin );
~~~

***

###er_static_resources
Adds a static resources path to the request

    * Accepted options: 
    **path** - String - The path to the static resources to be served. Defaults to 'public'
***
~~~javascript
const PluginManager			= server.getPluginManager();
let staticResourcesPlugin	= PluginManager.getPlugin( 'er_static_resources' );
staticResourcesPlugin.setOptions( { paths : ['public', 'favicon.ico'] } );
server.apply( staticResourcesPlugin );
~~~

***

###er_cache_server
Adds a memory cache server

    * Attaches itself on the event_request :
        ** event.cachingServer

    * Exported Functions:
    **startServer( callback )** -> starts the caching server and calls the callback when done. The first argument is a boolean with
        a negative return. False if everything went correctly, true on failure. The second argument will be the server if returned false
        callback( false, MemoryDataServer );
        callback( true );
    **use( server )** -> sets the server to be used. 
                        Passing memory will use the external memory server ( slower but works with clusters )
                        Passing in_memory will use the internal memory server ( faster and by default but does not work with clusters )
                        Passing an instance of DataServer will use the server passed and will skip setting it up.
    **getServer()** -> retruns the MemoryDataServer or null if not started
    **stopServer( callback )** -> stops the server and has the same behaviour as startServer but without a second argument
***
~~~javascript
const { Loggur }		= require( 'event_request' );
const PluginManager		= server.getPluginManager();
let cacheServerPlugin	= PluginManager.getPlugin( 'er_cache_server' );
cacheServerPlugin.startServer( ( err, server )=>{
	if ( err === false )
    {
        Loggur.log( 'Caching server started' );
        Loggur.log( server );
        Loggur.log( cacheServerPlugin.getServer ); // same as Loggur.log( server );
        
        cacheServerPlugin.stopServer(( err )=>{
        	if ( err === false )
            {
                Loggur.log( 'Caching server stopped' );
                Loggur.log( server ); // null
                Loggur.log( cacheServerPlugin.getServer ); // same as Loggur.log( server );
            }
            else
            {
                Loggur.log( 'Caching server stop failure' );
                Loggur.log( cacheServerPlugin.getServer ); // will still return an instance of MemoryDataServer
            }
        });
    }
	else
    {
        Loggur.log( 'Caching server start failure' );
        Loggur.log( cacheServerPlugin.getServer ); // will return null
    }
});


server.apply( cacheServerPlugin );
~~~

***

###er_session 
Session container

    * DEPENDENCIES:
    * er_cache_server
    
    * Accepted options: 
    * - callback - Function - Callback that should be called when the plugin is finished setting up
***
~~~javascript
let server		= Server();

let cacheServer	= server.getPluginManager().getPlugin( 'er_cache_server' );

cacheServer.startServer(()=>{
	server.apply( 'er_cache_server' );
	// attach session helpers
	server.apply( 'er_session' );

	// Initialize the session
	server.add({
		handler	: ( event )=>{
			// This will create a session in the cache server if it does not exist, if it exists,
			// then the session data will be fetched from the cache server
			event.initSession( event.next );
		}
	});

	// FIll the session
	server.add({
		handler	: ( event )=>{
			// NOTE: add and delete will NOT call save of the session. That must be done manually
			if ( ! event.session.has( 'authenticated' ) )
			{
				event.session.add( 'authenticated', true );
			}

			console.log( event.session.get( 'authenticated' ) );

			event.session.delete( 'authenticated' );

			console.log( event.session.get( 'authenticated' ) );

			event.session.saveSession( event.next );
		}
	});

	server.add({
		route	: '/',
		handler	: ( event )=>{
			event.send( 'Hello World!' );
		}
	});

	server.start(()=>{
		Loggur.log( 'Server started' )
	});
});
~~~

***

###er_templating_engine
Adds a templating engine to the event request ( the templating engine is not included this just adds the functionality )
If you want to add a templating engine you have to set the engine parameters in the options as well as a templating directory

    * Accepted options: 
    * - engine - Object - Instance of a templating engine that has a method render defined that accepts
    *       html as first argument, object of variables as second and a callback as third
    * - options - Object - options to be passed to the engine
***
~~~javascript
const PluginManager			= server.getPluginManager();
let templatingEnginePlugin	= PluginManager.getPlugin( 'er_templating_engine' );
templatingEnginePlugin.setOptions( { templateDir : path.join( __dirname, './templates' ), engine : someEngineConstructor } ); 
server.apply( templatingEnginePlugin );
~~~

***

###er_file_stream 
Adds a file streaming plugin to the site allowing different MIME types to be streamed
***
~~~javascript
const PluginManager		= server.getPluginManager();
let fileStreamPlugin	= PluginManager.getPlugin( 'er_file_stream' );
server.apply( fileStreamPlugin );
~~~

***

###er_logger 
Adds a logger to the eventRequest
Attaches a dumpStack() function as well as log( data, level ) function to the process for easier access
This can be controlled and turned off. The process.log( data, level ) calls the given logger
 
    Accepted options: 
    **logger** - Object - Instance of Logger, if incorrect object provided, defaults to the default logger from the Loggur
    **attachToProcess** - Object - Boolean whether the plugin should attach dumpStack and log to the process
***
~~~javascript
const PluginManager		= server.getPluginManager();
let loggerPlugin    	= PluginManager.getPlugin( 'er_logger' );
server.apply( loggerPlugin );
~~~

***

###er_body_parser, er_body_parser_json, er_body_parser_form, er_body_parser_multipart 
Adds an Empty bodyParser that can be set up, JsonBodyParser, FormBodyParser and MultipartBodyParser respectively

    **er_body_parser**
        Adds one or many BodyParser descendants
        **Accepted options:
            **parsers** - Array - Array of BodyParser descendants. If the array has a key default these parsers will be added:  
                { instance : FormBodyParser }, { instance : MultipartFormParser }, { instance : JsonBodyParser }
            
    *** MiltipartFormParser Accepted options:
    **maxPayload** - Number - Maximum payload in bytes to parse if set to 0 means infinite - Defaults to 0
    **tempDir** - String - The directory where to keep the uploaded files before moving - Defaults to the tmp dir of the os
            
    *** JsonBodyParser Accepted options:
    **maxPayloadLength** - Number - The max size of the body to be parsed - Defaults to 10 * 1048576
    **strict** - Boolean - Whether the received payload must match the content-length - Defaults to true
            
    *** FormBodyParser Accepted options:
    *maxPayloadLength** - Number - The max size of the body to be parsed - Defaults to 10 * 1048576
    **strict** - Boolean - Whether the received payload must match the content-length - Defaults to true
***
~~~javascript
const PluginManager		= server.getPluginManager();
let loggerPlugin    	= PluginManager.getPlugin( 'er_logger' );
server.apply( loggerPlugin );
~~~

Example Setup:
~~~javascript
let bodyParserJsonPlugin		= new BodyParserPlugin(
	'er_body_parser_json',
	{
		parsers	: [{ instance : JsonBodyParser }]
	}
);

let bodyParserFormPlugin		= new BodyParserPlugin(
	'er_body_parser_form',
	{
		parsers	: [{ instance : FormBodyParser }]
	}
);

let bodyParserMultipartPlugin	= new BodyParserPlugin(
	'er_body_parser_multipart',
	{
		parsers	: [{ instance : MultipartFormParser, options : { tempDir : path.join( PROJECT_ROOT, '/Uploads' ) } }]
	}
);
~~~

***

###er_response_cache 
Adds a response caching mechanism

    Accepted Options:
        **callback** -> This is a negative error callback that returns false if there was no problem setting up the server, true or Error if there was
        **useIp** -> wether the user Ip should be included when caching. This allows PER USER cache. -> Defaults to false
        **ttl** -> time to live for the record. Defaults to 60 * 5000 ms
***
~~~javascript
const PluginManager		= server.getPluginManager();
let cacheServer			= PluginManager.getPlugin( 'er_cache_server' );

cacheServer.startServer(()=>{
	Loggur.log( 'Caching server is set up' );
});

server.apply( cacheServer );
server.apply( PluginManager.getPlugin( 'er_response_cache' ) );

// call event.cacheCurrentRequest() where you want to cache.
server.add({
	route	: '/',
	method	: 'GET',
	handler	: ( event )=>{
		event.cacheCurrentRequest();
	}
});

// OR  You can create your own middleware that will be added to all requests
// you want to cache, no need to do it separately
server.add({
	handler	: ( event )=>{
		let pathsToCache    = ['/', '/sth', 'test'];
		if ( pathsToCache.indexOf( event.path ) !== -1 )
        {
            event.cacheCurrentRequest();
        }
		
		// Or use the router to match RegExp
	}
});

// When setting a request to be cached, ttl and useIp may be passed that will overwrite the default options
server.add({
	handler	: ( event )=>{
		let pathsToCache    = ['/', '/sth', 'test'];
        event.cacheCurrentRequest( { ttl: 20 * 1000, useIp: true } );
	}
});
~~~

***

###er_env 
Adds environment variables from a .env file to the process.env Object. In case the .env file changes
this plugin will automatically update the process.env and will delete the old environment variables.

    Accepted Options:
        **fileLocation** -> The absolute path to the .env file you want to use
***
~~~javascript
let server  = Server();
server.apply( 'er_env' );
server.add({
    handler : ( event )=>{
    	console.log( process.env );
    	
    	event.send( 'Done' );
    }
});
server.start();
~~~

***

### er_rate_limits
Adds a Rate limits plugin to the server. 
The rate limits plugin can monitor incoming requests and stop/delay/allow them if they are too many


    Accepted Options:
        **file** -> The absolute path to the rate limits json file. Defaults to ROOT DIR / rate_limits.json

The rate limits plugin will create a new rate_limits.json file in the root project folder IF one does not exist. 
If one exists, then the existing one's configuration will be taken. 

If you want to create custom rate limiting you can get er_rate_limits plugin and use getNewBucketFromOptions to get a new bucket, given options for it
options['maxAmount']
options['refillTime']
options['refillAmount']


Rate limit can be applied to different routes and different HTTP methods
Rate limit rule options:

** path -> String - the url path to rate limit ( blank for ALL )

** methods -> Array - the methods to rate limit ( blank for ALL )

**maxAmount -> Number - The maximum amount of tokens to hold

**refillTime -> Number - the time taken to refill the refillAmount of tokens

**refillAmount -> Number - the amount of tokens to refill when refilling happens

**policy -> String - The type of rate limiting to be applied

**delayTime -> Number - must be given if policy is connection_delay. After what time in seconds should we retry

**delayRetries -> Number - must be given if policy is connection_delay. How many retries to attempt

**stopPropagation -> Boolean - Whether to stop if the rate limiting rule matches and ignore other rules

**ipLimit -> Boolean - whether the rate limiting should be done per ip

*** POLICIES:

*PERMISSIVE_POLICY	= 'permissive';

This policy will let the client connect freely but a flag will be set that it was rate limited


*CONNECTION_DELAY_POLICY	= 'connection_delay';

This policy will rate limit normally the request and will hold the connection until a token is freed
If this is the policy specified then delayTime and delayRetries must be given. This will be the time after
a check should be made if there is a free token.
The first connection delay policy hit in the case of many will be used to determine the delay time but
all buckets affected by such a connection delay will be affected


* STRICT_POLICY	= 'strict';

This policy will instantly reject if there are not enough tokens and return an empty response with a 429 header.
This will also include a Retry-After header. If this policy is triggered, stopPropagation will be ignored and
the request will be immediately canceled

~~~json
[
  {
    "path": "",
    "methods": [],
    "maxAmount": 10000,
    "refillTime": 10,
    "refillAmount": 1000,
    "policy": "connection_delay",
    "delayTime": 3,
    "delayRetries": 5,
    "stopPropagation": false,
    "ipLimit": false
  }
]
~~~

~~~javascript
let server  = Server();
server.apply( 'er_rate_limits' )
~~~

***
