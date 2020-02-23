# EventRequest
A highly customizable backend server in NodeJs

[![Build Status](https://travis-ci.com/Michaelpalacce/EventRequest.svg?branch=master)](https://travis-ci.com/Michaelpalacce/EventRequest)

# GitHub
https://github.com/Michaelpalacce/EventRequest

# Example Projects:
https://github.com/Michaelpalacce/Server - A Web App that emulates a File System on your browser and can be used to upload/download/delete files, images, audio and etc. As well as stream videos directly from your browser

https://github.com/Michaelpalacce/ChatApp - An unfinished chat app using a combination of EventRequest and Socket.IO

# Installation
~~~bash
npm i event_request --save
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

Server.start( 80, ()=>{
	Loggur.log( 'Server started' );
});
~~~

#Properties exported by the Module:
	Server,				// Server callback. Use this to create a new server. The server instance can be retrieved from anywhere by: Server();
	Development,		// Holds Development tools
	Logging,			// Contains helpful logging functions
	Loggur,				// Easier access to the Logging.Loggur instance
	LOG_LEVELS,			// Easier access to the Logging.LOG_LEVELS object
### Properties exported by Development:
	BodyParserHandler,	// Used mainly for defining your own custom Body Handlers
	PluginInterface,	// Used to add plugins to the system
	LeakyBucket,		// An implementation of the Leaky Bucket algorithm: https://en.wikipedia.org/wiki/Leaky_bucket
	FileStream,			// Class that defines a file stream
	DataServer,			// Instance to be extended to implement your own DataServer
	Testing,			// Testing tools ( Mock, Tester( constructor ), logger( logger used by the testing suite ),
						// test( function to use to add tests ), runAllTests( way to run all tests added by test )
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

**setCookie( name, value, maxAge = -1, domain = '' )** - > sets a new cookie, maxAge defaults to 90 days and the domain defaults to the actual site domain

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

**getHeaderValue( key, defaultValue )** - Retrieves a header ( if exists ). If it doesn't exist the defaultValue will be taken

***

**hasHeader( key )** - Checks if a header exists. Returns Boolean

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
The main object of the framework.

To retrieve the Server class do:
~~~javascript
const { Server } = require( 'event_request' );
let server = Server();
~~~

To start the Server you can do:
~~~javascript
const { Server } = require( 'event_request' );
const app = Server();

Server.start( '80', ()=>{
	Loggur.log( 'Server is running' );
});
~~~

To clean up the server instance you can do:
~~~javascript
const { Server } = require( 'event_request' );
const app = Server();

Server.start( '80', ()=>{
	Loggur.log( 'Server is running' );
});

Server().cleanUp();
~~~
NOTES: 
- This will NOT stop the httpServer, just set the internal variable of server to null
- You may need to do  `app = Server()` again since they app variable is still a pointer to the old server

#

If you want to start the server using your own http/https server:
~~~javascript
const { Server } = require( 'event_request' );

const server = http.createServer( Server.attach() );

server.listen('80',()=>{
	console.log( 'Server is UN' )
});
~~~

Calling `Server()` anywhere will return the same instance of the Server.


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


### Events emitted by the server
**addRoute** - ( mixed route ) - When a new route is being added

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
~~~javascript
let { Server } = require( 'event_request' );

// You can create your own router
let router  = Server().Router();
router.add({
    method: 'GET',
    route: '/',
    handler: ( event)=>{
        event.send( '<h1>Hello World</h1>' );
    }
});

// To attach a router to the server simply call the add function of th server.
// Just like you would do to add a normal route.
Server().add( router );

// You can also get the router attached to the Server and use that directly
let serverRouter    = Server().router;
serverRouter.add(...);
~~~

###Router Wildcards
The route url can have a part separated by ":" on both sides that will be extracted and set to event.params
~~~javascript
let { Server } = require( 'event_request' );
// You can create your own router
let router  = Server().Router();
router.add({
    method: 'GET',
    route: '/todos/:id:',
    handler: ( event)=>{
        console.log( event.params.id );

        event.send( '<h1>Hello World</h1>' );
    }
});
~~~

###Router global middlewares
You can `define` middlewares in any router or the server. Middlewares will be merged if you add a router to another router.
These global middlewares can be used to call a function before another step in the chain.You can add multiple middlewares per route.
 
When adding middlewares to routes it can either be a single string or multiple strings in an array.
They are added as a final value in .app, .get, .post, etc, or using the key `middlewares` if using the .add method
~~~javascript
const app		= Server();
const router	= app.Router();

router.define( 'test', ( event )=>{
	Loggur.log( 'Middleware One!' );
	event.next();
} );

app.define( 'test2', ( event )=>{
	Loggur.log( 'Middleware Two!' );
	event.next();
} );

app.get( '/', ( event )=>{
	event.send( 'TEST' );
}, ['test','test2'] );

app.add({
	method: 'GET',
	route: '/test',
	middlewares: 'test',
	handler: ( event )=>{
		Loggur.log( 'Test!' );
		event.send( 'Test2' );
	}
});

app.add( router );

Server.start( 80, ()=>{
	Loggur.log( 'Server started' );
});
~~~


The server has 2 ways of adding routes/middleware

***
You can use .post, .put, .get, .delete, .head, .patch, .copy methods from the server that accept Required parameters: ( String|RegExp route, Function handler )

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

server.head( '/', ( event )=>{
	event.send( ['ok']);
} );

server.put( '/', ( event )=>{
	event.send( ['ok']);
} );

server.get( '/users/:user:', ( event )=>{
	console.log( event.params.user ); // Will print out whatever is passed in the url ( /users/John => 'John' )
	event.send( ['ok']);
} );

Server.start( 80 );
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

Router has matchRoute and matchMethod methods that can be used anywhere statically to match routes the same way the Router does.

**matchRoute** - ( String requestedRoute, String|RegExp route, matchedParams ) - Match the given route and returns any route parameters passed in the matchedParams argument. Returns bool if there was a successful match

**matchMethod** - ( String requestedMethod, String|RegExp method ) - Matches the requested method with the ones set in the event and returns if there was a match or no.

***
### Plugins
Plugins can be added by using **server.apply( pluginContainerInstance||'pluginId', options )**
Plugins can be added to the server.pluginManager and configured. Later on if you want to apply the preconfigured
plugin all you have to do is do: server.apply( 'pluginId' )

To enable IDE's smart autocomplete to work in your favor all the plugins
available in the pluginManager are exported as values in the server:

~~~
Server {
  ...
  er_timeout: 'er_timeout',
  er_env: 'er_env',
  er_rate_limits: 'er_rate_limits',
  er_static_resources: 'er_static_resources',
  er_cache_server: 'er_cache_server',
  er_templating_engine: 'er_templating_engine',
  er_file_stream: 'er_file_stream',
  er_logger: 'er_logger',
  er_body_parser: 'er_body_parser',
  er_session: 'er_session',
  er_response_cache: 'er_response_cache',
  er_body_parser_json: 'er_body_parser_json',
  er_body_parser_form: 'er_body_parser_form',
  er_body_parser_multipart: 'er_body_parser_multipart'
}
~~~
- Generally all the integrated plug-ins begin with `er_`

~~~javascript
const PluginManager	= server.getPluginManager();
let timeoutPlugin	= PluginManager.getPlugin( 'er_timeout' );

timeoutPlugin.setOptions( { timeout : 10 * 1000 } );
server.apply( timeoutPlugin );
server.apply( timeoutPlugin, {  timeout : 10 * 1000 } );// This will accomplish the same thing as the rows above
server.apply( 'er_timeout' ); // This is also valid.
server.apply( 'er_timeout', {  timeout : 10 * 1000 } ); // This is also valid.
server.apply( server.er_timeout ); // This is also valid.
server.apply( server.er_timeout, {  timeout : 10 * 1000 } ); // This is also valid.
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

## Default Logger:
The default logger is attached directly to the Loggur instance. it can be enabled or disabled by calling
Loggur.enableDefault() or Loggur.disableDefault(). 
The default Logger has a log level of `300` and logs up until level `600` which is the debug level.

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

If you want to change the log level of a logger it can easily be done with .setLogLevel( logLevel )

~~~javascript
logger.setLogLevel( 600 );
~~~

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

###Validation defaults

Validation results can also have defaults set. This is done by instead of passing a string of rules to the skeleton keys,
an object is passed with two values: rules and default

In case where the parameters have NOT been passed, the default value will be used.

~~~javascript
     let result	= event.validationHandler.validate(
        event.body,
        { 
            username : { rules: 'filled||string', default: 'root' }, 
            password : { rules: 'filled||string', default: 'toor' } 
        } 
     );

    console.log( result.hasValidationFailed() );
    console.log( result.getValidationResult() );
    
    // If errors were found hasValidationFailed would return true and getValidationResult will have a map 
    // of which input failed for whatever reason. Otherwise getValidationResult will return an object :
    // { 'username':'username', 'password': 'password'}
~~~

***
***
***

# LeakyBucket
This class can be used to limit data in one way or another.
The constructor accepts three parameters: `refillAmount = 100, refillTime = 60, maxAmount = 1000` where:
 - Refill Amount is how many tokens to refill after the refillTime
 - Refill Time is how often tokens should be renewed
 - Max Amount is the max amount of tokens to be kept
 
The class has the following functions:

**reset()** - Resets the tokens to full
**get()** - Returns the currently available tokens
**reduce( tokens = 1 ): Boolean** - How many tokens should be taken. This function returns Boolean whether there were enough tokens to be reduced or not



# Testing
If you need to test your project, then you can use the Testing tools included in the project.

~~~javascript
     const { Testing }  = require( 'event_request' );
~~~
The testing tools include a mocker. The mocker class can be retrieved with:

~~~javascript
     const { Mock }    = Testing;
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
If there is an err or an Error is thrown then the process with exit with code 1 otherwise it will exit with code 0

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
DataServer is a class that is exported through the Server.Development suite that stores data **IN MEMORY**
~~~javascript
const { Development }   = require( 'event_request' );
const { DataServer }    = Development;

console.log( DataServer );
~~~

The constructor accepts a configuration object.
 - **ttl** - Number - The time in seconds to be used as a default 'Time To Live' if none is specified. Defaults to 300 
 - **persistPath** - String - The absolute path of the file that will persist data. Defaults to <PROJECT_ROOT>/cache 
 - **persistInterval** - Number - The time in seconds after which data will be persisted. Defaults to 100
 - **gcInterval** - Number - The time in seconds after which data will be garbageCollected. Defaults to 60 
 - **persist** - Boolean - Flag that specifies whether the data should be persisted to disk. Defaults to true 

The DataServer provides a set of methods that have to be implemented if you want to create your own Caching server to be 
integrated with other plugins. 

- **stop(): void**

      - This will stop the connection of the DataServer. ( Delete all the files, flush memory and stop gc and persistence )
     
- **get( String key ): Object|null** 

      - Retrieves the value given a key. Returns null if the key does not exist.
      - This function is a 'public' method to be used by users.
      - In the case that you want to implement your own DataServer, you should override **_get( String key )**
      
- **_get( String key ): Object|null** 

      - This method is the protected method that should be implemented in case extension of the DataServer should be done
      - This method currently calls this._prune( key ) directly
      - No need to check if key is a String, that has been done in the _get method already.
      
- **_prune( String key ): Object|null** 

      - Removes the DataSet if it is expired, otherwise returns it. Returns null if the data is removed.
      - This method also sets the expiration of the DataSet to Infinity if it is null.
                            
                            
- **set( String key, mixed value, Number ttl = 0, Boolean persist = true ): Object|null** 

      - Returns the data if it was set, otherwise returns null
      - Sets the given key with the given value. 
      - ttl is the time in **seconds** that the data will be kept.
      - If ttl is -1 then the dataSet will NEVER expire
      - If ttl is 0 then the Default TTL will be used.
      - If ttl is > 0 then the value will be used
      - persist is a flag that will override the global persist value. You can set a key to not be persisted. 
                However if the global persist is set to false, this will not work
      - Calls _set() after checking the arguments if they are valid
               
                
- **_set( String key, mixed value, Number ttl = 0, Boolean persist = true ): Object|null** 

      - Implement for development. No need to do checks of the values of the parameter as that is done in the set() function
      - This function commits the key/value to memory with all it's attributes
      - Returns the data if it was set, otherwise returns null
      
- **_makeDataSet( String key, mixed value, Number ttl = 0, Boolean persist = true ): Object**  

      - Forms the dataSet object and returns it in the following format: `{ key, value, ttl, expirationDate, persist };`
      
- **touch( String key, Number ttl = 0 ): Boolean**

      - Retruns a Boolean whether the data was successfully touched
      - Retruns a false if key is not String or ttl is not Number
      - Calls _touch after checkinf if arguments are valid
      
- **_touch( String key, Number ttl = 0 ): Boolean**

      - Implement for development. No need to do checks of the values of the parameter as that is done in the touch() function
      - Retruns a Boolean whether the data was successfully touched
      - If ttl = 0 then the dataSet will be updated with it's own ttl
      - This function actually touches the data

- **delete( String key ): Boolean**

      - Deletes the given data

- **_delete( String key ): Boolean**

      - Implement for development. No need to do checks of the values of the parameter as that is done in the delete() function
      - This function deletes the actual data
      
- **_garbageCollect(): void**

      - Prunes all the data from the server if needed
      - Implement this if your Data Server needs it, otherwise leave it blank

- **_saveData(): void**

      - Persists all the data set to be persisted to disk 
      - This respects any data set with persist = false

- **_loadData(): void**
    
      - Loads all the data from disk

- **_getExpirationDateFromTtl( Number ttl = -1 ): Number**

      - Gets the the correct ttl according to the rules described in **set()**

**Mainly used for development purposes:**
- **length(): Number**

      - Returns how many keys there are

                            
                         
                         

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
Adds a Caching Server using the DataServer provided in the constructor if any.
This plugin will add a DataServer to: `event.cachingServer` 

    Accepted options: 
    **dataServerOptions** - Object - The options to be passed to the DataServer if the default one should be used
    **dataServer** - Object - An already instanciated child of DataServer to be used insted of the default one

You can add the plugin like:
~~~javascript
server.apply( 'er_cache_server' );

// OR if you have made a child of the DataServer:
server.apply( 'er_cache_server', { dataServer: new CustomDataServer() } );

// OR if you want to pass specific parameters to the default DataServer:
server.apply( 'er_cache_server', { dataServerOptions: { persist: false, ttl: 200, persistPath: '/root' } } );
~~~

The plugin can be used like:
~~~javascript
const { Server, Loggur }	= require( 'event_request' );
 
/**
 * @brief	Instantiate the server
 */
const server	= Server();

server.apply( 'er_cache_server', { persist: false } );
 
// Add a new Route
server.get( '/', ( event ) => {
    event.cachingServer.set( 'key', 'value' );

    console.log( event.cachingServer.get( 'key' ) );

    event.send( '<h1>Hello World!</h1>' );
});
 
Server.start( 80, ()=>{
    Loggur.log( 'Server started' );
});
~~~


***

###er_session 
@TODO DOCUMENT THIS


***

###er_templating_engine
Adds a templating engine to the event request ( the default templating engine is used just to render static HTML )
If you want to add a templating engine you have to set the engine parameters in the options as well as a templating directory

    * Accepted options: 
    * - engine - Object - Instance of a templating engine that has a method render defined that accepts
    *       html as first argument and object of variables as second -> Defaults to DefaultTemplatingEngine which can be used to serve static HTML
    * - templateDir - String - Where to draw the templates from -> Defaults to PROJECT_ROOT/public
***
~~~javascript
const PluginManager			= server.getPluginManager();
let templatingEnginePlugin	= PluginManager.getPlugin( 'er_templating_engine' );
templatingEnginePlugin.setOptions( { templateDir : path.join( __dirname, './public' ), engine : someEngineConstructor } ); 
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
    **strict** - Boolean - Whether the received payload must match the content-length - Defaults to false
            
    *** FormBodyParser Accepted options:
    *maxPayloadLength** - Number - The max size of the body to be parsed - Defaults to 10 * 1048576
    **strict** - Boolean - Whether the received payload must match the content-length - Defaults to false
***
~~~javascript
const PluginManager		= server.getPluginManager();
let loggerPlugin    	= PluginManager.getPlugin( 'er_logger' );
server.apply( loggerPlugin );
~~~

Example Setup:
~~~javascript

let bodyParserMultipartPlugin	= new BodyParserPlugin(
	'er_body_parser_multipart',
	{
		parsers	: [{ instance : MultipartFormParser, options : { tempDir : path.join( PROJECT_ROOT, '/Uploads' ) } }]
	}
);

server.apply( 'er_body_parser_json' );
server.apply( 'er_body_parser_form' );
server.apply( 
    'er_body_parser_multipart', {
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
