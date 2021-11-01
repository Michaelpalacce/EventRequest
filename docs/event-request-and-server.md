
# [EventRequest](#event-request)
The event request is an object that is created by the server and passed through every single middleware.

***
#### Properties of eventRequest:

**query: Object**
- The query parameters
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

**validation: ValidationHandler**
- An object used to do input validation
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

**disableXPoweredBy: Boolean**
- Flag telling the framework if it should sent the X-Powered-By header.
- Disabling it will
- Defaults to false

***
#### Functions exported by the event request:

**setCookie( String name, String value, Object options = {} ): Boolean**
- Sets a new cookie with the given name and value
- Options will all be applied directly as are given.
- The options are case sensitive
- Available options: Path, Domain, Max-Age, Expires, HttpOnly
- Expires and Max-Age will be converted to date, so a timestamp in seconds must be passed
- If you wish to expire a cookie set Expires / Max-Age to a negative number
- { Path: 'test', expires: 100 } -> this will be set as 'cookieName=cookieValue; Path:test; expires:100'

**setStatusCode( Number code ): EventRequest**
- Sets the status code of the response
- If something other than a string is given, the status code will be assumed 500

**_cleanUp(): void**
- Cleans up the event request.
- Usually called at the end of the request.
- Emits a cleanUp event and a finished event.
- This also removes all other event listeners and sets all the properties to undefined

**send( mixed response = '', Number statusCode = 200 ): Promise**
- Sends the response to the user with the specified statusCode
- The response formatting is done by calling `event.formatResponse`.
- setResponseHeader will be called with X-Powered-By: event_request. This can be disabled by doing: `eventRequest.disableXPoweredBy = true;`
- Emits a `send` event just before calling this.end()
- The send function is entirely synchronous until the response has to be sent ( when calling this.end() ). The this.end() promise is returned. This is done for consistency with sendError
- If the method was HEAD then no response will be sent ( response data will be overwritten by an empty buffer )
- calls this.end() with the payload

**async end( ...args ): void**
- This will call response.end() with the given args

**formatResponse( mixed payload ): String|Buffer**
- If the response is a buffer it will be returned directly without any modifications to it, otherwise if the response is not a String, it will be JSON.stringified. JSON.stringify may throw an error, that will not be caught.

**setResponseHeader( String key, mixed value ): EventRequest**
- Sets a new header to the response.
- If the response is finished then nothing will happen

**removeResponseHeader( String key ): EventRequest**
- Removes an existing header from to the response.
- If the response is finished then nothing will happen

**redirect( String redirectUrl, Number statusCode = 302 ): void**
- Redirect to the given url with the specified status code.
- Status code defaults to 302.
- Emits a 'redirect' event.
- If the response is finished then an error will be set to the next middleware

**getRequestHeader( String key, mixed defaultValue = null ): mixed**
- Retrieves a header ( if exists ) from the request.
- If it doesn't exist the defaultValue will be taken

**hasRequestHeader( String key ): Boolean**
- Checks if a header exists in the request

**isFinished(): Boolean**
- Checks if the response is finished
- A response is finished if eventRequest.finished === true || eventRequest.response.writableEnded || eventRequest.response.finished

**getErrorHandler(): ErrorHandler**
- Will return the instance of errorHandler attached to the EventRequest
- If one does not exist, it will be created.

**next( mixed err = undefined, Number code = undefined ): void**
- Calls the next middleware in the execution block.
- If there is nothing else to send and the response has not been sent YET, then send a server error with a status of 404
- If the event is stopped and the response has not been set then send a server error with a status of 500
- If err !== undefined send an error

**async sendError( mixed error = '', Number code = 500, emit = true ): Promise: void**
- Like send but used to send errors.
- Code will be the status code sent
- Emit is a flag whether the error should be emitted on 'on_error'
- It will call the errorHandler directly with all the arguments specified ( in case of a custom error handler, you can send extra parameters with the first one being the EventRequest )
- By default the ErrorHandler.handleError is async so this function is also async, unless ErrorHandler.handleError is overwritten
- NOTE: Check the Error Handling Section for more info

**validate( ...args ): ValidationResult**
- Shorthand for event.validation.validate
- This function will pass any arguments passed to the event.validation.validate function

***
#### Events emitted by the EventRequest

**cleanUp()**
- Emitted when the event request is about to begin the cleanUp phase.
- At this point the data set in the EventRequest has not been cleaned up and is about to be.
- At this point the response should be sent to the client

**finished()**
- Emitted when the event cleaning up has finished and the eventRequest is completed
- At this point the data set in the EventRequest has been cleaned up

**send( String|Buffer payload, Number code )**
- Emitted when the event.send() is called, just before the event is actually sent

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

# [Server](#server-class)
The main object of the framework.

- To retrieve the Server class do:
~~~javascript
const { App } = require( 'event_request' );
const app = App();

// You could also do
const app = require( 'request_event' )();
~~~

- To start the Server you can do:
~~~javascript
const { App, Loggur } = require( 'event_request' );
const app = App();

app.listen( '80', () => {
    Loggur.log( 'Server is running' );
});
~~~

- To clean up the server instance you can do:
~~~javascript
const { App, Loggur } = require( 'event_request' );
const app = App();

const httpServer = app.listen( '80', () => {
    Loggur.log( 'Server is running' );
});

httpServer.close();
App().cleanUp();
~~~
NOTES:
- This will stop the httpServer and set the internal variable of server to null
- You may need to do `app = App()` again since the app variable is still a pointer to the old server

- If you want to start the server using your own http/https server:
~~~javascript
const http = require( 'http' );
const App = require( 'event_request' );
const app = require( 'event_request' )();
const server = http.createServer( app.attach() );

// No problem adding routes like this
App().get( '/',( event ) => {
    event.send( 'ok' );
});

// OR like this
app.get( '/test',( event ) => {
    event.send( 'ok' );
});

server.listen( '80',() => {
    app.Loggur.log( 'Server is up and running on port 80' )
});
~~~

- Calling `App()` anywhere will return the same instance of the Framework.


***
#### Functions exported by the server:

**getPluginManager(): PluginManager**
- Returns an instance of the plugin manager attached to the server

**add( Object|Route|Function route ): Server**
- Calls Router.add

**apply( PluginInterface|Object|String plugin, Object options ): Server**
- Applies a new plugin with the specified options
- This method uses duck-typing to determine valid plugins. Check the PluginInterface Section to see the list of required functions
- It first calls setOptions, then checks for dependencies, then calls plugin.setServerOnRuntime then calls plugin.getPluginMiddleware

**getPlugin( String|PluginInterface pluginId ): PluginInterface**
- PluginInterface returns the desired plugin
- Throws if plugin is not attached

**hasPlugin( String|PluginInterface pluginId ): Boolean**
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
#### Events emitted by the server

**NONE**

***
***
***
