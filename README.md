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
npm i --save event_request 
~~~

# Set up
~~~javascript
const { Server, Loggur }	= require( 'event_request' );

/**
 * @brief	Instantiate the server
 */
const app	= Server();

// Add a new Route
app.get( '/', ( event ) => {
	event.send( '<h1>Hello World!</h1>' );
});

app.listen( 80, ()=>{
	Loggur.log( 'Server started' );
});
~~~

# Multiple Servers Setup:
~~~javascript
const { Server, Loggur }	= require( 'event_request' );
const http					= require( 'http' );

/**
 * @brief	Instantiate the server
 */
// With this setup you'll have to work only with the variables appOne and appTwo. You cannot call Server() to get any of them in different parts of the project
// This can be remedied a bit by creating routers in different controllers and then exporting them to be later on added 
const appOne		= new Server.class();
const appTwo		= new Server.class();

const httpServerOne	= http.createServer( appOne.attach() );
const httpServerTwo	= http.createServer( appTwo.attach() );

// Add a new Route
appOne.get( '/', ( event ) => {
	event.send( '<h1>Hello World!</h1>' );
});

// Add a new Route
appTwo.get( '/', ( event ) => {
	event.send( '<h1>Hello World x2!</h1>' );
});

httpServerOne.listen( 3334, ()=>{
	Loggur.log( 'Server one started at port: 3334' );
} );
httpServerTwo.listen( 3335, ()=>{
	Loggur.log( 'Server two started at port: 3335' );
} );
~~~

#Properties exported by the Module:
	Server,				// Server callback. Use this to create a new server. The server instance can be retrieved from anywhere by: Server();
	Testing,			// Testing tools ( Mock, Tester( constructor ), logger( logger used by the testing suite ),
						// test( function to use to add tests ), runAllTests( way to run all tests added by test )
	Logging,			// Contains helpful logging functions
	Loggur,				// Easier access to the Logging.Loggur instance
***
***
***

#Components:
- Components are parts of the server that can be used standalone or extended and replaced ( mostly )
- Any component can be retrieved from : event_request/server/components
- Extendable components are :
   - body_parsers => require( 'event_request/server/components/body_parsers/body_parser' )
   - caching => require( 'event_request/server/components/caching/data_server' )
   - error => require( 'event_request/server/components/error/error_handler' )
   - file_streams => require( 'event_request/server/components/file_streams/file_stream' )
   - rate_limiter => require( 'event_request/server/components/rate_limiter/bucket' )

#Plugins:
- Plugins are parts of the server that attach functionality to the EventRequest
- They can be retrieved from event_request/server/plugins
- They can also be retrieved from Server() ( look at the plugins section for more info )

# Event Request
The event request is an object that is created by the server and passed through every single middleware.

***
####Properties of eventRequest:

**queryString: Object** 
- The query string
- Will contain all query parameters in a JS object format

**path: String** 
- The current request path

**response: OutgoingMessage**
- The response that will be sent to the user 

**request: IncomingMessage** 
- The request sent by the user

**method: String** 
- The current request method 
- Can be: GET, POST, DELETE, PUT, PATCH, COPY, HEAD, etc

**headers: Object** 
- The current headers 
- They will be set in a JS object format

**validationHandler: ValidationHandler**
- A handler used to do input validation
- Look down for more information on how to use it

**extra: Object**
- An object that holds extra data that is passed between middlewares
- Usually used outside of plugins and native functions and is up to the client to implement if needed

**cookies: Object** 
- The current request cookies

**params: Object**
- Request url params that are set by the router
- In the case of route: '/user/:username:/get' the parameters will look like this: { username: 'some.username' }

**block: Array** 
- The execution block of middlewares
- Should not be touched usually

**clientIp: String**
- The ip of the client that sent the request

**finished: Boolean**
- Flag depicting if the request has finished or not

**errorHandler: ErrorHandler**
- Default or Custom error handler that will be called in case of an error

***
####Functions exported by the event request:

**setCookie( String name, String value, Object options = {} ): Boolean**
- Sets a new cookie with the given name and value
- Options will all be applied directly as are given.
- The options are case sensitive
- Available options: Path, Domain, Max-Age, Expires, HttpOnly
- Expires and Max-Age will be converted to date, so a timestamp in seconds must be passed
- If you wish to expire a cookie set Expires / Max-Age to a negative number
- { Path: 'test', expires: 100 } -> this will be set as 'cookieName=cookieValue; Path:test; expires:100'

**setStatusCode( Number code ): void**
- Sets the status code of the response
- If something other than a string is given, the status code will be assumed 500

**_cleanUp(): void** 
- Cleans up the event request.
- Usually called at the end of the request. 
- Emits a cleanUp event and a finished event. 
- This also removes all other event listeners and sets all the properties to undefined

**send( mixed response = '', Number statusCode = 200, Boolean raw ): void** 
- Sends the response to the user with the specified statusCode
- If response is a stream then the stream will be piped to the response
- if the raw flag is set to true then the payload will not be checked and just force sent, otherwise the payload must be a string or if it is not a sting it will be JSON stringified. 
- Emits a 'send' event and calls cleanUp
- The event will be emitted with a response if the response was a string or the isRaw flag was set to false 

**setHeader( String key, mixed value ): void** 
- Sets a new header to the response.
- Emits a 'setHeader' event. 
- If the response is finished then an error will be set to the next middleware

**removeHeader( String key ): void** 
- Removes an existing header from to the response.
- Emits a 'removeHeader' event. 
- If the response is finished then an error will be set to the next middleware

**redirect( String redirectUrl, Number statusCode = 302 ): void** 
- Redirect to the given url with the specified status code.
- Status code defaults to 302.
- Emits a 'redirect' event. 
- If the response is finished then an error will be set to the next middleware

**getHeader( String key, mixed defaultValue = null ): mixed** 
- Retrieves a header ( if exists ) from the request. 
- If it doesn't exist the defaultValue will be taken

**hasHeader( String key ): Boolean** 
- Checks if a header exists in the request

**isFinished(): Boolean** 
- Checks if the response is finished
- A response is finished if the response is finished or the cleanUp method has been called

**next( mixed err = undefined, Number code = undefined ): void** 
- Calls the next middleware in the execution block. 
- If there is nothing else to send and the response has not been sent YET, then send a server error with a status of 404
- If the event is stopped and the response has not been set then send a server error with a status of 500
- If err !== undefined send an error

**sendError( mixed error = '', Number code = 500 ): void** 
- Like send but used to send errors. 
- It will call the errorHandler directly with all the arguments specified ( in case of a custom error handler, you can send extra parameters with the first one being the EventRequest )
- This will emit an 'on_error' event as well as the usual send events 

***
####Events emitted by the EventRequest

**cleanUp()** 
- Emitted when the event request is about to begin the cleanUp phase.
- At this point the data set in the EventRequest has not been cleaned up

**finished()**
- Emitted when even cleaning up has finished and the eventRequest is completed
- At this point the data set in the EventRequest has been cleaned up

**send( Object sendData )**
- Emitted when a response has been sent.
- sendData contains: 
  
  -  **code: Number** 
     - The status code returned
     
  -  **raw: Boolean** 
     - Whether the response was tried to be sent raw without parsing it to string first
     
  -  **response: mixed** 
     - The response that was returned
     - Will not be sent if isRaw is true and the response was not a string 
     
  -  **headers: Object**
     - The headers that were sent

**setHeader( Object headerData )** 
- Emitted when a new header was added to the response
- headerData contains:
  -  **key: String** 
     - The header name
     
  -  **value: mixed** 
     - The header value

**removeHeader( Object headerData )** 
- Emitted when a header was removed
- headerData contains:
  -  **key: String** 
     - The header name

**redirect( Object redirectData )** 
- Emitted when a redirect response was sent
- redirectData contains:
    
  -  **redirectUrl: String** 
     - the url to which the redirect response was sent
     
  -  **statusCode: String** 
     - the status code returned

***
***
***

# Server
The main object of the framework.

- To retrieve the Server class do:
~~~javascript
const { Server } = require( 'event_request' );
const app = Server();
~~~

- To start the Server you can do:
~~~javascript
const { Server } = require( 'event_request' );
const app = Server();

app.listen( '80', ()=>{
	Loggur.log( 'Server is running' );
});
~~~

- To clean up the server instance you can do:
~~~javascript
const { Server } = require( 'event_request' );
const app = Server();

const httpServer = app.listen( '80', ()=>{
	Loggur.log( 'Server is running' );
});

httpServer.close();
Server().cleanUp();
~~~
NOTES: 
- This will stop the httpServer and set the internal variable of server to null
- You may need to do  `app = Server()` again since they app variable is still a pointer to the old server

- If you want to start the server using your own http/https server:
~~~javascript
const { Server } = require( 'event_request' );

const server = http.createServer( Server.attach() );

server.listen('80',()=>{
	console.log( 'Server is UN' )
});
~~~

- Calling `Server()` anywhere will return the same instance of the Server.


***
####Functions exported by the server:

**getPluginManager(): PluginManager** 
- Returns an instance of the plugin manager attached to the server

**add( Object|Route|Function route ): Server** 
- Calls Router.add

**apply( PluginInterface|String plugin, Object options ): Server** 
- Applies a new plugin with the specified options
- It first calls setOptions, then checks for dependencies, then calls plugin.setServerOnRuntime then calls plugin.getPluginMiddleware

**getPlugin( String pluginId ): PluginInterface** 
- PluginInterface returns the desired plugin
- Throws if plugin is not attached

**hasPlugin( String pluginId ): Boolean**  
- Checks whether a plugin has been added to the server. 
- This does not work with the plugin manager but the server's plugins

**define( String middlewareName, Function Middleware ): Server**  
- Calls Router.define

**Router(): Router**
- Returns a new Router instance that can be used anywhere and later on add() -ed back to the server

**attach(): Function**
- Returns the middleware needed by http.createServer or https.createServer

**listen( ... args )**
- Starts a http server.
- Any arguments given will be applied to httpServer.listen

***
####Events emitted by the server

**addRoute ( mixed route )**  
- When a new route is being added

**eventRequestResolved ( EventRequest eventRequest, IncomingMessage request, ServerResponse response )**  
- When the event request is first created

**eventRequestRequestClosed( EventRequest eventRequest, IncomingMessage request )** 
- When the request gets closed

**eventRequestResponseFinish( EventRequest eventRequest, ServerResponse response )** 
- When the response is finished

**eventRequestResponseError ( EventRequest eventRequest, ServerResponse response, Error error )** 
- When there is an error with the response

**eventRequestBlockSetting( EventRequest eventRequest, Array block )** 
- called when the block is retrieved from the router

**eventRequestBlockSet( EventRequest eventRequest, Array block )** 
- called when the block is set in the eventRequest

**eventRequestError( EventRequest eventRequest, Error error )** 
- called when there is an error event emitted by the eventRequest

**eventRequestThrow( EventRequest eventRequest, Error error )** 
- called when an error is thrown from the eventRequest

***
#Router

***
####Functions exported by the Router:

**static matchRoute( String requestedRoute, String|RegExp route, Object matchedParams ={} ): Boolean** 
- Match the given route and returns any route parameters passed in the matchedParams argument. 
- Returns bool if there was a successful match
- The matched parameters will look like this: { value: 'key' }
- If there is a passed RegExp then the matched parameters will look like: { match: regExpResult }

**matchRoute( String requestedRoute, String|RegExp route, Object matchedParams ={} ): Boolean** 
- Same as static

**static matchMethod( String requestedMethod, String|Array|RegExp method )** 
- Matches the requested method with the ones set in the event and returns if there was a match or no.

**matchMethod( String requestedMethod, String|Array|RegExp method )** 
- Same as static

**define( String middlewareName, Function middleware ): Router**
- Defines a global middleware
- Throws if a middleware with that name already exists


***
####Adding Routers:
- A router can be added by calling .add on another router: ( Router router )
- All the new router's routes will be added to the old one
- All the global middleware will be merged as well

~~~javascript
routerOne.add( '/test', routerTwo )
~~~

~~~javascript
// You can also attach the router to a route
const userRouter  = Server().Router();
userRouter.get( '/list', ( event )=>{
    event.send( { userOne: {}, userTwo: {} } );
});

userRouter.post( '/add/:username:', ( event )=>{
    // Add user to db or somewhere else
    event.send( 'ok' );
});

Server().add( '/user', userRouter );
~~~

***
####Adding Routers with path:
- A router can be added by calling .add on another router with a string route: ( String route, Router router )
- All the new router's routes will be pefixed with the given route
- All the global middleware will be merged as well

~~~javascript
routerOne.add( '/test', routerTwo )
~~~

~~~javascript
// You can also attach the router to a route
const userRouter  = Server().Router();
userRouter.get( '/list', ( event )=>{
    event.send( { userOne: {}, userTwo: {} } );
});

userRouter.post( '/add/:username:', ( event )=>{
    // Add user to db or somewhere else
    event.send( 'ok' );
});

Server().add( '/user', userRouter );
~~~

***
####Adding routes

- The server has 2 ways of adding routes/middleware

    - You can use .post, .put, .get, .delete, .head, .patch, .copy methods from the server that accept Required parameters: ( String|RegExp route, Function handler, Array||String middlewares = [] )

    - **ALTERNATIVELY** You can use those methods with the following commands: ( Function handler, Array||String middlewares = [] ) which will add a middleware to every route

- Routes can be added like this:
~~~javascript
const app	= Server();

app.get( '/', ( event )=>{
	event.send( '<h1>Hello World!</h1>');
} );

app.post( '/', ( event )=>{
	event.send( ['ok']);
} );

app.delete( '/', ( event )=>{
	event.send( ['ok']);
} );

app.head( '/', ( event )=>{
	event.send( ['ok']);
} );

app.put( '/', ( event )=>{
	event.send( ['ok']);
} );

app.get( '/users/:user:', ( event )=>{
	console.log( event.params.user ); // Will print out whatever is passed in the url ( /users/John => 'John' )
	event.send( ['ok']);
} );

app.listen( 80 );
~~~


***
- When adding a Route the **server.add(route)** or **router.add(route)** can be used. 
- The following parameters can be used when using .add():

####OBJECT CONTAINING:

**handler: Function** 
- The callback function 
- Required

**route: String|RegExp**
- The route to match 
- Optional if omitted the handler will be called on every request

**method: String|Array[String]**
- The method(s) to be matched for the route 
- Optional if omitted the handler will be called on every request as long as the route matches

**middlewares: String|Array[String]**
- The global middlewares if any to be called before this middleware
- Optional if omitted none will be called

- server.add accepts a object that must contain **handler** but **route**, **method** and **middlewares** are optional.
- ( { method: '', route: '', handler:()=>{} } )

####ROUTER: 
- You can use add to attach another router to the current one: server.add( router ) or router.add( router ) to combine 2 routers 

~~~javascript
Server().add( router );

// OR
routerOne.add( routerTwo )
~~~

####ROUTE + ROUTER
- .add also accepts a ( String route, Router router )
- All the new router's routes will be pefixed with the given route

~~~javascript
routerOne.add( '/test', routerTwo )
~~~

####FUNCTION:
- server.add can also accept a function that will be transformed into a route without method or route ( Function route )
~~~javascript
routerOne.add( ( event )=>{    
    event.next()
});
~~~

~~~javascript
const { Server } = require( 'event_request' );

// Adding a route
server.add({
	route	: '/',
	method	: 'GET',
	handler	: ( event ) => {
		event.send( '<h1>Hello World!</h1>' )
	}
});
~~~

~~~javascript
// You can create your own router
const router  = Server().Router();
router.add({
    method: 'GET',
    route: '/',
    handler: ( event)=>{
        event.send( '<h1>Hello World</h1>' );
    }
});
~~~

~~~javascript
// Adding a middleware without a method or route
router.add( ( event )=>{
	event.next();
});

server.add( ( event )=>{
    event.send( '<h1>Hello World x2!</h1>' );
});
~~~

~~~javascript
// To attach a router to the server simply call the add function of th server.
// Just like you would do to add a normal route.
Server().add( router );
~~~

~~~javascript
// You can also get the router attached to the Server and use that directly
const serverRouter    = Server().router;
serverRouter.add(...);
~~~

~~~javascript
// You can also attach the router to a route
const userRouter  = Server().Router();
userRouter.get( '/list', ( event )=>{
    event.send( { userOne: {}, userTwo: {} } );
});

userRouter.post( '/add/:username:', ( event )=>{
    // Add user to db or somewhere else
    event.send( 'ok' );
});

Server().add( '/user', userRouter );
~~~

***
####Router Wildcards
- The route url can have a part separated by ":" on both sides that will be extracted and set to event.params
~~~javascript
const { Server } = require( 'event_request' );
// You can create your own router
const router  = Server().Router();
router.add({
    method: 'GET',
    route: '/todos/:id:',
    handler: ( event)=>{
        console.log( event.params.id );
        event.send( '<h1>Hello World</h1>' );
    }
});

// Or
router.get( '/todos/:id:', ( event)=>{
    console.log( event.params.id );
    event.send( '<h1>Hello World</h1>' );
});
~~~

***
####Router global middlewares:

- You can `define` middlewares in any router or the server. Middlewares will be merged if you add a router to another router.
- These global middlewares can be used to call a function before another step in the chain.You can add multiple middlewares per route.
 
- When adding middlewares to routes it can either be a single string or multiple strings in an array.
- They are added as a final value in .app, .get, .post, etc, or using the key `middlewares` if using the .add method
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

app.listen( 80, ()=>{
	Loggur.log( 'Server started' );
});
~~~

***
***
***
# Logging

The `Logging` Suite exported by the module contains the following:
- Loggur -> instance of Loggur used to log data and create Loggers
- Logger -> The Logger class
- Transport -> The interface used by the loggers
- Console -> Transport that logs to the console
- File -> Transport that logs to a file
- Log -> The Log object used by all the internal classes
- LOG_LEVELS -> The Default log levels
- The Loggur can be accessed directly from the server { Loggur }

### Default Logger:
- The default logger is attached directly to the Loggur instance. it can be enabled or disabled by calling Loggur.enableDefault() or Loggur.disableDefault(). 
- The default Logger has a log level of `300` and logs up until level `600` which is the debug level.

- The Loggur can create Loggers with Loggur.createLogger({});

***
####Loggur.createLogger options:

**serverName: String** 
- The name of the server to be concatenated with the uniqueId 
- Defaults to empty

**transports: Array** 
- Array of the transports to be added to the logger 
- Defaults to empty

**logLevel: Number** 
- The log level lower than which everything will be logged
- This will also be the default logLevel for the logger
- Example: if the logLevel is set to LOG_LEVELS.info then info, notice, warning and error will be logged, but verbose and debug will not
- The higher a log level is the less sever it is
- Defaults to LOG_LEVELS.info

**logLevels: Object** 
- JSON object with all the log severity levels and their values All added log levels will be attached to the instance of the logger class 
- The logger will be able to log ONLY on these log levels
- If you have log levels: 100 and 200 and you try with a log level of 50 or a 300 it won't log
- Defaults to LOG_LEVELS

**capture: Boolean** 
- Whether to attach event listeners for process.on uncaughtException and unhandledRejection 
- Defaults to false

**dieOnCapture: Boolean** 
- If the process should exit in case of a caught exception 
- Defaults to true

**unhandledExceptionLevel: Number** 
- What level should the unhandled exceptions be logged at 
- Defaults to error

***
- If you want to change the log level of a logger it can easily be done with .setLogLevel( logLevel )
~~~javascript
logger.setLogLevel( 600 );
~~~

Loggers can be added to the main instance of the Loggur who later can be used by: Loggur.log and will call all added Loggers
~~~javascript
const logger	= Loggur.createLogger({
	transports	: [
		new Console( { logLevel : LOG_LEVELS.notice } ),
	]
});

Loggur.addLogger( 'logger_id', logger );
~~~

####Logging:


#####Logger.log: 
- Every logger has a log function that supports the following parameters: 

**Log: Log||String||mixed**
- What should be logged

**level: Number**
- The log level that we should log at
- optional
- Defaults to the default logLevel of the logger

**isRaw: Boolean**
- Whether we should attempt to log the data raw
- Only specific transport types support raw
- Defaults to false

~~~javascript
    logger.log( 'Log' ); // This logs by default to an error level
    logger.log( 'Log', LOG_LEVELS.debug ); // LOG_LEVELS.debug === Number, this will log 'Log' with debug level
    logger.log( { test: 'value' }, LOG_LEVELS.debug, true ); // This will log on debug and will try to log the data raw
~~~

#####Loggur.log: 
- The main Loggur has a log function that calls all the loggers added to it
- If there are no loggers it will call it's default logger if enabled

**Log: Log||String||mixed**
- What should be logged

**level: Number**
- The log level that we should log at
- optional
- Defaults to the default logLevel of the logger

**isRaw: Boolean**
- Whether we should attempt to log the data raw
- Only specific transport types support raw
- Defaults to false

~~~javascript
    Loggur.log( 'Log' ); // This logs by default to an error level
    Loggur.log( 'Log', LOG_LEVELS.debug ); // LOG_LEVELS.debug === Number, this will log 'Log' with debug level
    Loggur.log( { test: 'value' }, LOG_LEVELS.debug, true ); // This will log on debug and will try to log the data raw
~~~

#####logger.error || logger.debug etc: 
- Every logger attaches all the give log levels as functions that accept the following arguments:

**Log: Log||String||mixed**
- What should be logged

**isRaw: Boolean**
- Whether we should attempt to log the data raw
- Only specific transport types support raw
- Defaults to false

~~~javascript
    logger.error( 'Log' ); // This logs by default to an error level
    logger.debug( 'Log', true ); // This will log on debug and will try to log the data raw
~~~

Each Logger can have it's own transport layers.
There are 2 predefined transport layers:

###Console
- Logs data in the console
- It can log raw logs

***
####Accepted options:

**logLevel: Number**
- The log level lower than which everything will be logged
- This will also be the default logLevel for the logger
- Example: if the logLevel is set to LOG_LEVELS.info then info, notice, warning and error will be logged, but verbose and debug will not
- The higher a log level is the less sever it is
- Defaults to LOG_LEVELS.info

**logLevels: Array**
- JSON object with all the log severity levels and their values All added log levels will be attached to the instance of the logger class 
- The logger will be able to log ONLY on these log levels
- If you have log levels: 100 and 200 and you try with a log level of 50 or a 300 it won't log
- Defaults to LOG_LEVELS

**color: Boolean**
- Whether the log should be colored 
- Defaults to true

**logColors: Object** 
- The colors to use 
- Defaults to
    - [LOG_LEVELS.error]	: 'red',
    - [LOG_LEVELS.warning]	: 'yellow',
    - [LOG_LEVELS.notice]	: 'green',
    - [LOG_LEVELS.info]		: 'blue',
    - [LOG_LEVELS.verbose]	: 'cyan',
    - [LOG_LEVELS.debug]	: 'white'

###File
- Logs data to a file
- It can't log raw logs

***
####Accepted options:

**logLevel: Number**
- The log level lower than which everything will be logged
- This will also be the default logLevel for the logger
- Example: if the logLevel is set to LOG_LEVELS.info then info, notice, warning and error will be logged, but verbose and debug will not
- The higher a log level is the less sever it is
- Defaults to LOG_LEVELS.info

**logLevels: Array**
- JSON object with all the log severity levels and their values All added log levels will be attached to the instance of the logger class 
- The logger will be able to log ONLY on these log levels
- If you have log levels: 100 and 200 and you try with a log level of 50 or a 300 it won't log
- Defaults to LOG_LEVELS

**filePath: String**
- The location of the file to log to 
- If it is not provided the transport will not log

~~~javascript
const { Logging }							= require( 'event_request' );
const { Loggur, LOG_LEVELS, Console, File }	= Logging;

// Create a custom Logger
const logger	= Loggur.createLogger({
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
- error		: 100,
- warning	: 200,
- notice	: 300,
- info		: 400,
- verbose	: 500,
- debug		: 600

***
***
***

# Validation
The validation is done by using:

~~~javascript
    event.validationHandler.validate( objectToValidate, skeleton )
~~~

skeleton must have the keys that are to be validated that point to a string of rules separated by ||

***
#### Possible rules are:

**rules** 
- if malformed rules string is passed

**optional** 
- if set as long as the input is empty it will always be valid. if not empty other possible rules will be called

**filled** 
- checks if the input is filled

**string** 
- checks if the input is a string

**notString** 
- checks if the input is NOT a string

**range** 
- Is followed by min and max aka: range:1-2 where 1 is the minimum and 2 maximum.

**min** 
- minimum input length aka: min:10

**max** 
- maximum input length aka: max:50

**email** 
- checks if the input is a valid email

**isTrue** 
- checks if the input evaluates to true

**isFalse** 
- checks if the input evaluates to false

**boolean** 
- checks if the input is a boolean

**notBoolean** 
- checks if the input is not a boolean

**numeric** 
- checks if the input is a number

**notNumeric** 
- checks if the input is not a number

**date** 
- checks if the input is a date

**same** 
- checks if the input is the same as another input aka: same:emailInput

**different** 
- checks if the input is different from another input aka: different:emailInput

**equals** 
- checks if the input equals another given string: equals:makeSureToEqualToThis


When validation is done a ValidationResult is returned. It has 2 main methods:
    getValidationResult that will return an object with the fields tested mapped to the errors found. Otherwise 
                        it will be an object with the fields tested mapped to the values ( done only if no errors found )
    hasValidationFailed that returns a boolean whether there is an error

~~~javascript
     const result	= event.validationHandler.validate(
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
####Validation defaults

- Validation results can also have defaults set. 
- This is done by instead of passing a string of rules to the skeleton keys, an object is passed with two values: rules and default
- The rules must be optional otherwise validation will fail
- In case where the parameters have NOT been passed, the default value will be used.
~~~javascript
     const result	= event.validationHandler.validate(
        event.body,
        { 
            username : { rules: 'optional||string', default: 'root' }, 
            password : { rules: 'optional||string', default: 'toor' } 
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

***
####Accepted constructor arguments:

**refillAmount: Number**
- How many tokens to refill after the refillTime
- Defaults to 100

**refillTime: Number**
- How long after we should refill in seconds
- If 1 is passed and 2 seconds pass, we will refill refillAmount * 2 
- Defaults to 60

**maxAmount: Number**
- The max amount of tokens to be kept
- Defaults to 1000

**prefix: String**
- Prefix that the data will be stored under in the DataStore provided
- Defaults to $LB:

**key: String|null**
- The current key that the bucket is stored under
- If this is provided the bucket settings will be retrieved from the dataStore using this key without adding a prefix or generating a new one
- Defaults to null ( generate a random 64 chars key and add a prefix )

**dataStore: DataServer**
- Instance of a DataServer to use for storage
- By default uses the in memory one with persistency set to false and ttl set to: this.maxAmount / this.refillAmount * this.refillTime * 2

**dataStoreRefetchInterval: Number**
- Milliseconds after which a retry should be sent to the dataStore ( usually should be set to 1 or 2, set to more if the dataStore cannot handle a lot of traffic )
- Used to set the maxCounter using the following formula: Math.max( Math.floor( 1000 / dataStoreRefetchInterval ), 1 )
- Defaults to 1

***
####The class has the following functions:

**async init(): void**
- This has to be called before using the class

**async reset(): void**
- Resets the tokens to full

**async get(): Number**
- Returns the currently available tokens

**async reduce( tokens = 1 ): Boolean** 
- How many tokens should be taken. 
- This function returns Boolean whether there were enough tokens to be reduced or not

**async isFull(): Boolean** 
- This function returns Boolean whether the bucket is full

####Example:

~~~javascript
     const LeakyBucket  = require( 'event_request/server/components/rate_limiter/bucket' );
~~~

# Testing
If you need to test your project, then you can use the Testing tools included in the project.

~~~javascript
     const { Testing }  = require( 'event_request' );
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
     const { Mock }    = Testing;
~~~
The exported Mock is a Function that should be used directly on the constructor of the class you want to mock. For example:

~~~javascript
     class Test { mockThis(){} };  
     const MockedTest    = Mock( Test );  
~~~

This will return the same class but with an extra _mock function added directly to it so make sure your original class does NOT
have a _mock function otherwise it will be overwritten. From here you can use the _mock function to mock any other function/parameter
that is attached to the 'Test' class:

~~~javascript
     const testDouble    = new MockedTest();  
       testDouble._mock({  
       method        : 'mockThis',  
       shouldReturn  : ''  
     });  
~~~

Note: As you can see when you mock a class you MUST specify what it should return from now on. You can also give instructions
on what should be returned on consecutive calls to this method like so :

~~~javascript
     const testDouble    = new MockedTest();  
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
     const testDouble    = new MockedTest();  
        testDouble._mock({  
        method        : 'mockThis',  
        shouldReturn  : '',  
        called        : 1  
     });
~~~

This way if the method mockThis is called more than once an error will be thrown.

You can also Specify the arguments that should be provided to the mocked method like so:
~~~javascript
     const testDouble    = new MockedTest();  
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
     const { test, runAllTests }    = TestingTools;
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
###The 'test' function accepts an object with the following options:

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
       test        : ( done, first, second ) =>{  
          console.log( first ); //this will log 'first', then on the second iterration 'firstTwo'
          console.log( second ); //this will log 2, then on the second iterration 21
          let one = 1;  

         one === 1 ? done() : done( 'One does not equal to one what are you doing?!' );  
       }  
     });  
~~~

- You can also create your own Tester if you want separate test cases:
~~~javascript
     const { Tester }    = TestingTools;  
     let tester          = new Tester();  
~~~

- The tester has the same functions: 'test', 'runAllTests'

###Mocker
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
- test		: tester.addTest.bind( tester ),
- runAllTests	: tester.runAllTests.bind( tester )

***
***
***

#ErrorHandler 
- Error handler that can be extended to a custom one
- There is a default error handler in the event request
- This class can be extended and custom functionality may be written

***
####Accepted Options:

**NONE**

***
####Events:

**on_error: ( mixed error )**
- The error returned will be the one returned from ::_getErrorToEmit()

***
####Functions:

**handleError( EventRequest event, Error error, Number code = 500 ): void**
- Emits an on_error event 
- Calls _sendError
- In case of extension of the ErrorHandler, this may not need to be touched

**_getErrorToEmit( Error error ): mixed**
- Returns error to be emitted
- By default if error instanceof Error only the error.stack will be returned
- In case of extension of the ErrorHandler this function can be overwritten

**_formatError( Error error ): mixed**
- Returns error to be sent
- By default if error instanceof Error only the error.message will be returned
- In case of extension of the ErrorHandler this function can be overwritten

**_sendError( Error error ): mixed**
- Sends the error to the user
- Will not send if the response is finished
- In case of extension of the ErrorHandler this function can be overwritten

***
####Attached Functionality:

**event.errorHandler**
- This may be null, as the only time the ErrorHandler 

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
const app  = Server();
app.add(( event )=>{
	event.sendError( 'Error', 500 ); // This will call the error Handler
	event.next( 'Error', 500 ); // This will call the error Handler
	event.send( 'Error', 500 ); // This will !!NOT!! call the error Handler
});
app.listen( 80 );
~~~

***
***
***

#BodyParser
- Can be extended to create your own body parser that can later be given back to the body parser plugin
- Is an EventEmitter

#### Accepted options

**NONE**

#### Functions

**constructor( Object options = {} ): void**
- This sets the max listeners to 0 ( infinite )
- saves the options as this.options

**supports( EventRequest event ): Boolean**
- This function will be called by the BodyParserHandler attached by the body parser plugin before the parser is actually called
- It must return a Boolean
- If a parser returns that it supports the given request, no further body parsers will be called

**parse( EventRequest event ): Promise**
- Returns a promise
- This is called only if the body parser is supported.
- It resolves with a body that is then attached to event.body or rejects with an error

#### Examples

- If you want to add a custom BodyParser you can do:

~~~javascript
const BodyParserPlugin  = require( 'event_request/server/plugins/available_plugins/body_parser_plugin' )

// The CustomBodyParser is the class and the options are the end are the parameters to be passed to the class
// This is done because A new body parser will be created on each request
const plugin    = new BodyParserPlugin( CustomBodyParser, 'custom_body_parser', { optionOne: 123, optionTwo: 'value' } );
~~~

***
***
***

# DataServer
- DataServer is a class that is exported through the Server.Development suite that stores data **IN MEMORY**
- Is an EventEmitter
- Can be extended

~~~javascript
const DataServer   = require( 'event_request/server/components/caching/data_server' );

console.log( DataServer );
console.log( new DataServer( options ) );
~~~

***
#### Accepted options

**ttl: Number** 
- The time in seconds to be used as a default 'Time To Live' if none is specified. 
- If ttl is set to -1 then the data will never expire
- Defaults to 300 

**persistPath: String** 
- The absolute path of the file that will persist data. 
- Defaults to <PROJECT_ROOT>/cache 

**persistInterval: Number** 
- The time in seconds after which data will be persisted. 
- Defaults to 100

**gcInterval: Number** 
- The time in seconds after which data will be garbageCollected. 
- Defaults to 60 

**persist: Boolean** 
- Flag that specifies whether the data should be persisted to disk. 
- Defaults to true 

The DataServer provides a set of methods that have to be implemented if you want to create your own Caching server to be 
integrated with other plugins. 

#### Events:

**_saveDataError( Error error )**
- Emitted in case of an error while saving data

**_saveData()**
- Emitted when the data has finished saving

**stop()**
- Emitted when the server is stopping

#### Functions:
**stop(): void**
- This will stop the connection of the DataServer
- It calls _stop()
- It emits a 'stop' event
- It clears all the intervals
- It removes all the listeners

**_stop(): void**
- This method is the protected method that should be implemented in case extension of the DataServer should be done
- Removes the cache file

**_setUpPersistence(): void**
- This method is the protected method that should be implemented in case extension of the DataServer should be done
- It is called in the constructor to create the cache file we will be using if persistence is enabled

**get( String key ): Promise: Object|null** 
- Retrieves the value given a key. Returns null if the key does not exist.
- This function is a 'public' method to be used by users.
- In the case that you want to implement your own DataServer, you should override **_get( String key )**

**_get( String key ): Promise: Object|null** 
- This method is the protected method that should be implemented in case extension of the DataServer should be done
- This method currently calls this._prune( key ) directly
- No need to check if key is a String, that has been done in the _get method already.

**_prune( String key ): Promise: Object|null** 
- Removes the DataSet if it is expired, otherwise returns it. Returns null if the data is removed.
- This method also sets the expiration of the DataSet to Infinity if it is null.

**set( String key, mixed value, Number ttl = 0, Boolean persist = true ): Promise: Object|null** 
- Returns the data if it was set, otherwise returns null
- Sets the given key with the given value. 
- ttl is the time in **seconds** that the data will be kept.
- If ttl is -1 then the dataSet will NEVER expire
- If ttl is 0 then the Default TTL will be used.
- If ttl is > 0 then the value will be used
- persist is a flag that will override the global persist value. You can set a key to not be persisted. 
However if the global persist is set to false, this will not work
- Calls _set() after checking the arguments if they are valid

**_set( String key, mixed value, Number ttl = 0, Boolean persist = true ): Promise: Object|null** 
- Implement for development. No need to do checks of the values of the parameter as that is done in the set() function
- This function commits the key/value to memory with all it's attributes
- If the dataSet existed, then a key 'isNew' must be set to true or false
- Returns the data if it was set, otherwise returns null

**_makeDataSet( String key, mixed value, Number ttl, Boolean persist, Boolean isNew ): Object**  
- Forms the dataSet object and returns it in the following format: `{ key, value, ttl, expirationDate, persist, isNew };`
- The isNew value should be used ONLY when calling set

**touch( String key, Number ttl = 0 ): Promise: Boolean**
- Retruns a Boolean whether the data was successfully touched
- Retruns a false if key is not String or ttl is not Number
- Calls _touch after checkinf if arguments are valid

**_touch( String key, Number ttl = 0 ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the touch() function
- Retruns a Boolean whether the data was successfully touched
- If ttl = 0 then the dataSet will be updated with it's own ttl
- This function actually touches the data

**decrement( String key, Number value = 1, Number ttl = 0 ): Promise: Object|null**
- If value or ttl is not a number, returns null
- If the data was not set correctly returns null
- If the data to decrement was not set correctly returns null
- If the data to decrement was not numeric returns null
- Follows the same ttl rules as the rest
- Calls _decrement() after checking for validity of data

**_decrement( String key, Number value = 1, Number ttl = 0 ): Promise: Object|null**
- Implement for development. No need to do checks of the values of the parameter as that is done in the decrement() function
- Retrieves, decrements and then saves the new dataset 

**increment( String key, Number value = 1, Number ttl = 0 ): Promise: Object|null**
- If value or ttl is not a number, returns null
- If the data was not set correctly returns null
- If the data to increment was not set correctly returns null
- If the data to increment was not numeric returns null
- Follows the same ttl rules as the rest
- Calls _increment() after checking for validity of data

**_increment( String key, Number value = 1, Number ttl = 0 ): Promise: Object|null**
- Implement for development. No need to do checks of the values of the parameter as that is done in the increment() function
- Retrieves, increment and then saves the new dataset 

**delete( String key ): Promise: Boolean**
- Deletes the given data

**_delete( String key ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the delete() function
- This function deletes the actual data

**_garbageCollect(): void**
- Prunes all the data from the server if needed
- Implement this if your Data Server needs it, otherwise leave it blank

**_saveData(): void**
- Persists all the data set to be persisted to disk
- Extra measures have been taken so this operation will not break if it is running fast, however if the persist interval is too low it still may cause an issue while saving
- This respects any data set with persist = false

**_loadData(): void**
- Loads all the data from disk

**_getExpirationDateFromTtl( Number ttl = -1 ): Number**
- Gets the the correct ttl according to the rules described in **set()**

**Used for development purposes:**

**length(): Number**
- Returns how many keys there are


***
***
***


***
# Plugins
- Plugins can be added by using **server.apply( PluginInterfaceObject ||'pluginId', options )**
- Plugins can be added to the server.pluginManager and configured. Later on if you want to apply the preconfigured
    plugin all you have to do is do: server.apply( 'pluginId' )
- To enable IDE's smart autocomplete to work in your favor all the plugins 
   available in the pluginManager are exported as values in the server:
- The plugin interface can be retrieved like so:


~~~javascript
     const PluginInterface  = require( 'event_request/server/plugins/plugin_interface' );
~~~

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
const timeoutPlugin	= PluginManager.getPlugin( 'er_timeout' );

timeoutPlugin.setOptions( { timeout : 10 * 1000 } );
server.apply( timeoutPlugin );
server.apply( timeoutPlugin, {  timeout : 10 * 1000 } );// This will accomplish the same thing as the rows above
server.apply( 'er_timeout' ); // This is also valid.
server.apply( 'er_timeout', {  timeout : 10 * 1000 } ); // This is also valid.
server.apply( server.er_timeout ); // This is also valid.
server.apply( server.er_timeout, {  timeout : 10 * 1000 } ); // This is also valid.
~~~

***
***
***

# PluginInterface
The PluginInterface has a getPluginMiddleware method that must return an array of middleware objects implementing handler,
route, method keys or instances of Route. 

The PluginInterface has a setOptions function that can be used to give instructions to the Plugin when it is being 
created and added to the event request

The PluginInterface implements a getPluginDependencies method that returns an Array of needed plugins to work.
These plugins must be installed before the dependant plugin is.

The PluginInterface implements a setServerOnRuntime method that passes the server as the first and only argument.
Here the plugin can interact with the server.pluginBag to store any data it seems fit or may modify the server in one way or another.

Generally plugins should not have any business logic in the constructor and rather have that in the setServerOnRuntime or getPluginMiddleware
functions. This is the case because new options can be given to the plugin when attaching to the server.

This is how the flow of adding a plugin goes:

1. Check if there are any options passed and if so, apply them with setOptions
2. Check if dependencies are matched
3. setServerOnRuntime
4. getPluginMiddleware 


# Plugin Manager
The manager can be extracted from the created Server by:
~~~javascript
const pluginManager   = server.getPluginManager();
~~~

The Plugin manager contains pre loaded plugins. You can add your own plugins to it for easy control over what is used or 
if you want the bootstrap of the project to be in a different place.

The plugin Manager exports the following functions:

**addPlugin( plugin )** - accepts only a plugin of instance PluginInterface and only if it does not exist already otherwise throws an exception

**hasPlugin( id )** - checks if a plugin with the specified id exist

**removePlugin( id )** - removes a plugin 

**getAllPluginIds()** - returns an array with all the possible plugins

**getPlugin( id )** - returns a PluginInterface otherwise throw

# Available plugins:


#er_timeout
- Adds a timeout to the request

***
####Dependencies:

**NONE**

***
####Accepted Options:

**timeout**
- the amount of milliseconds after which the request should timeout - Defaults to 60 seconds or 60000 milliseconds

***
####Events:

**clearTimeout()**
- Emitted when the event.clearTimeout() function is called if there was a timeout to be cleared

***
####Exported Functions:

**clearTimeout(): void**
- Clears the Request Timeout
- Will do nothing if there is no timeout

***
####Attached Functionality:

**event.internalTimeout: Timeout**
- The request timeout set in the EventRequest

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
app.apply( 'er_timeout', { timeout: 10000 } );

// OR
app.apply( 'er_timeout' );

// OR
app.apply( app.er_timeout );

// OR
const PluginManager	= app.getPluginManager();
const timeoutPlugin	= PluginManager.getPlugin( 'er_timeout' );

timeoutPlugin.setOptions( { timeout : 10000 } ); // 10 seconds
app.apply( timeoutPlugin );
~~~

***
***
***

#er_static_resources
- Adds a static resources path to the request.
- By default the server has this plugin attached to allow favicon.ico to be sent
- The Content-Type header will be set with a mime type if the file is css or js

***
####Dependencies:

**NONE**

***
####Accepted Options:

**paths: Array[String] | String**
- The path/s to the static resources to be served. Defaults to 'public'
- Can either be an array of strings or just one string
- The path starts from the root of the project ( where the node command is being executed )

***
####Events:

**NONE**

***
####Exported Functions:

**NONE**

***
####Attached Functionality:

**NONE**

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
app.apply( app.er_static_resources, { paths : ['public'] } );

//OR
app.apply( 'er_static_resources', { paths : ['public'] } );

//OR
app.apply( 'er_static_resources' );

//OR
app.apply( app.er_static_resources );

//OR
const PluginManager			= app.getPluginManager();
const staticResourcesPlugin	= PluginManager.getPlugin( 'er_static_resources' );

staticResourcesPlugin.setOptions( { paths : ['public', 'favicon.ico'] } );
app.apply( staticResourcesPlugin );
~~~

***
***
***

#er_cache_server
- Adds a Caching Server using the DataServer provided in the constructor if any.
- This plugin will add a DataServer to: `event.cachingServer` 

***
####Dependencies:

**NONE**

***
####Accepted Options:

**dataServerOptions: Object** 
- The options to be passed to the DataServer if the default one should be used

**dataServer: Object**
 - An already instantiated child of DataServer to be used insted of the default one

***
####Events:

**NONE**

***
####Exported Functions:

**NONE**

***
####Attached Functionality:

**event.cachingServer: DataServer**
- The caching server will be available to be used within the EventRequest after it has been applied in the middleware block
- You can retrieve the DataServer from any other plugin after this one has been applied by doing: server.getPlugin( 'er_cache_server' ).getServer()

***
####Exported Plugin Functions:

**getServer(): DataServer**
- Returns the instance of the DataServer, following a singleton pattern

***
####Example:

- You can add the plugin like:
~~~javascript
app.apply( 'er_cache_server' );

// OR
app.apply( app.er_cache_server );

// OR if you have made a child of the DataServer:
app.apply( app.er_cache_server, { dataServer: new CustomDataServer() } );

// OR if you want to pass specific parameters to the default DataServer:
app.apply( app.er_cache_server, { dataServerOptions: { persist: false, ttl: 200, persistPath: '/root' } } );
~~~

- The plugin can be used like:
~~~javascript
const { Server, Loggur }	= require( 'event_request' );
 
/**
 * @brief	Instantiate the server
 */
const app	= Server();

app.apply( app.er_cache_server, { persist: false } );
 
// Add a new Route
app.get( '/', ( event ) => {
    event.cachingServer.set( 'key', 'value' );

    console.log( event.cachingServer.get( 'key' ) );

    event.send( '<h1>Hello World!</h1>' );
});
 
app.listen( 80, ()=>{
    Loggur.log( 'Server started' );
});
~~~

***
***
***

#er_session 
- Adds a Session class.
- The session works with a cookie.
- The cookie will be sent back to the client who must then return the cookie back.

***
####Dependencies:

 **er_cache_server**

***
####Accepted Options:

**ttl: Number**
- Time in seconds the session should be kept. 
- Defaults to 90 days or 7776000 seconds

**sessionKey: String**
- The cookie name. 
- Defaults to `sid`

**sessionIdLength: Number**
- The size of the session name. 
- Defaults to 32

***
####Events:

**NONE**

***
####Exported Functions:

**initSession( Function callback ): Promise** 
- Initializes the session. This should be called in the beginning when you want to start the user sesion
- This will initialize a new session if one does not exist and fetch the old one if one exists
- The callback will return false if there was no error

***
####Attached Functionality:

**event.session: Session**

- This is the main class that should be used to manipulate the user session.
- There is no need to save the changes done to the session, that will be done automatically at the end of the request

***
####The Session exports the following functions:

**hasSession(): Promise: Boolean**
- Returns true if the user has a session started. 
- Generally will be false before you call initSession

**removeSession(): Promise: void**
- Deletes the current session from the caching server directly

**newSession(): Promise: String||Boolean**
- Resolves to the new sessionId or to false if failed

**add( String name, mixed value ): void**
- Adds a new value to the session given a key

**get( String key ): mixed**
- Gets a value from the session

**delete( String key ): void**
- Deletes a key from the session

**has( String key ): Boolean**
- Checks if the session has the given key

**saveSession( String sessionId = currentSessionId ): Promise: Boolean**
- Save the current session
- The session id parameter is there for when switching sessions or creating new ones to not save the sessionId if it was not successfully created ( done internally )
- You probably should never pass a sessionId 

***
####Exported Plugin Functions:

**NONE**

***
####Example:

- You can use the session like this:
~~~javascript
const { Loggur, Server } = require( 'event_request' );

const app	= Server();

// Initialize the session
app.add( async ( event )=>{
	event.initSession( event.next ).catch( event.next );
});

// Redirect to login if authenticated is not true
app.add(( event )=>{
	if (
		event.path !== '/login'
		&& ( ! event.session.has( 'authenticated' ) || event.session.get( 'authenticated' ) === false )
	) {
		event.redirect( '/login' );
		return;
	}

	event.next();
});

app.post( '/login', async ( event )=>{
	const result	= event.validationHandler.validate( event.body, { username : 'filled||string', password : 'filled||string' } );

	if ( result.hasValidationFailed() )
	{
		event.render( '/login' );
		return;
	}

	const { username, password }	= result.getValidationResult();

	if ( username === 'username' && password === 'password' )
	{
		event.session.add( 'username', username );
		event.session.add( 'authenticated', true );

		event.redirect( '/' );
	}
	else
	{
		event.render( '/login' );
	}
});

app.listen( 80, ()=>{
    Loggur.log( 'Server started' );
});
~~~

***
***
***

#er_templating_engine
- Adds a templating engine to the event request ( the default templating engine is used just to render static HTML )
- If you want to add a templating engine you have to set the engine parameters in the options as well as a templating directory

***
####Dependencies:

**NONE**

***
####Accepted Options:

**engine: Object**
- Instance of a templating engine that has a function render
- The render function should accept html as first argument and object of variables as second 
- Defaults to DefaultTemplatingEngine which can be used to serve static HTML

**templateDir: String**
- Where to draw the templates from 
- Defaults to PROJECT_ROOT/public

***
####Events:

**render ( String templateName, Object variables )**
- Emitted in the beginning of the rendering process if everything has been started successfully 


***
####Exported Functions:

**render( String templateName, Object variables = {}, Function errorCallback = null ): Promise**
- templateName will be the name of the file without the '.html' extension starting from the tempateDir given as a base ( folders are ok )
- The variables should be an object that will be given to the templating engine
- The promise will be resolved in case of a successful render. Note: you don't have to take any further actions, at this point the html has already been streamed
- The promise will be rejected in case of an error with the error that happened. Note: In case of an error no further actions are needed as event.next is going to be automatically called and the errorHandler will take care of the error
- If you want to handle the error yourself, an errorCallback must be provided
- 'render' event will be emitted by the EventRequest in the beginning with details on what is being rendered

***
####Attached Functionality:

**event.templatingEngine: TemplatingEngine**
- The templating engine to be used with the render function
- Defaults to DefaultTemplatingEngine

**event.templateDir: String**
- The absolute path to where the templates are held
- Defaults to path.join( PROJECT_ROOT, './public' )

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
app.apply( app.er_templating_engine, { templateDir: path.join( __dirname, './public' ) } );

// OR
app.apply( 'er_templating_engine' );

// OR
app.apply( app.er_templating_engine );

// OR
const PluginManager				= server.getPluginManager();
const templatingEnginePlugin	= PluginManager.getPlugin( app.er_templating_engine );

templatingEnginePlugin.setOptions( { templateDir : path.join( __dirname, './public' ), engine : someEngineConstructor } ); 
app.apply( templatingEnginePlugin );

// THEN

router.get( '/preview', ( event ) => {
		// If you have a templating engine that supports parameters:
		event.render( 'preview', { type: 'test', src: '/data' }, event.next );

		// Otherwise the default one can only render html
		event.render( 'preview', {}, event.next );
	}
);
~~~

***
***
***

#er_file_stream 
- Adds a file streaming plugin to the site allowing different MIME types to be streamed
- Currently supported are :
  - Images: '.apng', '.bmp', '.gif', '.ico', '.cur', '.jpeg', '.jpg', '.jfif', '.pjpeg', '.pjp', '.png', '.svg', '.tif', '.tiff', '.webp'
  - Videos: '.mp4', '.webm'
  - Text: '.txt', '.js', '.php', '.html', '.json', '.cpp', '.h', '.md', '.bat', '.log', '.yml', '.ini', '.ts', '.ejs', '.twig', '', '.rtf', '.apt', '.fodt', '.rft', '.apkg', '.fpt', '.lst', '.doc', '.docx', '.man', '.plain', '.text', '.odm', '.readme', '.cmd', '.ps1'
  - Audio: '.mp3', '.flac', '.wav', '.aiff', '.aac'
- The VideoFileStream can be paired up with an HTML5 video player to stream videos to it
- The AudioFileStream can also be paired up with an HTML5 video player to stream audio to it
- An 'stream_start' event will be emitted by the EventRequest the moment the stream is going to be started 
- Each file stream has a getType method that returns whether it is a video, text, image or audio
- Files with no extension will be treated as text files

***
####Dependencies:

**NONE**

***
####Accepted Options:

**NONE**

***
####Events:

**stream_start ( FileStream stream )**
- Emitted when the stream is successfully started

***
####Exported Functions:

**streamFile( String file, Object options = {}, errCallback ): void** 
- This function accepts the absolute file name ( file ) and any options that should be given to the file stream ( options )
- This function may accept an errCallback that will be called if there are no fileStreams that can handle the given file, otherwise call it will call event.next() with an error and a status code of 400

**getFileStream( file, options = {} ): FileStream | null**
- This function accepts the absolute file name ( file ) and any options that should be given to the file stream ( options )
- This function will return null if no file streams were found or in case of another error

***
####Attached Functionality:

**event.fileStreamHandler: FileStreamHandler**
- The file stream handler used to create file streams

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
const PluginManager		= app.getPluginManager();
const fileStreamPlugin	= PluginManager.getPlugin( 'er_file_stream' );
app.apply( fileStreamPlugin );

// OR
app.apply( app.er_file_stream );

// OR
app.apply( 'er_file_stream' );
~~~

- Example of streaming data:
~~~javascript
const fs = require( 'fs' );

app.get( '/data', ( event ) =>{
		const result	= event.validationHandler.validate( event.queryString, { file: 'filled||string||min:1' } );
		const file		= ! result.hasValidationFailed() ? result.getValidationResult().file : false;

		if ( ! file || ! fs.existsSync( file ) )
		{
			event.next( 'File does not exist' );
		}
		else
		{
			// You can use this if you want to maybe pipe the file stream to a transformation stream or in general
			// do something else than piping it to the event.response
			event.getFileStream( file ).pipe( event.response );
		}
	}
);

app.get( '/dataTwo', ( event ) =>{
		const result	= event.validationHandler.validate( event.queryString, { file: 'filled||string||min:1' } );
		const file		= ! result.hasValidationFailed() ? result.getValidationResult().file : false;

		if ( ! file || ! fs.existsSync( file ) )
		{
			event.next( 'File does not exist' );
		}
		else
		{
			event.streamFile( file );
		}
	}
);
~~~

***
***
***

#er_logger 
- Adds a logger to the eventRequest
- Attaches a dumpStack() function as well as log( data, level ) function to the process for easier access
- This can be controlled and turned off. The process.log( data, level ) calls the given logger

***
####Dependencies:

**NONE**

***
####Accepted Options:

**logger: Logger**
- Instance of Logger, if incorrect object provided, defaults to the default logger from the Loggur

**attachToProcess: Boolean**
- Boolean whether the plugin should attach dumpStack and log to the process

***
####Events:

**NONE**

***
####Exported Functions:

**NONE**

***
####Attached Functionality:

**process.dumpStack(): Promise**
- Logs the current stack

**process.log( data, level ): Promise**
- You can use the attached logger anywhere

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
const PluginManager	= app.getPluginManager();
const loggerPlugin	= PluginManager.getPlugin( 'er_logger' );
app.apply( loggerPlugin );

//OR
app.apply( 'er_logger' );

//OR
app.apply( app.er_logger, { logger: SomeCustomLogger, attachToProcess: false } );
~~~

***
***
***

#er_body_parser_json, er_body_parser_form, er_body_parser_multipart 
- Adds a JsonBodyParser, FormBodyParser or MultipartBodyParser bodyParsers respectively that can be set up
- These plugins are basically one and the same and even tho many may be added they will use a single body parser handler.
- There will not be multiple middleware that will be attached
- Parsers are fired according to the content-type header
- json parser supports: application/json
- form body parser supports: application/x-www-form-urlencoded
- multipart body parser supports: multipart/form-data

***
####Dependencies:

**NONE**

***
####Accepted Options:

***
#####MultipartFormParser:

**maxPayload: Number**
- Maximum payload in bytes to parse if set to 0 means infinite 
- Defaults to 0

**tempDir: String** 
- The directory where to keep the uploaded files before moving 
- Defaults to the tmp dir of the os
        

***
#####JsonBodyParser:
**maxPayloadLength: Number** 
- The max size of the body to be parsed 
- Defaults to 10485760/ 10MB

**strict: Boolean**
- Whether the received payload must match the content-length 
- Defaults to false

***
#####FormBodyParser:
**maxPayloadLength: Number**
- The max size of the body to be parsed 
- Defaults to 10485760

**strict: Boolean**
- Whether the received payload must match the content-length 
- Defaults to false

**cleanUpItemsTimeoutMS: Number**
- The time in milliseconds after which files will be attempted to be deleted on eventRequest finish
- Defaults to 100

***
####Events:

**NONE**

***
####Exported Functions:

**NONE**

***
####Attached Functionality:

**event.body: Object**
- Will hold different data according to which parser was fired
- Json and Form Body parsers will have a JS object set as the body
- The multipart body parsers may have **$files** key set as well as whatever data was sent in a JS object format

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
// Add Body Parsers
server.apply( app.er_body_parser_json );
server.apply( app.er_body_parser_form );
server.apply( app.er_body_parser_multipart );

// Add body parsers with custom options
server.apply( app.er_body_parser_json, { maxPayloadLength: 104857600, strict: false } );
server.apply( app.er_body_parser_form, { maxPayloadLength: 10485760, strict: false } );
server.apply( app.er_body_parser_multipart, { cleanUpItemsTimeoutMS: 100, maxPayload: 0, tempDir: path.join( PROJECT_ROOT, '/Uploads' ) } );
~~~

***
***
***

#er_response_cache 
Adds a response caching mechanism.

***
####Dependencies:

**er_cache_server**

***
####Accepted Options:

**NONE**

***
####Events:

**NONE**

***
####Exported Functions:

**NONE**

***
####Attached Functionality:

**cache.request: Middleware**
- Can be added to any request as a global middleware and that request will be cached if possible

**event.cacheCurrentRequest(): Promise**
- Caches the current request.
- Will not cache the response if the response was not a String

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
const PluginManager		= app.getPluginManager();
const cacheServer		= PluginManager.getPlugin( app.er_cache_server );

app.apply( cacheServer );
app.apply( PluginManager.getPlugin( app.er_response_cache ) );

// call event.cacheCurrentRequest() where you want to cache.
app.add({
	route	: '/',
	method	: 'GET',
	handler	: ( event )=>{
		event.cacheCurrentRequest();
	}
});

// OR  You can create your own middleware that will be added to all requests
// you want to cache, no need to do it separately
app.add( async ( event )=>{
	const pathsToCache = ['/', '/sth', 'test'];
	if ( pathsToCache.indexOf( event.path ) !== -1 )
    {
        await event.cacheCurrentRequest().catch( event.next );
    }
	
	// Or use the router to match RegExp
});

// When setting a request to be cached, ttl and useIp may be passed that will overwrite the default options
app.add( async ( event )=>{
    //**useIp** -> whether the user Ip should be included when caching. This allows PER USER cache. -> Defaults to false
    //**ttl** -> time to live for the record. Defaults to 60 * 5000 ms

    await event.cacheCurrentRequest( { ttl: 20 * 1000, useIp: true } ).catch( event.next );
});

// You can add it via a middleware to a specific route
app.get( '/', ( event )=> 
	{
		event.send( 'Hello World!' );
	}, 
	'cache.request'
);
~~~

***
***
***

#er_env 
- Adds environment variables from a .env file to the process.env Object. In case the .env file changes
- This plugin will automatically update the process.env and will delete the old environment variables.

***
####Dependencies:

**NONE**

***
####Accepted Options:

**fileLocation: String**
- The absolute path to the .env file you want to use
- Defaults to PROJECT_ROOT

***
####Events:

**NONE**

***
####Exported Functions:

**NONE**

***
####Attached Functionality:

**NONE**

***
####Exported Plugin Functions:

**NONE**

***
####Example:

~~~javascript
const app  = Server();
app.apply( 'er_env' );
app.add(( event )=>{
	console.log( process.env );

	event.send( 'Done' );
});
app.listen( 80 );
~~~

***
***
***

# er_rate_limits
- Adds a Rate limits plugin to the server. 
- The rate limits plugin can monitor incoming requests and stop/delay/allow them if they are too many
- The rate limits plugin will create a new rate_limits.json file in the root project folder IF one does not exist. 
- If one exists, then the existing one's configuration will be taken. 
- If you provide the same dataStore to two servers they should work without an issue

***
####Dependencies:

**er_cache_server**

***
####Accepted Options:

**fileLocation**
- The absolute path to the rate limits json file.
- Defaults to ROOT DIR / rate_limits.json

**dataStore**
- The dataStore to use for the buckets
- Defaults to the LeakyBucket default DataStore

***
####Events:

**rateLimited( String policy, Object rule )**
- The policy will be which policy applied the rate limiting 
- There may be more than one rateLimited event emitted
- Returns all the rule settings that rate limited the request
- This is emitted before any actions are taken

***
####Exported Functions:

**NONE**

***
####Attached Functionality:

**event.rateLimited: Boolean**
- Flag depicting whether the request was rate limited or not

**eventRequest.rules: Array**
- Will hold all the rules that the plugin has along with the buckets

***
####Exported Plugin Functions:

**NONE**

***
####Notes:
If you want to create custom rate limiting you can get er_rate_limits plugin and use getNewBucketFromOptions to get a new bucket, given options for it
options['maxAmount']
options['refillTime']
options['refillAmount']

Rate limit can be applied to different routes and different HTTP methods
Rate limit rule options:

**path: String**
- the url path to rate limit ( blank for ALL )

**methods: Array**
- the methods to rate limit ( blank for ALL )

**maxAmount: Number**
- The maximum amount of tokens to hold

**refillTime: Number** 
- the time taken to refill the refillAmount of tokens

**refillAmount: Number** 
- the amount of tokens to refill when refilling happens

**policy: String** 
- The type of rate limiting to be applied

**delayTime: Number** 
- must be given if policy is connection_delay. After what time in seconds should we retry

**delayRetries: Number**
- must be given if policy is connection_delay. How many retries to attempt

**stopPropagation: Boolean** 
- Whether to stop if the rate limiting rule matches and ignore other rules

**ipLimit: Boolean**
- whether the rate limiting should be done per ip

*** 
####POLICIES:

**PERMISSIVE_POLICY**	= 'permissive';

This policy will let the client connect freely but a flag will be set that it was rate limited

**CONNECTION_DELAY_POLICY**	= 'connection_delay';

This policy will rate limit normally the request and will hold the connection until a token is freed
If this is the policy specified then **delayTime** and **delayRetries** must be given. This will be the time after
a check should be made if there is a free token.
The first connection delay policy hit in the case of many will be used to determine the delay time but
all buckets affected by such a connection delay will be affected


**STRICT_POLICY**	= 'strict';

This policy will instantly reject if there are not enough tokens and return an empty response with a 429 header.
This will also include a Retry-After header. If this policy is triggered, stopPropagation will be ignored and
the request will be immediately canceled

***
####Example:
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
const app = Server();
app.apply( app.er_rate_limits )

// If you implement a custom distributed DataServer you can sync between servers
// Two servers
const dataStore	= new DataServer( { persist: false, ttl: 90000 } );

const appOne	= new Server();
const appTwo	= new Server();

appOne.apply( new RateLimitsPlugin( 'rate_limits' ), { dataStore } );
appTwo.apply( new RateLimitsPlugin( 'rate_limits' ), { dataStore } );
~~~

***
***
***

#er_security 
- Adds common security http headers
- Options for all the headers can be passed directly in the options and later changed as all components used by the security plugin implement a builder pattern

***
####Dependencies:

**NONE**

***
####Accepted Options:

**build: Boolean**
- Whether the headers should be build and set immediately ( taking the default settings )
- Defaults to true

**csp: Object**
- The Content Security Policy options
- This object will be passed to the CSP component
- For the object supported parameters, look further down
- Defaults to an empty object

**hsts: Object**
- The HTTP Strict Transport Security options
- This object will be passed to the HSTS component
- For the object supported parameters, look further down
- Defaults to an empty object

**ect: Object**
- The Expects CT options
- This object will be passed to the Expects-CT component
- For the object supported parameters, look further down
- Defaults to an empty object

**cto: Object**
- The Content Type Options options
- This object will be passed to the Content Type Options component
- For the object supported parameters, look further down
- Defaults to an empty object

***
####Events:

**NONE**

***
####Exported Functions:

**event.$security.build(): void**
- This function accepts no arguments. 
- It is used to set all the security headers
- This function is called if the build flag is set

***
####Attached Functionality:

**event.$security: Object**
- Holds the build function that builds and sets the security headers
- Holds all the security modules
- These modules can be accessed and used anywhere

**event.$security.csp: ContentSecurityPolicy**
- Class that implements a builder design pattern
- Look down for more info

**event.$security.cto: ContentTypeOptions**
- Class that implements a builder design pattern
- Look down for more info

**event.$security.hsts: HttpStrictTransportSecurity**
- Class that implements a builder design pattern
- Look down for more info

**event.$security.ect: ExpectCT**
- Class that implements a builder design pattern
- Look down for more info

***
####Exported Plugin Functions:

**NONE**

***
####Objects:

#####HTTP Strict Transport Security
- Used to build a Strict-Transport-Security header
- It can either be enabled or not
- The HTTP Strict-Transport-Security response header (often abbreviated as HSTS) lets a web site tell browsers that it should only be accessed using HTTPS, instead of using HTTP.
- More info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security

***
- Accepted options:

**enabled: Boolean**
- Whether the plugin should be enabled or not
- Defaults to true

**maxAge: Number**
- The time, in seconds, that the browser should remember that a site is only to be accessed using HTTPS
- Defaults to 31536000

**includeSubDomains: Boolean**
- Optional
- If this optional parameter is specified, this rule applies to all of the site's subdomains as well.
- Defaults to false

**preload: Boolean**
- Optional
- See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#Preloading_Strict_Transport_Security
- Defaults to false

***
- Functions:

**getHeader(): String**
- Returns the header as it should be set.

**build(): String**
- Builds the header string from all the directives called before hand

**setMaxAge( Number maxAge ): void**
- Sets the max age
- The value is in seconds
- If it is invalid, default will be left

**setEnabled( Boolean enabled = true ): void**
- Enables the plugin  
- You can pass false and the plugin will be disabled

**preload( Boolean preload = true ): void**
- Sets preload state
- If it is invalid, default will be left

**includeSubDomains( Boolean include = true ): void**
- Sets includeSubDomains state
- If it is invalid, default will be left


***
***
***

#####Content Type Options
- Used to build a X-Content-Type-Options header
- It can either be enabled or not
- The value of the header is nosniff always
- The X-Content-Type-Options response HTTP header is a marker used by the server to indicate that the MIME types advertised in the Content-Type headers should not be changed and be followed. This allows to opt-out of MIME type sniffing, or, in other words, it is a way to say that the webmasters knew what they were doing.
- More info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options

***
- Accepted options:

**enabled: Boolean**
- Whether the plugin should be enabled or not
- Defaults to true

***
- Functions:

**getHeader(): String**
- Returns the header as it should be set.

**build(): String**
- Builds the header string from all the directives called before hand


***
***
***

#####Expect-CT
- Used to build a Expect-CT header
- It can either be enabled or not
- The Expect-CT header allows sites to opt in to reporting and/or enforcement of Certificate Transparency requirements, which prevents the use of misissued certificates for that site from going unnoticed.
- More info: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT

***
- Accepted options:

**enabled: Boolean**
- Whether the plugin should be enabled or not
- Defaults to true

**maxAge: Number**
- Specifies the number of seconds after reception of the Expect-CT header field during which the user agent should regard the host from whom the message was received as a known Expect-CT host.
- Defaults to 86400

**enforce: Boolean**
- Optional
- Signals to the user agent that compliance with the Certificate Transparency policy should be enforced (rather than only reporting compliance) and that the user agent should refuse future connections that violate its Certificate Transparency policy.
- Defaults to true

**reportUri: String**
- Optional
- Specifies the URI to which the user agent should report Expect-CT failures.
- Defaults to ''

***
- Functions:

**setEnabled( Boolean enabled = true ): void**
- Enables the plugin  
- You can pass false and the plugin will be disabled

**enforce( Boolean enforce = true ): void**
- Sets the enforcement state
- If it is invalid, default will be left

**setReportUri( String reportUri ): void**
- Sets the report uri
- If it is invalid, default will be left

**setMaxAge( Number maxAge ): void**
- Sets the max age
- The value is in seconds
- If it is invalid, default will be left

**getHeader(): String**
- Returns the header as it should be set.

**build(): String**
- Builds the header string from all the directives called before hand


***
***
***

#####Content Security Policy
- Used to build a CSP header
- Many the directives may have many arguments, when the header is build only one directive will be set.

***
- Accepted options:

**enabled: Boolean**
- Whether the plugin should be enabled or not
- Defaults to true

**directives: Object**
- Holds all the directives for the that should be added
- Supports all directives from: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
- The directives should be added exactly as they are specified in the documentation (script-src, style-src, frame-ancestores, etc)
- For directives that don't have a value like lets say 'sandbox' they should be passed with an empty array: `sandbox: []`
- Single quotes will be added to the directives if needed, so it's safe to pass `self`, `unsafe-eval`, etc without single quotes
- Defaults to an empty object

**xss: Boolean**
- This flag will enable some directives used to battle XSS attacks
- This adds src for every directive
- This adds upgradeInsecureRequests directive as well
- Defaults to true

**self: Boolean**
- This flag will add origin self to the default-src
- Defaults to false

**sandbox: Boolean**
- This flag will enabled sandbox mode 
- Defaults to false

**reportUri: String**
- If this flag is given, then the plugin will be set to reporting only mode
- Defaults to null

**useReportTo: Boolean**
- This flag must be used with **reportUri** otherwise it won't work.
- If this flag is set then the new report-to will be used
- Defaults to false

***
- Functions:

**xss(): void**
- Enables xss protection
- Same as setting the xss flag in the options

**allowPluginType( String mimeType ): void**
- Adds a 'plugin-types' directive with the given mimeType
- The mimeType will be checked against /^[-\w.]+\/[-\w.]+$/

**setEnabled( Boolean enabled = true ): void**
- Enables the plugin  
- You can pass false and the plugin will be disabled

**getHeader(): String**
- Returns the header as it should be set.
- The header can be influenced if reporting is enabled

**setReportOnly( String uri ): void**
- If uri is not provided then this will do nothing
- Sets the state to report only, which changes the header to be CSP report only
- Adds a directive 'report-uri' with the given uri

**setReportOnlyWithReportTo( String uri ): void**
- If uri is not provided then this will do nothing
- Sets the state to report only, which changes the header to be CSP report only
- Adds a directive 'report-to' with the given uri
- report-to is not supported by some browsers, so you should probably call setReportOnly with a uri as well

**enableSandbox(): void**
- Enables sandbox mode: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox
- Adds a directive 'sandbox' to the csp

**allowSandboxValue( String value ): void**
- Enables sandbox mode: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox
- Adds a directive 'sandbox' to the csp with a given value 

**upgradeInsecureRequests(): void**
- Adds a directive 'upgrade-insecure-requests'
- This will upgrade all http links in your site to https automatically

**addBaseUri( String uri ): void**
- Adds a 'base-uri' directive with the given uri
- This will add single quotes if needed

**addFrameAncestors( String uri ): void**
- Adds a 'frame-ancestors' directive with the given uri
- This will add single quotes if needed

**addScriptSrc( String uri ): void**
- Adds a 'script-src' directive with the given uri
- This will add single quotes if needed

**addImgSrc( String uri ): void**
- Adds a 'img-src' directive with the given uri
- This will add single quotes if needed

**addChildSrc( String uri ): void**
- Adds a 'child-src' directive with the given uri
- This will add single quotes if needed

**addConnectSrc( String uri ): void**
- Adds a 'connect-src' directive with the given uri
- This will add single quotes if needed

**addConnectSrc( String uri ): void**
- Adds a 'connect-src' directive with the given uri
- This will add single quotes if needed

**addDefaultSrc( String uri ): void**
- Adds a 'default-src' directive with the given uri
- This will act as a fallback to ANY src directive
- This will add single quotes if needed

**enableSelf(): void**
- Adds a 'default-src' directive with the 'self'

**addFontSrc( String uri ): void**
- Adds a 'font-src' directive with the given uri
- This will add single quotes if needed

**addFrameSrc( String uri ): void**
- Adds a 'frame-src' directive with the given uri
- This will add single quotes if needed

**addFrameSrc( String uri ): void**
- Adds a 'frame-src' directive with the given uri
- This will add single quotes if needed

**addManifestSrc( String uri ): void**
- Adds a 'manifest-src' directive with the given uri
- This will add single quotes if needed

**addMediaSrc( String uri ): void**
- Adds a 'media-src' directive with the given uri
- This will add single quotes if needed

**addObjectSrc( String uri ): void**
- Adds a 'object-src' directive with the given uri
- This will add single quotes if needed

**addStyleSrc( String uri ): void**
- Adds a 'style-src' directive with the given uri
- This will add single quotes if needed

**build(): String**
- Builds the header string from all the directives called before hand
- You can modify directives after calling build and then call build again to get a new result


***
####Example:

- Apply the plugin with defaults
~~~javascript
// It's a good idea to do this first before attaching any other plugins or adding routes
app.apply( app.er_security );
~~~

- Apply the plugin and use the builder methods
~~~javascript
app.apply( app.er_security );

app.add(( event )=>{
    event.$security.csp.enableSandbox();
    event.$security.hsts.setEnabled( false );
    event.$security.cto.setEnabled( false );
    event.$security.ect.setMaxAge( 300 );
    event.$security.ect.setReportUri( '/report/uri' );
    
    event.$security.build();

    event.next();
});
~~~

- Apply the plugin with custom directives
~~~javascript
app.apply( app.er_security, {
	csp	: {
		directives	: {
			'font-src'	: ['https://fonts.gstatic.com'],
			'script-src': ['https://example.com'],
			'style-src': ['https://example.com', 'unsafe-eval'],
		},
		xss: true
	},
    ect : {
        maxAge: '300'
    },
    hsts    : {
		maxAge: '300',
        preload: false
    },
    cto : {
        enabled: false
    },
	build: true
});
~~~

- Apply the plugin with a lot of different commands later, as well as rebuilding
~~~javascript
		app.apply( app.er_security, { csp : { xss: false } } );

		app.add(( event )=>{

			// self is repeated twice but will be shown only once and with single quotes
			event.$security.csp.addFontSrc( 'self' );
			event.$security.csp.addFontSrc( "'self'" );
			event.$security.csp.addFontSrc( 'test' );
			event.$security.csp.upgradeInsecureRequests();
			event.$security.csp.enableSelf();
			event.$security.csp.enableSandbox();

			event.$security.ect.setEnabled( false );
			event.$security.ect.setMaxAge( 30000 );

			event.$security.hsts.setMaxAge( 300 );
			// null and 'string' are invalid for max age so 300 will be left
			event.$security.hsts.setMaxAge( null );
			event.$security.hsts.setMaxAge( 'string' );
			event.$security.hsts.preload();
			event.$security.hsts.includeSubDomains( false );

			event.$security.build();

			// This will actually add a new script-src to the csp and will disable the cto component
			event.$security.csp.addScriptSrc( 'test' );
			event.$security.cto.setEnabled( false );

			// This will overwrite the previous build and set the new modified headers
			event.$security.build();

			event.next();
		});
~~~

***
***
***