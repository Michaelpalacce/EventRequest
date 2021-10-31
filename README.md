# EventRequest
A highly customizable backend server in NodeJs. Any feedback is most welcome!

[![linux-12.x](https://github.com/Michaelpalacce/EventRequest/workflows/linux-12.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Alinux-12.x)
[![linux-14.x](https://github.com/Michaelpalacce/EventRequest/workflows/linux-14.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Alinux-14.x)
[![linux-15.x](https://github.com/Michaelpalacce/EventRequest/workflows/linux-15.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Alinux-15.x)
[![linux-16.x](https://github.com/Michaelpalacce/EventRequest/actions/workflows/linux.16x.ci.yml/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions/workflows/linux.16x.ci.yml)

[![windows-12.x](https://github.com/Michaelpalacce/EventRequest/workflows/windows-12.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Awindows-12.x)
[![windows-14.x](https://github.com/Michaelpalacce/EventRequest/workflows/windows-14.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Awindows-14.x)
[![windows-15.x](https://github.com/Michaelpalacce/EventRequest/workflows/windows-15.x/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions?query=workflow%3Awindows-15.x)
[![windows-16.x](https://github.com/Michaelpalacce/EventRequest/actions/workflows/windows.16x.ci.yml/badge.svg)](https://github.com/Michaelpalacce/EventRequest/actions/workflows/windows.16x.ci.yml)

[![codecov](https://codecov.io/gh/Michaelpalacce/EventRequest/branch/master/graph/badge.svg)](https://codecov.io/gh/Michaelpalacce/EventRequest)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/3c843dd2bc454f06b10eb60820dc6d1b)](https://www.codacy.com/manual/Michaelpalacce/EventRequest?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Michaelpalacce/EventRequest&amp;utm_campaign=Badge_Coverage)

[![CodeFactor](https://www.codefactor.io/repository/github/michaelpalacce/eventrequest/badge)](https://www.codefactor.io/repository/github/michaelpalacce/eventrequest)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3c843dd2bc454f06b10eb60820dc6d1b)](https://www.codacy.com/manual/Michaelpalacce/EventRequest?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Michaelpalacce/EventRequest&amp;utm_campaign=Badge_Grade) 
[![DeepScan grade](https://deepscan.io/api/teams/10419/projects/13164/branches/218269/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=10419&pid=13164&bid=218269)

[![GitHub last commit](https://img.shields.io/github/last-commit/Michaelpalacce/EventRequest)](https://github.com/Michaelpalacce/EventRequest)
[![GitHub last commit (branch)](https://img.shields.io/github/last-commit/MichaelPalacce/EventRequest/develop?label=last%20commit%20develop)](https://github.com/Michaelpalacce/EventRequest)
[![GitHub issues](https://img.shields.io/github/issues-raw/Michaelpalacce/EventRequest)](https://github.com/Michaelpalacce/EventRequest)
[![Maintenance](https://img.shields.io/maintenance/yes/2021)](https://github.com/Michaelpalacce/EventRequest)
[![Known Vulnerabilities](https://snyk.io/test/github/Michaelpalacce/EventRequest/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Michaelpalacce/EventRequest?targetFile=package.json)
[![npm version](https://badge.fury.io/js/event_request.svg)](https://www.npmjs.com/package/event_request)
[![npm](https://img.shields.io/npm/dt/event_request)](https://www.npmjs.com/package/event_request)
[![npm](https://img.shields.io/npm/dw/event_request)](https://www.npmjs.com/package/event_request)
[![npm bundle size](https://img.shields.io/bundlephobia/min/event_request)](https://www.npmjs.com/package/event_request)

[**CHANGELOG**](https://github.com/Michaelpalacce/EventRequest/blob/master/UPDATELOG.md) || [**BENCHMARKS**](https://github.com/Michaelpalacce/EventRequest-Benchmarks) || [**BOARD**](https://trello.com/b/LzErnccL/eventrequest) 

# [Setup](#setup)

~~~javascript
// Framework Singleton instance
const app = require( 'event_request' )();

// Add a new Route
app.get( '/', ( event ) => {
 event.send( '<h1>Hello World!</h1>' );
});

// Start Listening
app.listen( 80, () => {
 app.Loggur.log( 'Server started' );
});
~~~

The framework has a web server Singleton instance that you can fetch from anywhere using:
~~~javascript
// First way
const app = require( 'event_request' )();

// Second way ( you can use this when you want to fetch multiple things from the framework )
const { App } = require( 'event_request' );
const app = App();
~~~

# [Multiple Servers Setup:](#multiple-servers-setup)
~~~javascript
const { Server, Loggur } = require( 'event_request' );

// With this setup you'll have to work only with the variables appOne and appTwo. You cannot call App() to get any of them in different parts of the project
// This can be remedied a bit by creating routers in different controllers and then exporting them to be later on added 
const appOne = new Server();
const appTwo = new Server();

// Add a new Route
appOne.get( '/', ( event ) => {
    event.send( '<h1>Hello World!</h1>' );
});

// Add a new Route
appTwo.get( '/', ( event ) => {
    event.send( '<h1>Hello World x2!</h1>' );
});

appOne.listen( 3334, () => {
    Loggur.log( 'Server one started at port: 3334' );
});
appTwo.listen( 3335, () => {
    Loggur.log( 'Server two started at port: 3335' );
});
~~~

# [Custom http Server setup:](#custom-http-server-setup)
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

# [External Plug-ins](#external-plugins):
- https://www.npmjs.com/package/er_memcached_data_server - memcached data server [![Build Status](https://travis-ci.com/Michaelpalacce/er_memcached_data_server.svg?branch=master)](https://travis-ci.com/Michaelpalacce/er_memcached_data_server)
- https://www.npmjs.com/package/er_redis_data_server - redis data server [![Build Status](https://travis-ci.com/Michaelpalacce/er_redis_data_server.svg?branch=master)](https://travis-ci.com/Michaelpalacce/er_redis_data_server)

# [Example Projects:](#example-projects)
- https://github.com/Michaelpalacce/Server - A Web App that emulates a File System on your browser and can be used to upload/download/delete files, images, audio and etc as well as stream videos directly from your browser
- https://github.com/Michaelpalacce/ChatApp - An unfinished chat app using a combination of EventRequest and Socket.IO

# [Getting started:](#getting-started)

#### Setup
The Framework uses the "Singleton" design pattern to create a web server that can be retrieved from anywhere. 
When requiring the module a callback is returned that if called will return the instance: 

~~~javascript
const app = require( 'event_request' )();
~~~

#### Parts of the framework:
Middlewares are callbacks attached to specific routes. They are called in order of addition.
Global middlewares are the same as normal middlewares but they are defined differently than the normal middlewares and are attached to them. They are called before the middleware they are attached to.

Dynamic Middlewares are added together with the Global Middlewares but they are functions ( or an array of functions ). They can be
used to attach dynamic functionality to routes

EventRequest is an object passed to each middleware. It holds all data about the request and has a lot of helpful functionality used for sending responses.

The framework has a set of components. These components are individual and can be used outside of the framework (Supposedly).

The framework also has a set of plugins that are pre included. Each Plugin modifies the Server / Event Request a bit and "plugs in" new functionality.

***
***
***

# [Components:](#components)
- Components are parts of the server that can be used standalone or extended and replaced ( mostly )
- Any component can be retrieved from : event_request/server/components
- Extendable components are :
   - body_parsers => require( 'event_request/server/components/body_parsers/body_parser' )
   - caching => require( 'event_request/server/components/caching/data_server' )
   - error => require( 'event_request/server/components/error/error_handler' )
   - file_streams => require( 'event_request/server/components/file_streams/file_stream' )
   - rate_limiter => require( 'event_request/server/components/rate_limiter/bucket' )
   - mime_type => require( 'event_request/server/components/mime_type/mime_type' )

***
***
***

# [MimeType](#mime-type)
- Component used to fetch the mime type of files

#### Methods: 

**findMimeType( extension: String, getFirst: Boolean = true ):String|Array**
- This will get the mime type of the given extension
- If nothing is found, return */*
- If getFirst is true, will return the (usually more common and only) first mime-type

**findExtension( mimeType: String ): null|String**
- This will get the extension given a mime type
- If nothing is found, return null

***
***
***

# [Router|Routing](#router-and-routing)
- The router is used to route request to the appropriate middleware

#### Router Caching:
- The router has an internal middleware chain cache ( in case of repeating requests the middlewares that have to be executed will be cached. This is done to speed up the matching ). 
- The cache also saves any params (router wildcards and RegExp matches ) and sets them back in the next request if the cache is hit.
- The keys to be saved can be configured
- The caching can be turned on or off
- The keys will be deleted if they have not been hit for more than one hour
- The router will attempt to clear the cache of stale entries on every request but it will get triggered at most every minute
- The TTL of cached entries can be changed by: `app.router.cache.ttl = 60 * 60 * 1000;`. The value is in milliseconds
- The cacheDebouncing can be changed by: `app.router.cache.cacheClearDebounce = 60 * 1000;`. The value is in milliseconds

***
#### Functions exported by the Router:

**static matchRoute( String requestedRoute, String|RegExp route, Object matchedParams ={} ): Boolean** 
- Match the given route and returns any route parameters passed in the matchedParams argument. 
- Returns bool if there was a successful match
- The matched parameters will look like this: { value: 'key' }
- If the route is a RegExp then the matched parameters will contain the result of it and look like: { match: regExpResult }

**matchRoute( String requestedRoute, String|RegExp route, Object matchedParams ={} ): Boolean** 
- Same as static

**static matchMethod( String requestedMethod, String|Array|RegExp method )** 
- Matches the requested method with the ones set in the event and returns if there was a match or no.

**matchMethod( String requestedMethod, String|Array|RegExp method )** 
- Same as static

**define( String middlewareName, Function middleware ): Router**
- Defines a global middleware
- Throws if a middleware with that name already exists

**get/post/head/put/delete...( String route, Function middleware ): void**
- Defines a get/post/head/put/delete middlewares for the given route

**enableCaching( Boolean enable = true ): void**
- Enables or disables the middleware block caching mechanism

**setKeyLimit( Number keyLimit = 5000 ): void**
- Sets the amount of keys the cache will have
- One key is a combination of the event.path and the event.method

***
#### [Adding routes](#adding-routes)

- The server has 2 ways of adding routes/middleware

    - You can use .post, .put, .get, .delete, .head, .patch, .copy methods from the server that accept Required parameters: ( String|RegExp route, Function handler, Array||String middlewares = [] )

    - **ALTERNATIVELY** You can use those methods with the following commands: ( Function handler, Array||String middlewares = [] ) which will add a middleware to every route
~~~javascript
const { App, Loggur } = require( 'event_request' );
const app = App();

app.define( 'default', ( event ) => {
    Loggur.log( 'Hit the default global middleware' );
    event.next();
});

app.define( 'defaultTwo', ( event ) => {
    Loggur.log( 'Hit the second default global middleware' );
    event.next();
});

app.get( ( event ) => {
    Loggur.log( 'Always hits if method is get' );
    event.next();
});

app.get( 'default', ( event ) => {
    Loggur.log( 'After hitting the default global middleware' );
    event.next();
});

app.get( ['default', 'defaultTwo'], ( event ) => {
    Loggur.log( 'After hitting the default global middleware with an ARRAY!' );
    event.next();
});

app.get( '/', ( event ) => {
    event.send( '<h1>Hello World!</h1>');
});

app.post( '/', ( event ) => {
    event.send( 'ok' );
});

app.delete( '/', ( event ) => {
    event.send( 'ok' );
});

app.head( '/', ( event ) => {
    event.send( 'ok' );
});

app.put( '/', ( event ) => {
    event.send( 'ok' );
});

app.get( '/users/:user:', ( event ) => {
    Loggur.log( event.params, null, true ); // Will print out whatever is passed in the url ( /users/John => 'John' )
    event.send( event.params );
});

app.get( /\/pa/, ( event ) => {
    Loggur.log( event.params, null, true );
    // Will log { match: [ '/pa', index: 0, input: '/path', groups: undefined ] } if you hit the route /path
    event.send( 'ok' );
});

app.listen( 80, () => {
    Loggur.log( 'Server Started, try going to http://localhost and then to http://localhost/path. Don\'t forget to check the console logs ' );
});
~~~

***
- When adding a Route the **server.add( Object route )** or **router.add( Object route )** can be used. 
- The following parameters can be used when using .add():

#### [Adding an object:](#adding-an-object)

**handler: Function** 
- The callback function 
- Required

**route: String|RegExp**
- The route to match 
- Optional if omitted the handler will be called on every request

**method: String|Array[String]**
- The method(s) to be matched for the route 
- Optional if omitted the handler will be called on every request as long as the route matches

**middlewares: String|Function|Array[Function]|Array[String]**
- The global middlewares if any to be called before this middleware
- Optional if omitted none will be called

- server.add accepts a object that must contain **handler** but **route**, **method** and **middlewares** are optional.
- ( { method: '', route: '', handler:() => {}, middlewares: [] } )

***
#### [Adding Routers:](#adding-routers)
- A router can be added by calling .add on another router: ( Router router )
- All the new router's routes will be added to the old one
- All the global middleware will be merged as well

~~~javascript
const App = require( 'event_request' );

const router = App().Router();
router.get( '/', ( event ) => { event.send( 'ok' ); } );

App().add( router );

// OR you can add it directly to the router
// You can merge any 2 routers
const routerTwo = App().Router();
routerTwo.get( '/test', ( event ) => { event.send( 'okx2' ); } );
App().router.add( routerTwo )

App().listen( 80 );
~~~

***
#### [Adding Routers with path:](#adding-routers-with-path)
- A router can be added by calling .add on another router with a string route: ( String route, Router router )
- All the new router's routes will be pefixed with the given route
- All the global middleware will be merged as well
- When the router being added has a regexp as a route, the regexp will NOT be modified so you have to set it beforehand
- If the previous router has routes that are empty, they will be replaced with: `/^${path}?(.+)/`

~~~javascript
const app = require( 'event_request' )();

const routerOne = app.Router();

routerOne.get( '/route', ( event ) => {
    event.send( 'ok' );
});

app.add( '/test', routerOne );

app.listen( 80, () => {
    app.Loggur.log( 'If you go to http://localhost/test there will be a 404 error, but if you go to http://localhost/test/route it will return ok' );
});
~~~

- You can do it with a post and also with a wildcard
~~~javascript
const app = require( 'event_request' )();
const users = { userOne: {} };

// You can also attach the router to a route
const userRouter = app.Router();
userRouter.get( '/list', ( event ) => {
    event.send( users );
});

// Add a new user, validate that the username parameter is a string
userRouter.post( '/add/:username:', app.er_validation.validate( { params: { username: 'string' } } ), ( event ) => {
    users[event.params.username] = {};
    event.send( event.params );
});

app.add( '/user', userRouter );

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost/user/list and after that try posting to http://localhost/user/add/John, when you fetch list again your new user should be added to the list' );
});
~~~

- You can also pass a RegExp
~~~javascript
const app = require( 'event_request' )();

// You can also attach the router to a route
const userRouter = app.Router();

// RegExp does not get modified!
userRouter.get( /\/user\/path/, ( event ) => {
    event.send( event.params );
});

app.add( '/user', userRouter );

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost/user/path and then to http://localhost/user/notPath' );
});
~~~

#### [Adding a function:](#adding-a-function)
- server.add can also accept a function that will be transformed into a route without method or route ( Function route )
~~~javascript
const App = require( 'event_request' );

const routerOne = App().Router();

routerOne.add( ( event ) => {
    event.send( 'ok' );
});

App().add( routerOne );

App().listen( 80, () => {
    App().Loggur.log( 'Try hitting http://localhost regardless of path or method ' )
});
~~~

~~~javascript
const app = require( 'event_request' )();

// Adding a route
app.add({
    route : '/',
    method : 'GET',
    handler : ( event ) => {
        event.send( '<h1>Hello World!</h1>' )
    }
});

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost' );
});
~~~

~~~javascript
const App = require( 'event_request' );
const app = App();

// You can create your own router
const router = app.Router();
router.add({
    route : '/',
    method : 'GET',
    handler : ( event) => {
        event.send( '<h1>Hello World</h1>' );
    }
});

app.add( router );

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost' )
});
~~~

~~~javascript
const app = require( 'event_request' )();

// Adding a middleware without a method or route
app.add( ( event ) => {
    console.log( 'Should be called always!' );
    event.extra    = { key: 'value' };
    event.next();
});

app.add( ( event ) => {
    event.send( `<h1>Hello World with extra: ${JSON.stringify(event.extra)} !</h1>` );
});

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost' )
});
~~~

~~~javascript
const App = require( 'event_request' );

// To attach a router to the server simply call the add function of the server.
// Just like you would do to add a normal route.
App().add( router );
~~~

~~~javascript
const app = require( 'event_request' )();

// You can also get the router attached to the Server and use that directly
const serverRouter = app.router;
serverRouter.add( { handler: ( event ) => event.send( 'ok' ) } );

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost' );
});
~~~

***
#### [Router Wildcards](#router-wildcards)
- The route url can have a part separated by ":" on both sides that will be extracted and set to event.params
~~~javascript
const { App, Loggur } = require( 'event_request' );

const app = App();

app.add({
    route : '/todos/:id:',
    method : 'GET',
    handler: ( event) => {
        Loggur.log( event.params.id );
        event.send( '<h1>Hello World</h1>' );
    }
});

// Or
app.get( '/todos/:id:', ( event) => {
    Loggur.log( event.params.id );
    event.send( '<h1>Hello World</h1>' );
});

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost' )
});
~~~

***
#### [Router Global and Dynamic middlewares:](#router-global-dynamic-middlewares)

- You can `define` middlewares in any router or the server. Middlewares will be merged if you add a router to another router.
- These global middlewares can be used to call a function before another step in the chain.You can add multiple middlewares per route.
- Search for `GlobalMiddleware` in the documentation for a list of all global middlewares
 
- Dynamic middlewares will accept the same parameters as Global Middlewares
- Search for `DynamicMiddleware` in the documentation for a list of all dynamic middlewares
 
- When adding global middlewares to routes they can either be a single string or multiple strings in an array.
- When adding Dynamic Middlewares to routes they can either be a single function or multiple functions in an array.
- You can also add a mix with both dynamic and global middlewares
- They are added before the handler in .app, .get, .post, etc, or using the key `middlewares` if using the .add method
- Due to global middlewares being before the handler if you want to add a global middleware by calling get/post/etc then the first parameter CANNOT be a string. That will be interpreted as a route

~~~javascript
const App = require( 'event_request' );
const router = App().Router();
const app = App();

router.define( 'test', ( event ) => {
    app.Loggur.log( 'Middleware One!' );
    event.next();
});

// Dynamic middleware
const setHeader = ( key, value ) => {
    return ( event ) => {
        event.setResponseHeader( key, value );
    }
}

app.define( 'test2', ( event ) => {
    app.Loggur.log( 'Middleware Two!' );
    event.next();
});

//this will work
app.get( ['test','test2'], ( event ) => {
    event.send( 'TEST' );
});

//this will NOT work !!!
app.get( 'test', ( event ) => {
    event.send( 'Error', 400 );
});

//this will work !!!
app.get( ['test'], ( event ) => {
    event.send( 'TEST' );
});

//this will work !!!
app.get( setHeader( 'keyOne', 'valueOne' ), ( event ) => {
    event.send( 'TEST' );
});

//this will work !!!
app.get( [setHeader( 'keyOne', 'valueOne' ), 'test'], ( event ) => {
    event.send( 'TEST' );
});

//this will work !!!
app.get( [setHeader( 'keyOne', 'valueOne' ), setHeader( 'keyTwo', 'valueTwo' )], ( event ) => {
    event.send( 'TEST' );
});

app.get( '/', ['test','test2'], ( event ) => {
    event.send( 'TEST' );
} );

app.add({
    route: '/test',
    method: 'GET',
    middlewares: 'test',
    handler: ( event ) => {
        app.Loggur.log( 'Test!' );
        event.send( 'Test2' );
    }
});

app.add({
    route: '/test',
    method: 'GET',
    middlewares: ['test'],
    handler: ( event ) => {
        app.Loggur.log( 'Test!' );
        event.send( 'Test2' );
    }
});

app.add({
    route: '/test',
    method: 'GET',
    middlewares: ['test', setHeader( 'value', 'key' )],
    handler: ( event ) => {
        app.Loggur.log( 'Test!' );
        event.send( 'Test2' );
    }
});

app.add( router );

app.listen( 80, () => {
    app.Loggur.log( 'Server started' );
});
~~~

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

# [Logging](#logging)

- Logging is done by using the Loggur class mainly. 
- The Loggur can create different loggers who can have different transports
- For example you can have an access logger with a file transport and another error logger with console transport,
calling Loggur.log you will call both of the loggers.
- You should configure these loggers per project.
- If you need finer control then you can always use the loggers created by the Loggur.
- The Loggur and any Logger class are hot swappable in regards to the log function.


The `Logging` Suite exported by the module contains the following:
- Loggur -> instance of Loggur used to log data and create Loggers. Generally this class can be used to log data
- Logger -> The Logger class. Every logger can be attached to the Loggur, which will call all the loggers
- Transport -> The interface used by the loggers
- Console -> Transport that logs to the console
- File -> Transport that logs to a file
- Log -> The Log object used by all the internal classes
- LOG_LEVELS -> The Default log levels
- The Loggur can be accessed directly from the server { Loggur }

## Disabling Logging:
- If you want to disable Logging done by the framework you can do:
~~~javascript
const { Loggur } = require( 'event_request' );

Loggur.disableDefault();
~~~

- Alternatively to disable logging you can add a middleware that removes all listeners:
~~~javascript
app.add( ( event ) => {
   event.removeAllListeners('error')
   event.removeAllListeners('on_error')
   event.next();
});
~~~

## Default Logger:
- The default logger is attached directly to the Loggur instance. it can be enabled or disabled by calling Loggur.enableDefault() or Loggur.disableDefault(). 
- The default Logger has a log level of `300` and logs up until level `600` which is the debug level.

## Retrieving the Loggur from the framework instance
- You can also retrieve the Loggur directly form the framework instance by doing `app().Loggur`

~~~javascript
const app = require( 'event_request' )();

app.Loggur.log( 'TEST' );
~~~

***
***
***

## [Loggur:](#loggur)
- Loggur used to create, store and use different loggers
- Every logger added to the Loggur will be called when doing Loggur.log
- Loggur.log returns a promise which will be resolved when the logging is complete

#### Functions:
**enableDefault(): void** 
- Enables the default logger

**disableDefault(): void** 
- Disables the default logger

**addLogger( String loggerId, Logger|Object logger ): void**
- This function adds a logger to the Loggur
- You can pass a Logger instance or an object of logger options 
- Passing logger options will attempt to create a new Logger

**getDefaultLogger(): void**
- Gets the default Logger

**log( Log||String||mixed log, Number level, Boolean isRaw ): Promise**
- log determines what should be logged
- The level is the log level that we should log at. This is optional. Defaults to the default logLevel of the logger
- The isRaw flag determines whether we should attempt to log the data raw. Only specific transport types support raw. Defaults to false

~~~javascript
    Loggur.log( 'Log' ); // This logs by default to an error level
    Loggur.log( 'Log', LOG_LEVELS.debug ); // LOG_LEVELS.debug === Number, this will log 'Log' with debug level
    Loggur.log( { test: 'value' }, LOG_LEVELS.debug, true ); // This will log on debug and will try to log the data raw
~~~

**setLogLevel( Number level ): void**
- Sets the Loggur default log level

**createLogger( Object options ): Logger**
- You can create a new logger by calling Loggur.createLogger({});
- The newly created logger can be attached to the Loggur instance by calling Loggur.addLogger( 'loggerId', logger );

***
- If you want to change the log level of a logger it can easily be done with .setLogLevel( logLevel )
~~~javascript
logger.setLogLevel( 600 );
~~~

***
- If you want to change the log level of all the loggers attached to Loggur it can easily be done with .setLogLevel( logLevel )
~~~javascript
Loggur.setLogLevel( 600 ); // will change the logLevel of all loggers attached
~~~

Loggers can be added to the main instance of the Loggur who later can be used by: Loggur.log, which will call all the loggers added to it
~~~javascript
const { Loggur, Console, LOG_LEVELS } = require( 'event_request' ).Logging;

const logger = Loggur.createLogger({
    transports : [
        new Console( { logLevel : LOG_LEVELS.notice } ),
    ]
});

Loggur.addLogger( 'logger_id', logger );

console.log( typeof Loggur.loggers['logger_id'] !== 'undefined' );
~~~

***
***
***

## [Logger:](#logger)
- Logger class that can be configured for specific logging purposes like access logs or error logs
- First parameter of the constructor is the options which can be used to configure the logger and the second is the logger Id which must be a string, otherwise an error `app.er.logger.invalidUniqueId` will be thrown
- Each Logger can have it's own transport layers.
- Every transport layer has his set of processors that change the data to be logged ( timestamp is beautified, colors are added, data is sanitized )
- Every transport layer has one formatter that changes the format of the data to be logged ( plain text, json )
- Every transport layer can choose if they support or do not support the log
- Every transport layer will be called when calling logger.log
- Logger.log returns a promise which will be resolved when the logging is complete

#### Accepted options
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
- JSON object with all the log severity levels and their values. All added log levels will be attached to the instance of the logger class
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

#### Functions:

**constructor( Object options = {}, String uniqueId = null )**
- Available options can be checked in the section above.
- If uniqueId is not a string or is not passed, then an error will be thrown

**log( Log||String||mixed log, Number level, Boolean isRaw ): Promise**
- log determines what should be logged
- The level is the log level that we should log at. This is optional. Defaults to the default logLevel of the logger
- The isRaw flag determines whether we should attempt to log the data raw. Only specific transport types support raw. Defaults to false

~~~javascript
    logger.log( 'Log' ); // This logs by default to an error level
    logger.log( 'Log', LOG_LEVELS.debug ); // LOG_LEVELS.debug === Number, this will log 'Log' with debug level
    logger.log( { test: 'value' }, LOG_LEVELS.debug, true ); // This will log on debug and will try to log the data raw
~~~

**error(): Promise** || **notice(): Promise ||** **warning(): Promise** || ...
- Every logger attaches all the log levels as functions that accept log and isRaw as arguments
- The level will be determined by the function being called
- All the rules that apply to log apply to these too

~~~javascript
    logger.error( 'Log' ); // This logs by default to an error level
    logger.debug( 'Log', true ); // This will log on debug and will try to log the data raw
~~~

**setLogLevel( Number level ): void**
- Sets the logger default log level
- Each logger attaches itself to the unhandledRejection and uncaughtException of the process
- It is recomended you have a single logger that handles these and the others should be set not to capture

**addTransport( Transport transport ): Boolean**
- Adds a new transport to the logger ( console/file )

**supports( Log log ): true**
- Returns true or false if the log is supported by the logger ( determined by the log level )

**getUniqueId(): String**
- Returns a unique id to be set in the log

***
***
***

## [Transports](#logging-transports)
- Transports are object whose job is to transport the data to the given medium ( console, file, other )
- They should check if the log is supported
- They have multiple processors that modify the way the data is presented
- They have one formatter that changes the format of the data to be logged: it could be a json format or plain text
- There are 2 Transports currently.
- Every Transport has all the available processors and formatters attached to it. Check the section on Processors and Formatters for more info


### [Console](#console)
- Logs data in the console
- It can log raw logs

***
#### Accepted options:

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

**processors: Array**
- Holds The processors that the log will be passed through before it is formatted and logged
- It must be an Array, otherwise the defaults are taken
- Defaults to [Console.processors.time(), Console.processors.stack(), Console.processors.color()]

**formatter: Function**
- Holds the formatter that is going to be called after the processors are done with the log context
- Must be a function, otherwise the default is taken
- Defaults to Console.formatters.plain()

### [File](#file)
- Logs data to a file
- It can't log raw logs

***
#### Accepted options:

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
- The location of the file to log to. 
- Accepts Absolute and relative paths
- If it is not provided the transport will not log

**processors: Array**
- Holds The processors that the log will be passed through before it is formatted and logged
- It must be an Array, otherwise the defaults are taken
- Defaults to [File.processors.time(), File.processors.stack()]

**formatter: Function**
- Holds the formatter that is going to be called after the processors are done with the log context
- Must be a function, otherwise the default is taken
- Defaults to Console.formatters.plain()

~~~javascript
const { Loggur, LOG_LEVELS, Console, File } = require( 'event_request' ).Logging;

// Create a custom Logger
const logger = Loggur.createLogger({
    serverName : 'Test', // The name of the logger
    logLevel : LOG_LEVELS.debug, // The logLevel for which the logger should be fired
    capture : false, // Do not capture thrown errors
    transports : [
        new Console( { logLevel : LOG_LEVELS.notice } ), // Console logger that logs everything below notice
        new File({ // File logger
            logLevel : LOG_LEVELS.notice, // Logs everything below notice
            filePath : '/logs/access.log', // Log to this place ( this is calculated from the root folder ( where index.js is )
            logLevels : { notice : LOG_LEVELS.notice } // The Log levels that this logger can only log to ( it will only log if the message to be logged is AT notice level, combining this with the er_logger plugin that logs all request paths to a notice level, you have a nice access log. Alternatively you can log to notice yourself )
        }),
        new File({
            logLevel : LOG_LEVELS.error,
            filePath : '/logs/error_log.log'
        }),
        new File({
            logLevel : LOG_LEVELS.debug,
            filePath : '/logs/debug_log.log'
        })
    ]
});

Loggur.addLogger( 'serverLogger', logger );

console.log( typeof Loggur.loggers['serverLogger'] !== 'undefined' );
~~~

***
## [Processors](#processors)
- Processors are responsible for changing the log data
- They are called in the beginning of the logging process, followed by the formatters and after that the data is shipped by the transporters
- They are attached to the Transport, Console and File classes directly: `Console.processors`, `Transport.processors`, `File.processors`

### [Available Processors](#available-processprs)

#### [Color](#color-processor)
- Processor responsible for coloring the log message 
- It can be configured to log with different colors
- Usage: `Transport.processor.color( { logColors } )`, `Console.processor.color( { logColors } )`, `File.processor.color( { logColors } )`

#### Accepted Options:

**logColors: Object**
- An object containing logLevels mapped to colors
- It is ideal if the logLevels are the same as the ones passed in the Transporter, or data may not be collored correctly
- Defaults to:
~~~
{
 [LOG_LEVELS.error] : 'red',
 [LOG_LEVELS.warning] : 'yellow',
 [LOG_LEVELS.notice] : 'green',
 [LOG_LEVELS.info] : 'blue',
 [LOG_LEVELS.verbose] : 'cyan',
 [LOG_LEVELS.debug] : 'white'
}
~~~

***
#### [New Line](#new-line-processor)
- Processor responsible for changing all the EOLs to the system EOL
- Is this needed? No. Does it hurt? No. Did I implement it and wonder why I implemented it? Yes. Does that bother me? No.
- Usage: `Transport.processor.line()`, `Console.processor.line()`, `File.processor.line()`

#### Accepted Options:

**NONE**

***
#### [Stack](#stack-processor)
- Processor that will check if the message is an instance of Error and save the stack as the message
- Usage: `Transport.processor.stack()`, `Console.processor.stack()`, `File.processor.stack()`

#### Accepted Options:

**NONE**

***
#### [Timestamp](#timestamp-processor)
- Processor that will change the timestamp of the log to a human readable string: 08/03/20, 14:37:40 (mm/dd/yy h : m : s)
- Usage: `Transport.processor.time()`, `Console.processor.time()`, `File.processor.time()`

#### Accepted Options:

**NONE**

***
## [Formatters](#formatters)
- Formatters are responsible for changing how the data is represented
- They are called after the processors have done processing the data
- They are attached to the Transport, Console and File classes directly: `Console.formatters`, `Transport.formatters`, `File.formatters`

### [Available Formatters](#available-formatters)

#### [Plain](#plain-formatter)
- Formatter that will format the data in a non standard way: `Default/Master - 08/03/20, 14:37:40 : Test message`
- Usage: `Transport.processor.plain()`, `Console.processor.plain()`, `File.processor.plain()`

#### Accepted Options:

**noRaw**
- This will signal the formatter to ignore the isRaw flag in the logs ( usefull when logging to file for example )
- Defaults to false

***
#### [Json](#json-formatter)
- Formatter that will format the data in a json format
- Usage: `Transport.processor.json()`, `Console.processor.json()`, `File.processor.json()`

#### Accepted Options:

**replacer: function**
- You can provide a custom json replacer

***
***
***
#### Examples:

~~~javascript
const { Loggur, LOG_LEVELS, Console, File } = require( 'event_request' ).Logging;

const logColors = {
    [LOG_LEVELS.error] : 'red',
    [LOG_LEVELS.warning] : 'yellow',
    [LOG_LEVELS.notice] : 'green',
    [LOG_LEVELS.info] : 'blue',
    [LOG_LEVELS.verbose] : 'cyan',
    [LOG_LEVELS.debug]  : 'white'
};

// Create a custom Logger
const logger = Loggur.createLogger({
    transports : [
        new Console({ 
            logLevel : LOG_LEVELS.notice,
            processors : [Console.processors.color( { logColors } ), File.processors.time()]
        }),
        new File({
            logLevel : LOG_LEVELS.error,
            filePath : '/logs/error_log.log',
            processors : [File.processors.color( { logColors } ), File.processors.line(), File.processors.line()],
            formatter : File.formatters.json()
        }),
    ]
});

Loggur.addLogger( 'serverLogger', logger );

console.log( Loggur.loggers['serverLogger'] );
~~~

## [Log Levels](#log-levles)
- error   : 100,
- warning : 200,
- notice  : 300,
- info    : 400,
- verbose : 500,
- debug   : 600

***
***
***

# [Validation](#validation-suite)
The validation is done by using:

~~~javascript
const app = require( 'event_request' )();

app.get( '/', ( event ) => {
    const objectToValidate = { username: 'user@test.com', password: 'pass' };

    // Validation shorthand
    // Password will not fit the range
    const resultOne    = event.validate(
        objectToValidate,
        {
            username: 'filled||string||email||max:255',
            password: 'filled||string||range:6-255'
        }
    );

    // You can also do validation like this
    // Password will fit the range
    const resultTwo    = event.validation.validate(
        objectToValidate,
        {
            username: 'filled||string||email||max:255',
            password: 'filled||string||range:1-255'
        }
    );

    event.send({
        resultOne    : {
            hasValidationFailed    : resultOne.hasValidationFailed(),
            validationResult    : resultOne.getValidationResult()
        },
        resultTwo    : {
            hasValidationFailed    : resultTwo.hasValidationFailed(),
            validationResult    : resultTwo.getValidationResult()
        }
    });
});

app.listen( 80, () => {
    app.Loggur.log( 'Try hitting http://localhost')
});
~~~

- You can also fetch the ValidationHandler and do validation using it anywhere:

~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

const result = validationHandler.validate(
    {
        key: 'value'
    },
    {
        key: 'string||range:1-10'
    }
);

console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );
~~~

- skeleton must have the keys that are to be validated that point to a string of rules separated by ||

- if the object to be validated is multi dimensional then you can specify the multi dimensional keys as well ( see example below )
- if the object to be validated contains an array of object you have to specify an array for the given key and provide only ONE Object that will be used to validate all the arrays( see example below )

- Asserting that an input is a string|numeric|boolean will do type conversion on the input to the appropriate type. You should retrieve the value FROM the validation result for correct result

***
#### Possible rules are:

**optional** 
- if set as long as the input is empty it will always be valid. if not empty other possible rules will be called

**filled** 
- checks if the input is filled

**array** 
- checks if the input is an array

**notArray** 
- checks if the input is not an array

**string** 
- checks if the input is a string.
 - Will convert a number to a string

**weakString** 
- checks if the input is a string
- will not do value conversion

**notString** 
- checks if the input is NOT a string

**range** 
- Is followed by min and max aka: range:1-2 where 1 is the minimum and 2 maximum.
- If the type is numeric then it will check if it's within the range.
- If the type is a string then the length will be checked
- If the type is an array then the array length will be checked

**min** 
- minimum input length aka: min:10
- Same rules about types apply as in **range** 

**max** 
- maximum input length aka: max:50
- Same rules about types apply as in **range** 

**email** 
- checks if the input is a valid email

**isTrue** 
- checks if the input evaluates to true
- 1 will be asserted as true, true will be asserted as true, 'true' and '1' will also be asserted as true
- The value will be converted to a boolean

**weakIsTrue** 
- checks if the input equals to true ( boolean )
- will not do value conversion

**isFalse** 
- checks if the input evaluates to false
- 0 will be asserted as false, false will be asserted as false, 'false' and '0' will also be asserted as false
- The value will be converted to a boolean

**weakIsFalse** 
- checks if the input equals to false ( boolean )
- will not do value conversion

**boolean** 
- checks if the input is a boolean
- The value will be converted to a boolean
- Applies the same rules as **isFalse** and **isTrue** 

**weakBoolean** 
- checks if the input is a boolean
- will not do value conversion

**notBoolean** 
- checks if the input is not a boolean

**numeric** 
- checks if the input is a number. 
- This will convert the input to a Number if possible

**weakNumeric** 
- checks if the input is numeric
- will not do value conversion

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

#### Note: in case of an error the exact rule/s that failed will be returned, furthermore if the rules passed were malformed a special "rules" error will be returned for the field/s

When validation is done a ValidationResult is returned. It has 2 methods:
    getValidationResult that in case of a validation error will return an object with the fields tested mapped to the errors found. 
        Otherwise it will be an object with the fields tested mapped to the values
    hasValidationFailed that returns a boolean whether there is an error

~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

const body = {
    username: 'test@example.com',
    password: 'test',
    customerNumber: 30,
    address : {
        street: 'Test str',
        number:'64',
        numberTwo: 64 // THIS WILL NOT FAIL
        // numberTwo: '64' // THIS WILL FAIL since it is weakNumeric
    }
}

const bodyWhereEverythingFails = {
    username: 123,
    password: true,
    customerNumber: 'x'.repeat( 33 ),
    address : {
        street: 123,
        number:'wrong',
        numberTwo: '64'
    },
    extra: true
}

const skeleton    = {
    username : 'filled||string||email||range:6-32',
    password : 'filled||string',
    customerNumber: 'numeric||max:32',
    address: { street: 'string', number: 'numeric', numberTwo: 'weakNumeric' },
    extra : { $rules: 'optional||string', $default: 'def' }
};

const result = validationHandler.validate( body, skeleton );

const resultWithFails = validationHandler.validate( bodyWhereEverythingFails, skeleton );

console.log( 'Validiation passes:' );
console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );
console.log( '=============================' );

console.log( 'Validation fails:' );
console.log( resultWithFails.hasValidationFailed() );
console.log( resultWithFails.getValidationResult() );

// If errors were found hasValidationFailed would return true and getValidationResult will have a map
// of which input failed for whatever reason. Otherwise getValidationResult will return an object :
// { 'username':'username', 'password': 'password', 'customerNumber': 16, address: { street: 'street', number: 64, numberTwo: 62 }, extra: 'def' }
~~~

The example will validate that the username is filled is a string and is within a range of 6-32 characters
It will also validate that the password is filled and is a string
The customerNumber will be validated to be numeric that is lower than 32
The address will be asserted to be an object and the keys in it will be validated
The extra if not passed will default to 'def'

***
#### Validation defaults

- Validation results can also have defaults set. 
- This is done by instead of passing a string of rules to the skeleton keys, an object is passed with two values: $rules and $default
- The $rules must be optional otherwise validation will fail
- In case where the parameters have NOT been passed, the default value will be used.
~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

//IF no values are provided then the defaults will be taken
const body = {};
const result = validationHandler.validate(
    body,
    {
        username : { $rules: 'optional||string', $default: 'root' },
        password : { $rules: 'optional||string', $default: 'toor' }
    }
);

console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );

//IF the values do exist then they will be validated
const bodyTwo = { username: 'u', password: 'p' };
const resultTwo = validationHandler.validate(
    bodyTwo,
    {
        username : { $rules: 'optional||string||min:5', $default: 'root' },
        password : { $rules: 'optional||string||min:5', $default: 'toor' }
    }
);

console.log( resultTwo.hasValidationFailed() );
console.log( resultTwo.getValidationResult() );
~~~


~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

const dataToValidate = {
    testOne : 123,
    testTwo : '123',
    123 : [1,2,3,4,5],
    testThree : {
        'deepOne' : 123,
        deepTwo : {
            deeperOne : 123,
            deeperTwo : '123',
            deeperFour : '4'
        },
        deepThree : [
            {
                deepThreeOne: 'stringOne',
                deepThreeTwo: '1542'
            },
            {
                deepThreeOne: 'stringOne',
                deepThreeTwo: 1542
            }
        ]
    },
    testFour: true,
    testFive: 'true',
    testSix : '1'
};

const result    = validationHandler.validate(
    dataToValidate,
    {
        testOne        : 'string||range:2-4',
        testTwo        : 'numeric||range:123-124',
        123            : 'array||range:4-6',
        testThree    : {
            deepOne    : 'numeric||range:122-124',
            deepTwo    : {
                deeperOne    : 'string||range:2-4',
                deeperTwo    : 'numeric||range:123-124',
                deeperThree    : { $rules: 'optional||min:2||max:5', $default: 4 },
                deeperFour    : { $rules: 'optional||numeric||min:2||max:5', $default: 4 }
            },

            deepThree : [
                {
                    deepThreeOne: 'string',
                    deepThreeTwo: 'numeric'
                }
            ]
        },
        testFour    : 'boolean',
        testFive    : 'boolean',
        testSix        : 'boolean',
        testSeven    : { $rules: 'optional||min:2||max:5', $default: 4 }
    }
);
console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );

// false

// {
//   '123': [ 1, 2, 3, 4, 5 ],
//   testOne: '123',
//   testTwo: 123,
//   testThree: {
//     deepOne: 123,
//     deepTwo: { deeperOne: '123', deeperTwo: 123, deeperThree: 4, deeperFour: 4 },
//     deepThree : [
//     {
//         deepThreeOne: 'stringOne',
//         deepThreeTwo: 1542
//     },
//     {
//         deepThreeOne: 'stringOne',
//         deepThreeTwo: 1542
//     }
//     ]
//   },
//   testFour: true,
//   testFive: true,
//   testSix: true,
//   testSeven: 4
// }
~~~

- Really deep validations
~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

const dataToValidate    = {
    testOne    : 123,
    testTwo    : '123',
    123            : [1,2,3,4,5],
    testThree    : {
        'deepOne'    : 123,
        deepTwo    : {
            deeperOne    : 123,
            deeperTwo    : '123',
            deeperFour    : '4'
        },
        deepThree : [
            {
                deepThreeOne: 'stringOne',
                deepThreeTwo: '1542'
            },
            {
                deepThreeOne: 'stringOne',
                deepThreeTwo: 'string'
            }
        ]
    },
    testFour    : true,
    testFive    : 'true',
    testSix        : '1',
    testNine    : {
        weakString    : 'weakString',
        weakBoolean    : true,
        weakNumeric    : 123,
        weakIsTrue    : true,
        weakIsFalse    : false,
    }
};

const result    = validationHandler.validate(
    dataToValidate,
    {
        testOne        : 'string||range:2-4',
        testTwo        : 'numeric||range:123-124',
        123            : 'array||range:4-6',
        testThree    : {
            deepOne    : 'numeric||range:122-124',
            deepTwo    : {
                deeperOne    : 'string||range:2-4',
                deeperTwo    : 'numeric||range:123-124',
                deeperThree    : { $rules: 'optional||min:2||max:5', $default: 4 },
                deeperFour    : { $rules: 'optional||numeric||min:2||max:5', $default: 4 },
                deepThree : [
                    {
                         deepThreeOne: 'string',
                         deepThreeTwo: 'numeric'
                    }
                ]
            }
        },
        testFour    : 'boolean',
        testFive    : 'boolean',
        testSix        : 'boolean',
        testSeven    : { $rules: 'optional||min:2||max:5', $default: 4 },
        testEight    : 'numeric',
        testNine    : {
            weakString    : 'weakString',
            weakBoolean    : 'weakBoolean',
            weakNumeric    : 'weakNumeric',
            weakIsTrue    : 'weakIsTrue',
            weakIsFalse    : 'weakIsFalse',
            deep    : {
                deeper    : {
                    deepest: 'string'
                }
            }
        }
    }
);
console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );

// true
//{ testThree: { deepThree: { 1:{ deepThreeTwo: [ 'numeric' ] } } },testEight: [ 'numeric' ], testNine: { deep: { deeper: deepest: ['string'] } } }
~~~

***
***
***

# [LeakyBucket](#leaky-bucket)
This class can be used to limit data in one way or another.

***
#### Accepted constructor arguments:

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
- Used to set the maxCounter using the following formula: Math.min( Math.floor( 10000 / dataStoreRefetchInterval ), 1000 )
- Defaults to 1

***
#### The class has the following functions:

**async init(): Bucket**
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

#### Example:

~~~javascript
     const LeakyBucket = require( 'event_request/server/components/rate_limiter/bucket' );
~~~

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

# [Templating Engine](#templating-engine)
- By default the er_templating_engine plugin comes with a templating engine that just fetches the file and returns is as is
- No extra configurations are needed to use that.
- There is an experimental version of another templating engine that supports variables, loops and other logic inside it
- The ExperimentalTemplatingEngine has some XSS protection as well.

#### How to apply:
~~~javascript
const app = App();
const TemplatingEngine = require( 'event_request/server/components/templating_engine/experimental_templating_engine' );
const templatingEngine = new TemplatingEngine();

app.apply( app.er_templating_engine, { templateDir: '.', render: templatingEngine.renderFile.bind( templatingEngine ) } );

app.get( '/', ( event ) => {
    const variables	= { test: 'TEST!!', hello: 'HELLO WORLD!!'};

    // You need to have a file called test.html in the main directory for this setup to work
    event.render( 'test', variables ).catch( event.next ); // If this fails, this will be automatically handled by the framework
});

app.listen( 80 );
~~~

#### Syntax

1. Raw JS syntax: You can use `<?js />` and write any piece of JS code you want. This will not be displayed by the user, but you can do variable assignment here, loops, instantiate objects, etc.
- This will display `Hello World!` 5 times
~~~html
<?js for(let i=0;i<5;i++){ />
    Hello World!
<?js } />
~~~
- Switch Statement:
~~~html
<?js switch( test ){ case '1': />
    <%test1%>
<?js break; case '2': />
    <% test %>
<?js break; } />

OR

<?js switch( test ){
        case '1': />
            <%test1%>
<?js        break;
        case '2': />
            <% test %>
<?js        break;
 } />
~~~

2. Rendering variables 
- Any variables you've passed can be rendered using: `<% variableName %>` syntax
- Note: any variables you create inside the template can also be rendered using this syntax.
- For safety reasons, variables rendered this way are subject to XSS filtering done by the engine

#### What is not supported:
- COMMENTS. HTML comments of template syntax is NOT going to work as expected!
- INCLUDES. Including other templates is currently NOT supported

#### How to use:
- After you've applied the templating engine, you can call the render function like:
~~~javascript
app.get( '/', ( event ) => {
    const variables	= { test: 'TEST!!', hello: 'HELLO WORLD!!'};

    // You need to have a file called test.html in the main directory for this setup to work
    event.render( 'test', variables ).catch( event.next ); // If this fails, this will be automatically handled by the framework
});
~~~
- The variables passed can be access from anywhere in the template using: `<% test %>` or <% hello %>

#### Using as a separate component
- You could use the Engine as a separate component by requiring it:

~~~javascript
const TemplatingEngine = require( 'event_request/server/components/templating_engine/experimental_templating_engine' );
~~~
- The engine exposes the following methods:

**async renderFile( String templateLocation, Object variables ): Promise: String**
- This will read a file and parse it.
- The templateLocation must be the absolute path to the file
- The variables is an object with keys and values. Key -> the key to access in the template, Value -> what will be rendered

**async render( String html, Object variables ): String**
- Same as renderFile but this is the already fetched template

***
***
***

# [Error Handling | ErrorHandler](#error-handling-errorHandler)
- The EventRequest has a default ErrorHandler set in it
- It is a good idea to instantiate a new ErrorHandler OUTSIDE the eventRequest for speed. You can attach a preconfigured ErrorHandler rather than configuring the one created every request.
- The Error Handler supports error namespaces. An error namespace is a string error code, that is separated by dots: `app.module.someError`. Every Dot represents a new Error namespace. They may take a second to get the hang on but are a powerful tool when you understand them better!
- Error Handling in the framework is done entirely using error codes.
- Every Error Code thrown in the app will be in the following namespace: `app.er`
- This class can be extended and custom functionality may be written
- Alternatively instead of extending you can write your own class as long as it has a handleError function.
- You can write your own ErrorHandler, but since there are errors generated by the framework, they will always look for an ErrorHandler with a handleError function and if one is not present, will create a new one. 

#### How are Errors processed
- In the framework in the case of a synchronous middleware, all errors thrown will be processed and formatted into an error with a code and a message
- By default errors will be logged to the console, and you can disable this by specifying a custom error handler or adding a general namespace to the ErrorHandler that will catch errors and you can use to process in any way you see fit ( see further down for more info )
- In the case of an errorCallback, you can always pass event.next as the argument ( it will be triggered if the first argument is !== false )
~~~javascript 
app.get( '/', ( event ) => {
    const someFunc = ( variableOne, variableTwo, errorCallback ) => {
        errorCallback( variableOne === variableTwo );
    }
    
    someFunc( 1, 1, event.next );
} );
~~~

- In the case of an async function, if you want your error to be automatically processed, you can return the promise
~~~javascript 
app.get( '/', async ( event ) =>{
    const variables	= { test: 'TEST!!', hello: 'HELLO WORLD!!'};

    return event.render( 'test', variables ); // If this fails, this will be automatically handled by the framework
});
~~~

- You could also add event.next in the .catch()
~~~javascript 
app.get( '/', async ( event ) =>{
    const variables	= { test: 'TEST!!', hello: 'HELLO WORLD!!'};

    event.render( 'test', variables ).catch( event.next ); // If this fails, this will be automatically handled by the framework
});
~~~

***
#### Accepted Options:

**NONE**

***
#### Events:

**on_error: ( mixed error )**
- This is called by the default error handler in case of an error

***
#### Functions:

**async handleError( EventRequest event, * errorToHandle = null, Number errStatusCode = null, emitError = null ): Promise: void**
- This function is **ASYNCHRONOUS**
- This function will call a callback of either the default Namespace or of a custom one, with parameters: { event, code, status, message, error, headers, emit, formatter }
- Note The callback uses destructing: `callback( { event, code, status, message, error, headers, emit, formatter } )` so if you write your own custom callback for a  namespace make sure it takes this into account. For example: `_defaultCase( { event, code, status, error, message, headers, emit, formatter } )`. You can get as many parameters as you need and ignore the rest( or not even define them )
- Check Namespaces section for more information how these parameters will be generated!

**addNamespace( errorCode, { message, callback, status, emit, headers, formatter } = {} ): void**
- Adds a new namespace, given an errorCode and an object containing one or more parameters 
- Note that the namespaceOptions use Object destructing, so if you want to call it it must be in the following format:
~~~javascript
errorHandler.addNamespace( 'app.test.namespace', { message: 'I am a message', emit: false, headers: { headerOne: 2 }, callback: () => {}, formatter: () => {} } );
~~~
- Any parameters that are not provided will be taken from the defaultNamespace ( check Namespaces section for more info )

***
#### Attached Functionality:

**event.errorHandler: ErrorHandler**
- Attached by default to the EventRequest but can be overwritten at any point


#### Errors thrown in the framework:
- They all start with `app.er`
- In general they do not have any messages attached to them with some few exceptions

**app.er.timeout.timedOut**
  - Thrown by the Timeout Plugin with a status of 408
  - { code: 'app.er.timeout.timedOut', status: 408 }

**app.er.er_etag.invalid.payload**
  - Thrown by the Etag Plugin when the payload is not a String, Buffer or fs.Stats

**app.er.staticResources.fileNotFound**
  - { code: 'app.er.staticResources.fileNotFound', message: `File not found: ${item}`, status: 404 }
  - Thrown by the Timeout Plugin with a status of 408

**app.er.bodyParser.invalidParser**
  - Thrown by the body parser handler when an invalid parser was attempted to be added

**app.er.logger.invalidUniqueId**
  - Thrown by loggers if invalid uniqueId was passed ( not string )

**app.er.bodyParser.multipart.invalidState**, **app.er.bodyParser.multipart.invalidMetadata**, **app.er.bodyParser.multipart.couldNotFlushBuffer**
  - Thrown by lhe multipart data parser if a critical error was detected when parsing the multipart body

**app.er.pluginManager.invalidPlugin**
  - Thrown by the plugin manager when an invalid plugin was attempted to be added

**app.er.pluginManager.pluginDoesNotExist**
  - Thrown by the plugin manager if a plugin that does not exist was attempted to be retrieved

**app.er.rateLimits.connection_delay.missingDelayTimeOrDelayRetries**
  - Thrown by the rate limits plugin if an invalid connection delay policy rule was added

**app.er.rateLimits.invalidOptions**
  - Thrown by the rate limits plugin if an invalid rule was added

**app.er.rateLimits.tooManyRequests**
  - Thrown by the rate limits plugin if rate limiting ocurred
  - { code: 'app.er.rateLimits.tooManyRequests', status: TOO_MANY_REQUESTS_STATUS_CODE, headers: { 'Retry-After': retryAfterTime } 

**app.er.routing.invalidMiddlewareAdded**
  - Thrown by the routing when an invalid middleware was added

**app.er.routing.cannotDefineMiddleware**
  - Thrown by the routing when an invalid global middleware was attempted to be defined

**app.er.bodyParser.form.notSupported**
  - Thrown by the form body parser when the body to be parsed is not supported

**app.er.bodyParser.multipart.wrongHeaderData**
  - Thrown by the multipart body parser when there is wrong or missing header data. Either `content-type` or `content-length`. `content-type` may not have the boundry defined

**app.er.bodyParser.multipart.maxPayloadReached**
  - Thrown by the multipart body parser when the maxPayload is not infinite ( not 0 ) and the maxPayload and `content-length` do not match

**app.er.bodyParser.json.notSupported**
  - Thrown by the json body parser when the body to be parsed is not supported

**app.er.routing.missingMiddleware**
  - Thrown by the routing when a middleware was missing when adding two routers together
  - throw { code: 'app.er.routing.missingMiddleware', message: middleware };

**app.er.server.missingPluginDependency.${pluginId}**
  - Thrown by the server when a plugin has a missing dependency. The pluginId will be attached at the end

**app.er.server.missingPlugin.${id}**
  - Thrown by the server when a plugin is missing. The pluginId will be attached at the end

**app.er.session.missingDataServer**
  - Thrown by the session when the event request is missing a dataServer

**app.er.session.missingDataServer**
  - Thrown by the session when the event request is missing a dataServer

**app.err.templatingEngine.errorRendering**
  - Thrown by when there was an error during rendering in the templating engine plugin

**app.er.logging.transport.file.fileLogPathNotProvided**
  - Thrown by the file transport if there is no filePath provided

**app.er.validation.error**
  - Thrown by the validation plugin when there is an error with validation. Could be that the EventRequest has a missing property or validation of input failed
  - { status: 400, code: 'app.er.validation.error', message: { [validationParameter]: validationResult.getValidationResult() } }
  - { status: 400, code: 'app.er.validation.error', message: `Could not validate ${toValidate} as it is not a property of the EventRequest` }

***
***
#### [Custom Error Handler:](#custom-error-handler)
- You can specify a custom error handler very easily:
~~~javascript
event.errorHandler = {
    handleError: () => {
        event.send( 'Custom Error Handling' )
    }
}
~~~~

***
***
#### [Namespaces:](#error-handling-namespaces)
- Error Namespaces are ways for you to attach common error handling to the same section of your application. If you have the following namespaces: `app.security.invalid.password`, `app.security.invalid.username`, `app.security.unauthorized`, `app.security.invalid.token` and lets say that everything besides `app.security.invalid.token` has been handled, what do we do with that one specifically? Well, if you attach a namespace that is `app.security` with a message of 'General Security Error' and a status of 401 or 403, then you don't have to worry that you have not handled this scenario.
- Adding a namespace is done by: `errorHandler.addNamespace( 'code' {...} );`

~~~javscript
const ErrorHandler    = require( 'event_request/server/components/error/error_handler' );
const handler    = new ErrorHandler();

handler.defaultNamespace.callback    = function()
{
    console.log( arguments );
}

handler.addNamespace( 'app.security', { message: 'General Security Error', status: 403 } );
handler.addNamespace( 'app.security.invalid.password', { message: 'Your password is not valid', status: 403 } );
handler.addNamespace( 'app.security.invalid.username', { message: 'Your username is not valid', status: 403 } );
handler.addNamespace( 'app.security.unauthorized', { message: 'You are not authorized for this request', status: 401 } );

// This will set the error code to `app.security.invalid.token` 
// so you know EXACTLY what the error is but the message and status will be taken from app.security namespace
handler.handleError( {}, 'app.security.invalid.token' );
~~~

- Error Namespaces allow for a LOT of customization ( and anything not customized, will be taken from the defaultNamespace ). When adding a namespace you can specify:
  - message - what message the user will see
  - status - This will be the status code that will be sent to the user
  - callback - Function that will be called with `{ event, code, status, message, error, headers, emit, formatter }`. You can use any of these parameters. You don't need to define them all if they are unused. This function can also be async.
  - emit - Flag whether an on_error event should be emitted. Note: this is actually done in the callback, so its entirely in your own control if you want to stop it
  - headers - A JS Object that will be put through a for...in loop. Every key will be set as a header and every value as the respective header value.  Note: this is actually done in the callback, so its entirely in your own control if you want to stop it
  - formatter - This function will be called by the default callback at the end, to format the way the response will be sent. This way you can customize only the response if you so wish to ( for example you want to send html in one case and json in another ). The formatter accepts all the arguments of callback without the formatter argument. This function can also be async.

This is the default Namespace callback:
~~~javascript
/**
     * @brief    Fallback namespace that will be called whenever there is no namespace for the given error code OR the namespace match does not have a callback
     *
     * @details    This callback will set any headers provided
     *             This callback will set the status code given
     *             This callback will format an appropriate message in case of an error
     *             This callback emit an error IF needed
     *
     * @param    {EventRequest} event
     * @param    {String} errorCode
     * @param    {Number} status
     * @param    {*} error
     * @param    {*} message
     * @param    {Object} headers
     * @param    {Boolean} emit
     * @param    {Function} formatter
     *
     * @private
     *
     * @return	void
     */
    async _defaultCase( { event, code, status, error, message, headers, emit, formatter } )
    {
        if ( event.isFinished() )
            return;
        
        const toEmit = { code, status, headers };
        
        if ( message !== null && message !== undefined )
            toEmit.message = message;
        
        if ( error !== null && error !== undefined )
            toEmit.error = error;
        
        if ( emit )
            event.emit( 'on_error', toEmit );
        
        for ( const key in headers )
        {
            if ( ! {}.hasOwnProperty.call( headers, key ) )
                continue;
        
            event.setResponseHeader( key, headers[key] );
        }

       const result	= formatter( { event, code, status, error, message, headers, emit } );
       
      if ( result instanceof Promise )
            event.send( await result, status );
      else
            event.send( result, status );
    }
~~~

- If you ever want to send an error you can do this by simply throwing an Error with the namespace as the only message
- If you want to include more information you can also just throw an object or a string!
- As long as they are thrown in a middleware somewhere or a promise is rejected with them, they will be picked up by the ErrorHandling and handled appropriately. Note: Promise rejections will only be picked up using the async await approach. It is recomended if you want to error handle a `.catch()` you use `.catch( event.next )`

~~~javscript
throw new Error( 'app.test.namespace' );

throw 'app.test.namespace';

throw { code: 'app.test.namespace', status: 500 };
~~~

- handleError will handle a wide variety of information.
- **You can pass any parameter that you would pass when adding a namespace to the errorToHandle and they will overwrite the namespace ones**
- **It is preffered that you pass your own object with the parameters like this: `{ code: 'app.test', status: 500, message: 'User Message', error: new Error( 'Error To Log' ), headers: { headerOne: 'value' }, emit: false };`. Note that if status code is omitted, the status code passed to handleError will be taken, if not the status code form the namespace defined by the code will be used. Same logic applies for emit. If message or headers are not passed, they will be taken from the namespace.**
- The errorToHandle can by anything from a simple string, Error, object and others.
- If the errorToHandle is a string and it matches the pattern of a namespace, then it will be treated as a namespace
- If the errorToHandle is an Error and Error.message matches the pattern of a namespace, then Error.message will be treated as a namespace
- The logic of what will be emitted and what will be sent to the user is really complex. Below there is an example. Play around, comment out some lines, write new cases to see what happens

***
#### Example:

~~~javascript
const ErrorHandler = require( 'event_request/server/components/error/error_handler' );
const app = require( 'event_request' )();

const errorHandler  = new ErrorHandler();

errorHandler.addNamespace( 'test.formatter.formatted.message', { formatter: ( { code } ) => { return code.toUpperCase() } } );
errorHandler.addNamespace( 'test.formatter.formatted.async.message', { formatter: async ( { code } ) => { return code.toUpperCase() } } );
errorHandler.addNamespace( 'test.exists.with.just.message', { message: 'Default Message' } );
errorHandler.addNamespace( 'test.exists.with.message.and.status', { status: 532, message: 'Message with Status' } );
errorHandler.addNamespace( 'test.exists.with.status', { status: 462 } );
errorHandler.addNamespace( 'test.deep', { status: 532, message: 'DEEP message', emit: false, headers: { headerOne: 1, headerTwo: 2 } } );

errorHandler.addNamespace(
	'test.callback',
	{
		callback: ( { event, code, status, message, error, headers, emit } ) => {
			if ( emit )
				event.emit( 'on_error', { event, code, status, message, error, headers, emit } );

			event.send( message, status );
		},
		status: 532,
		message: 'CALLBACK MESSAGE',
		emit: false,
		headers: { headerOne: 1, headerTwo: 2 }
	}
);

app.add( ( event ) => {
	event.errorHandler    = errorHandler;
	event.next();
});

app.add(( event ) => {
	event.on( 'on_error', function()
		{
			console.log( arguments );
		}
	);

	throw new Error( 'test.formatter.formatted.message' ); //This message will be formatted

	event.sendError( 'test.formatter.formatted.async.message' ); //This message will be formatted, but more importantly IF there is something after it, it may result in an error. This will be done ASYNCHRONOUSLY

	throw new Error( 'Some random error!' ); // No problem if the error is not a namespace! It will go to the default namespace
	throw 'Some Error!'; // No problem if the error is not a namespace! It will go to the default namespace
	throw { code: 'test.exists.with.just.message', status: 200, headers: { headerOne: 'value' }, emit: true }; // If you need that fine control!

	event.sendError( 'test.callback', 500 ); // This will call the error Handler 'test.callback'
	event.sendError( 'test.exists.with.just.message', 500 ); // This will call the error Handler 'test.exists.with.just.message'
	event.sendError( 'test.exists.with.message.and.status' ); // This will call the error Handler 'test.exists.with.message.and.status'
	event.sendError( 'test.exists.with.status' ); // This will call the error Handler 'test.exists.with.status'
	event.sendError( 'test.deep.we.go.on.deeper' ); // This will call the error Handler 'test.deep'

	event.next( 'test.callback', 500 ); // This will call the error Handler 'test.callback'
	event.next( 'test.exists.with.just.message', 500 ); // This will call the error Handler 'test.exists.with.just.message'
	event.next( 'test.exists.with.message.and.status' ); // This will call the error Handler 'test.exists.with.message.and.status'
	event.next( 'test.exists.with.status' ); // This will call the error Handler 'test.exists.with.status'
	event.next( 'test.deep.we.go.on.deeper' ); // This will call the error Handler 'test.deep'

	event.next( new Error( 'test.callback' ), 500 ); // This will call the error Handler 'test.callback'
	event.next( new Error( 'test.exists.with.just.message' ), 500 ); // This will call the error Handler 'test.exists.with.just.message'
	event.next( new Error( 'test.exists.with.message.and.status' ) ); // This will call the error Handler 'test.exists.with.message.and.status'
	event.next( new Error( 'test.exists.with.status' ) ); // This will call the error Handler 'test.exists.with.status'
	event.next( new Error( 'test.deep.we.go.on.deeper' ) ); // This will call the error Handler 'test.deep'

	event.next( { code: 'test.callback' }, 500 ); // This will call the error Handler 'test.callback'
	event.next( { code: 'test.exists.with.just.message' }, 500 ); // This will call the error Handler 'test.exists.with.just.message'
	event.next( { code: 'test.exists.with.message.and.status', status: 502 }, 503 ); // This will call the error Handler 'test.exists.with.message.and.status'
	event.next( { code: 'test.exists.with.message.and.status', error: new Error( 'test.error' ) }, 503 ); // This will call the error Handler 'test.exists.with.message.and.status'
	event.next( { code: 'test.exists.with.message.and.status', error: 'test.error' }, 503 ); // This will call the error Handler 'test.exists.with.message.and.status'
	event.next( { code: 'test.exists.with.message.and.status', error: 'test.error', message: 'test.MESSAGE' }, 503 ); // This will call the error Handler 'test.exists.with.message.and.status'
	event.next( { code: 'test.exists.with.status' } ); // This will call the error Handler 'test.exists.with.status'
	event.next( { code: 'test.deep.we.go.on.deeper' } ); // This will call the error Handler 'test.deep'

	event.next( 'Error', 500 ); // This will call the error Handler default namespace

	event.send( 'Error', 500 ); // This will !!NOT!! call the error Handler

	throw new Error( 'test.exists.with.message.and.status' );
});
app.listen( 80 );
~~~

***
***
***

# [BodyParser](#body-parser)
- If you want to create a new BodyParser the new BodyParser must implement the functions described below

#### Accepted options

**NONE**

#### Functions

**supports( EventRequest event ): Boolean**
- This function will be called by the BodyParserHandler attached by the body parser plugin before the parser is actually called
- It must return a Boolean
- If a parser returns that it supports the given request, no further body parsers will be called

**parse( EventRequest event ): Promise: Object**
- Returns a promise
- This is called only if the body parser is supported.
- It must resolve with an object containing two parameters: { body : {}, rawBody: * } 

#### Examples

- If you want to add a custom BodyParser you can do:

~~~javascript
const BodyParserPlugin = require( 'event_request/server/plugins/available_plugins/body_parser_plugin' );

class CustomBodyParser
{
    parse(){} // define logic

    supports(){} // define logic
}

// The CustomBodyParser is the class and the options are the end are the parameters to be passed to the class
// This is done because A new body parser will be created on each request
const plugin    = new BodyParserPlugin( CustomBodyParser, 'custom_body_parser', { optionOne: 123, optionTwo: 'value' } );
~~~

***
***
***

# [DataServer](#data-server)
- Is an EventEmitter
- Can be extended
- This Data Server can store around 8million keys

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
- Defaults to false 

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

**_configure: void**
- This method is a protected method that should be implemented in case extension of the DataServer should be done
- This method sets up any options that will be used in the data server
- This method sets up persistence, garbage collection, etc
- This is called as a last step in the constructor.

**_setUpPersistence(): void**
- This method is the protected method that should be implemented in case extension of the DataServer should be done
- It is called in _configure to create the cache file we will be using if persistence is enabled

**get( String key, Object options = {} ): Promise: Object|null** 
- Retrieves the value given a key. Returns null if the key does not exist.
- This function is a 'public' method to be used by users.
- In the case that you want to implement your own DataServer, you should override **_get( String key )**

**_get( String key, Object options ): Promise: mixed|null** 
- This method is the protected method that should be implemented in case extension of the DataServer should be done
- Removes the DataSet if it is expired, otherwise returns it. Returns null if the data is removed.
- No need to check if key is a String, that has been done in the _get method already.
- This method also sets the expiration of the DataSet to Infinity if it is null.
- This will return the value set by set()
- NOTE: Always check the data. Just because for example a number is set it is not a rule to return a number. Different Data Store handle this differently

**set( String key, mixed value, Number ttl = 0, Object options = {} ): Promise: Object|null** 
- Returns the data if it was set, otherwise returns null
- Sets the given key with the given value. 
- ttl is the time in **seconds** that the data will be kept.
- If ttl is -1 then the dataSet will NEVER expire
- If ttl is 0 then the Default TTL will be used.
- If ttl is > 0 then the value will be used
- Calls _set() after checking the arguments if they are valid

**_set( String key, mixed value, Number ttl, Object options ): Promise: Object|null** 
- Implement for development. No need to do checks of the values of the parameter as that is done in the set() function
- This function commits the key/value to memory with all it's attributes
- If the dataSet existed, then a key 'isNew' must be set to true or false
- The options accept a Boolean flag persist that will override the global persist value. You can set a key to not be persisted. 
However if the global persist is set to false, this will not work
- Returns the data if it was set, otherwise returns null

**_makeDataSet( String key, mixed value, Number ttl, Boolean persist ): Object**  
- Forms the dataSet object and returns it in the following format: `{ key, value, ttl, expirationDate, persist };`

**touch( String key, Number ttl = 0, Object options = {} ): Promise: Boolean**
- Returns a Boolean whether the data was successfully touched
- Returns a false if key is not String or ttl is not Number
- Calls _touch after checking if arguments are valid

**_touch( String key, Number ttl, Object options ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the touch() function
- Returns a Boolean whether the data was successfully touched
- If ttl = 0 then the dataSet will be updated with it's own ttl
- This function actually touches the data

**decrement( String key, Number value = 1, Object options = {} ): Promise: Number|null**
- If value is not a number, returns null
- If the data was not set correctly returns null
- If the data to decrement was not set correctly returns null
- If the data to decrement was not numeric returns null
- Calls _decrement() after checking for validity of data
- The ttl of the value will be extended by it's original ttl

**_decrement( String key, Number value, Object options ): Promise: Number|null**
- Implement for development. No need to do checks of the values of the parameter as that is done in the decrement() function
- Retrieves, decrements and then saves the new dataset 
- If the operation is successfully done, returns the decremented value

**increment( String key, Number value = 1, Object options = {} ): Promise: Number|null**
- If value is not a number, returns null
- If the data was not set correctly returns null
- If the data to increment was not set correctly returns null
- If the data to increment was not numeric returns null
- Calls _increment() after checking for validity of data
- The ttl of the value will be extended by it's original ttl

**_increment( String key, Number value, Object options ): Promise: Number|null**
- Implement for development. No need to do checks of the values of the parameter as that is done in the increment() function
- Retrieves, increment and then saves the new dataset 
- If the operation is successfully done, returns the incremented value

**delete( String key, Object options = {} ): Promise: Boolean**
- Deletes the given data
- WIll return false if arguments are invalid

**_delete( String key, Object options ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the delete() function
- This function deletes the actual data
- Will return true always

**lock( String key, Object options = {} ): Promise: Boolean**
- Acquires a lock given a key.
- This calls _lock

**_lock( String key, Object options ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the lock() function
- Acquires a lock given a key.
- This will return true only if there is no key like that in the DataServer, otherwise return false

**unlock( String key, Object options = {} ): Promise: Boolean**
- Releases a lock
- This calls _unlock

**_unlock( String key, Object options ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the unlock() function
- Releases a lock
- This returns true always

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


# [DataServerMap](#data-server-map)
- Is an EventEmitter
- Can be extended
- Extends the DataServer
- Same as the default data server but uses a Map instead of an object
- It is recommended you use this one ( even tho it is not the default data server )
- This DataServer can store up to 16.7 million keys
- It can be extended to use a near infinite amount of keys if you set useBigMap to true
- Keep in mind when persisting millions of keys... is not fast

~~~javascript
const DataServerMap   = require( 'event_request/server/components/caching/data_server_map' );

console.log( DataServerMap );
console.log( new DataServerMap( options ) );
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
- Defaults to false 

**useBigMap: Boolean** 
- Flag that specifies whether the data should be stored in a Map or a BigMap. 
- Defaults to false 

#### Events:

**_saveDataError( Error error )**
- Emitted in case of an error while saving data

**_saveData()**
- Emitted when the data has finished saving

**stop()**
- Emitted when the server is stopping


#### Functions:

**_stop(): void**
- Removes the cache file
- Flushes the Map

**_configure: void**
- This method sets up any options that will be used in the data server
- This method sets up persistence, garbage collection, etc
- This is called as a last step in the constructor.

**_setUpPersistence(): void**
- It is called in configure to create the cache file we will be using if persistence is enabled

**_get( String key, Object options ): Promise: mixed|null** 
- Removes the DataSet if it is expired, otherwise returns it. Returns null if the data is removed.
- No need to check if key is a String, that has been done in the _get method already.
- This method also sets the expiration of the DataSet to Infinity if it is null.
- This will return the value set by set()

**_set( String key, mixed value, Number ttl, Object options ): Promise: Object|null** 
- This function commits the key/value to memory with all it's attributes
- If the dataSet existed, then a key 'isNew' must be set to true or false
- The options accept a Boolean flag persist that will override the global persist value. You can set a key to not be persisted. 
However if the global persist is set to false, this will not work
- Returns the data if it was set, otherwise returns null

**_touch( String key, Number ttl, Object options ): Promise: Boolean**
- Returns a Boolean whether the data was successfully touched
- If ttl = 0 then the dataSet will be updated with it's own ttl
- This function actually touches the data

**_decrement( String key, Number value, Object options ): Promise: Number|null**
- Retrieves, decrements and then saves the new dataset 
- If the operation is successfully done, returns the decremented value

**_increment( String key, Number value, Object options ): Promise: Number|null**
- Retrieves, increment and then saves the new dataset 
- If the operation is successfully done, returns the incremented value

**_delete( String key, Object options ): Promise: Boolean**
- This function deletes the actual data
- Will return true always

**_lock( String key, Object options ): Promise: Boolean**
- Acquires a lock given a key.
- This will return true only if there is no key like that in the DataServer, otherwise return false

**_unlock( String key, Object options ): Promise: Boolean**
- Releases a lock
- This returns true always

**_garbageCollect(): void**
- Prunes all the data from the server if needed
- Implement this if your Data Server needs it, otherwise leave it blank

**_saveData(): void**
- Persists all the data set to be persisted to disk
- Extra measures have been taken so this operation will not break if it is running fast, however if the persist interval is too low it still may cause an issue while saving
- This respects any data set with persist = false

**_loadData(): void**
- Loads all the data from disk

**Used for development purposes:**

**length(): Number**
- Returns how many keys there are


***
***
***
# [BigMap](#big-map)
- An implementation of the normal Map API
- This one can store a near infinite amounts of data
- It has the exact same usage as the normal Map and can be pretty much used as a replacement
- It will create a new Map every 14,000,000 keys.
- The internal limit can be changed by doing `map._limit = {LIMIT};`


***
***
***


***
# [Plug-ins](#plugins-section)
- Plug-ins can be added by using **server.apply( PluginInterfaceObject ||'pluginId', options )**. Some Plug-ins may require other plugins as a dependencies and will throw if missing.
- After plugins have been attached to the app they can be retrieved using `app.getPlugin( 'plugin_id' )` if needed.
- There is no rule preventing you to attach multiple plugins with the same name but keep in mind some are NOT supposed to be reattached ( each plugin has a note describing whether they can be reattached or not ). Also keep in mind when calling `app.getPlugin` you will fetch only the latest applied plugin.
- Some plugins do not need to be attached as they provide a dynamic middleware and can work without being applied ( however they may offer some benefits to being applied )
- Custom plugins may also be created as long as they follow the basic principles of the PluginInterface 
- Plug-ins can be added to the server.pluginManager and configured. Later on if you want to apply the preconfigured
    plugin all you have to do is do: server.apply( 'pluginId' )
- To enable IDE's smart autocomplete to work in your favor all the plugins 
   available in the pluginManager are exported as values in the server:
- The plugin interface can be retrieved like so:

~~~javascript
     const PluginInterface  = require( 'event_request/server/plugins/plugin_interface' );
~~~

- Available Plug-ins:
~~~
Server {
  er_timeout, -> Adds a request timeout functionality
  er_etag, -> Adds etag helpers 
  er_cache, -> Adds a Cache-control header with the given configuration to routes
  er_env, -> Reads an environment file and adds it to process.env
  er_rate_limits, -> Rate limiting for routes
  er_static, -> Serves static resources
  er_data_server, -> Adds a Caching Data Server 
  er_templating_engine, -> Attaches a render function 
  er_file_stream, -> Adds file streaming capabilities
  er_logger, -> Adds logging
  er_session, -> Adds session helpers 
  er_security, -> Adds different security headers
  er_cors, -> Adds CORS headers
  er_body_parser_json, -> Adds json body parser
  er_body_parser_form, -> Adds form body parser
  er_body_parser_multipart, -> Adds multipart body parser
  er_body_parser_raw, -> Adds raw body parser
  er_validation, -> Adds input validation helpers
}
~~~
- Generally all the internal plug-ins begin with `er_`

~~~javascript
const App = require( 'event_request' );
const app = App();

const PluginManager = app.getPluginManager();
const timeoutPlugin = PluginManager.getPlugin( 'er_timeout' );

timeoutPlugin.setOptions( { timeout : 5 * 1000 } );
app.apply( timeoutPlugin );

// app.er_timeout.setOptions( { timeout : 5 * 1000 } );
// app.apply( app.er_timeout );

// app.apply( timeoutPlugin, {  timeout : 5 * 1000 } );// This will accomplish the same thing as the rows above
//
// app.apply( 'er_timeout' ); // This is also valid.
// app.apply( 'er_timeout', {  timeout : 5 * 1000 } ); // This is also valid.
//
// app.apply( app.er_timeout ); // This is also valid.
// app.apply( app.er_timeout, {  timeout : 5 * 1000 } ); // This is also valid.

app.get('/',() => {});

app.listen( 80, () => {
    app.Loggur.log( 'Try opening http://localhost and wait for 5 seconds' )
} );
~~~

***
***
***

# [PluginInterface](#plugin-interface)
The PluginInterface is a general interface that must be implemented by all other plugins attached to the framework.

The PluginInterface has a getPluginMiddleware method that must return an array of middleware objects implementing handler,
route, method keys or instances of Route. 

The PluginInterface has a setOptions function that can be used to give instructions to the Plugin when it is being 
created and added to the event request

The PluginInterface implements a getPluginDependencies method that returns an Array of needed plugins to work.
These plugins must be installed before the dependant plugin is.

The PluginInterface implements a setServerOnRuntime method that passes the server as the first and only argument.

The PluginInterface implements a getPluginId method that returns the id of the plugin ( these must be unique ).

Generally plugins should not have any business logic in the constructor and rather have that in the setServerOnRuntime or getPluginMiddleware
functions. This is the case because new options can be given to the plugin when attaching to the server.

This is how the flow of adding a plugin goes:

1. Check if there are any options passed and if so, apply them with setOptions
2. Check if dependencies are matched
3. setServerOnRuntime
4. getPluginMiddleware 


# [Plugin Manager](#plugin-manager)
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

# [er_timeout](#er_timeout)
- Adds a timeout to the socket.
- This plugin internally calls response.setTimeout()

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**timeout: Number**
- the amount of milliseconds after which the request should timeout - Defaults to 60 seconds or 60000 milliseconds

**callback: Function**
- The callback that should be called in case the timeout is reached.
- The callback must accept the event request as the first parameter
- Will send back an error code: `app.er.timeout.timedOut`
- Will set status code : `408`
- Defaults to:

~~~javascript
function callback( event )
{
    event.sendError( { code: 'app.er.timeout.timedOut', status: 408 } );
}
~~~


***
#### Events:

**clearTimeout()**
- Emitted when the timeout is cleared

***
#### EventRequest Attached Functions

**event.clearTimeout(): void**
- Clears the Request Timeout
- Will do nothing if there is no timeout

**event.setTimeout( Number milliseconds ): void**
- Sets a new timeout for the event request 

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

~~~javascript
const App = require( 'event_request' );
const app = App();

const PluginManager = app.getPluginManager();
const timeoutPlugin = PluginManager.getPlugin( 'er_timeout' );

// timeoutPlugin.setOptions( { timeout : 2 * 1000 } );
// app.apply( timeoutPlugin );

// app.er_timeout.setOptions( { timeout : 2 * 1000 } );
// app.apply( app.er_timeout );

// app.apply( timeoutPlugin, {  timeout : 2 * 1000 } );// This will accomplish the same thing as the rows above
//
// app.apply( 'er_timeout' ); // This is also valid.
// app.apply( 'er_timeout', {  timeout : 2 * 1000 } ); // This is also valid.
//
// app.apply( app.er_timeout ); // This is also valid.
// app.apply( app.er_timeout, {  timeout : 2 * 1000 } ); // This is also valid.

// This attaches a timeout of 2 seconds with a custom callback
app.apply( app.er_timeout, { timeout: 2 * 1000, callback: ( event ) => {
        event.send( 'You timed out!', 200 );
    }
});

app.get('/',() => {});

app.listen( 80, () => {
    app.Loggur.log( 'Try opening http://localhost and wait for 2 seconds' )
});
~~~

***
***
***

# [er_static](#er_static)
- Adds a static resources path to the request.
- By default the server has this plugin attached to allow favicon.ico to be sent
- The Content-Type header will be set with the correct mime-type
- Supports Cache-Control header and ETag header
- **This Plugin can be re-applied multiple times with different configurations.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**paths: Array[String] | String**
- The path/s to the static resources to be served. Defaults to 'public'
- Can either be an array of strings or just one string
- The path starts from the root of the project ( where the node command is being executed )
- On more information how the files will be served, please see the type explanation further down

**cache: Object**
- Sets a Cache-control header using the same rules as the er_cache plugin
- Check out er_cache plugin for more information on the rules.
- Will only be set in case the resource is a static resource.
- By default it will set the default static directives: `public, max-age=604800, immutable`
- Defaults to { static: true } 

**useEtag: Boolean**
- Indicates whether ETags of the files should be sent, doing so will result in browser caching using ETags
- The plugin will be responsible for checking following requests if they have matching ETags and no response will be sent in that case
- You can use both cache and ETags however results may vary
- Defaults to false

**strong: Boolean**
- Only usable if useEtag is set to true
- Indicates if strong etags should be used
- Defaults to true

**type: Number**
- One of two constants: StaticResourcesPlugin.DYNAMIC or StaticResourcesPlugin.ABSOLUTE
- Defaults to StaticResourcesPlugin.DYNAMIC
- Changes the way that the static plugin works. If set to dynamic with a path of /css THEN all files under {{PROJECT_ROOT}}/css
will be served WITHOUT the /css in front. If there was a file in {{PROJECT_ROOT}}/css/main/main.css it will be served as /main/main.css. 
If set to ABSOLUTE path, then /css/main/main.css must be used

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

~~~javascript
const App = require( 'event_request' );
const app = App();

// This will serve everything in folder public and dist. e.g. /public/index.html will be served as /index.html 
app.apply( app.er_static, { paths : ['public', 'dist'] } );

// This will serve everything in folder public and dist from the project root. e.g. /public/index.html will be served as /public/index.html 
app.apply( app.er_static, { paths : ['public', 'dist'], type: 2 } );

// This will serve everything in folder public on the main folder and remove the Cache-control header
app.apply( app.er_static, { paths : ['public'], cache: { static: false } } );

// This will serve everything in folder public on the main folder and remove the Cache-control header, however sets an ETag header
app.apply( app.er_static, { paths : ['public'], cache: { static: false }, useEtag: true } );

// This will serve everything in folder public on the main folder and add a header: Cache-control: public, must-revalidate
app.apply( app.er_static, { paths : ['public'], cache: { cacheControl: 'public', revalidation: 'must-revalidate' } } );

//OR
// This will serve everything in folder public on the main folder
app.apply( 'er_static', { paths : ['public'] } );

//OR
// This will act according to the defaults
app.apply( 'er_static' );

//OR
// This will act according to the defaults
app.apply( app.er_static );

//OR
const PluginManager = app.getPluginManager();
const staticResourcesPlugin = PluginManager.getPlugin( 'er_static' );

// This will serve everything in folder public on the main folder
staticResourcesPlugin.setOptions( { paths : ['public'] } );
app.apply( staticResourcesPlugin );

app.listen( 80 );
~~~

~~~javascript
const app = require( 'event_request' )();

// This will serve all the files in the public subfolder ( a Cache-control header will be set ( Cache-Control: public, max-age=604800, immutable ) )
app.apply( app.er_static, { paths: ['public'] } );

app.listen( 80, () => {
    app.Loggur.log( 'Server started' );
});
~~~

~~~javascript
const app = require( 'event_request' )();

// This will server all the files in the public subfolder ( a Cache-control header will be set ( Cache-control: private ) )
// This disables the default static Cache-control header
app.apply( app.er_static, { paths: ['public'], cache: { static: false, cacheControl: 'private' } } );

app.listen( 80, () => {
    app.Loggur.log( 'Server started' );
});
~~~

***
***
***

# [er_data_server](#er_data_server)
- Adds a Caching Server using the DataServer provided in the constructor if any.
- This plugin will add a DataServer to: `event.dataServer`
- **This Plugin can NOT be re-applied multiple times.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**dataServerOptions: Object** 
- The options to be passed to the DataServer if the default one should be used

**dataServer: Object**
 - An already instantiated child of DataServer to be used instead of the default one
 - Uses Duck-Typing to determine if the dataServer is valid

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**event.dataServer: DataServer**
- The data server will be available to be used within the EventRequest after it has been applied in the middleware block
- You can retrieve the DataServer from any other plugin after this one has been applied by doing: server.getPlugin( 'er_data_server' ).getServer()

***
#### Exported Plugin Functions:

**getServer(): DataServer**
- Returns the instance of the DataServer, following a singleton pattern

***
#### Example:

- You can add the plugin like:
~~~javascript
const App = require( 'event_request' );
const app = App();

app.apply( 'er_data_server' );

// OR
app.apply( app.er_data_server );

// OR if you want to pass specific parameters to the default DataServer:
app.apply( app.er_data_server, { dataServerOptions: { persist: true, ttl: 200, persistPath: '/root' } } );

app.get( '/', async ( event ) => {
    const value    = await event.dataServer.get( 'testKey' );

    if ( value !== 'testValue' )
        await event.dataServer.set( 'testKey', 'testValue' );

    event.send( value )
});

app.listen( 80 , () => {
    app.Loggur.log( 'Server started, try going to http://localhost twice!' );
});
~~~

***
***
***

# [er_session](#er_session) 
- Adds a Session class.
- The session works with a cookie or a header.
- The cookie/header will be sent back to the client who must then return the cookie/header back.
- In the case of CORS enabled websites, look at the isSecureCookie option
- **This Plugin can NOT be re-applied multiple times.**

***
#### Dependencies:

 **er_data_server**

***
#### Accepted Options:

**ttl: Number**
- Time in seconds the session should be kept. 
- Defaults to 90 days or 7776000 seconds

**sessionKey: String**
- The cookie name. 
- Defaults to `sid`

**sessionIdLength: Number**
- The size of the session name. 
- Defaults to 32

**isCookieSession: Boolean**
- Flag that determines if the session is in a cookie or a header
- Defaults to true ( session cookie )

**isSecureCookie: Boolean**
- Flag that determines if the cookie to be set should be set with `SameSite: None; Secure`
- This is used when you want to enable CORS
- Defaults to false

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**event.initSession(): Promise** 
- Initializes the session. This should be called in the beginning when you want to start the user session
- This will initialize a new session if one does not exist and fetch the old one if one exists

***
#### Attached Functionality:

**event.session: Session**
- This is the main class that should be used to manipulate the user session.
- There is no need to save the changes done to the session, that will be done automatically at the end of the request

***
#### The Session exports the following functions:

**hasSession(): Promise: Boolean**
- Returns true if the user has a session started. 
- Generally will be false before you call initSession

**removeSession(): Promise: void**
- Deletes the current session from the caching server directly
- Deletes the cookie as well

**newSession(): Promise: String||Boolean**
- Resolves to the new sessionId or to false if failed

**add( String name, mixed value ): void**
- Adds a new value to the session given a key

**get( String key ): mixed**
- Gets a value from the session
- Returns null if the value does not exist

**delete( String key ): void**
- Deletes a key from the session

**has( String key ): Boolean**
- Checks if the session has the given key

**saveSession( String sessionId = currentSessionId ): Promise: Boolean**
- Save the current session
- The session id parameter is there for when switching sessions or creating new ones to not save the sessionId if it was not successfully created ( done internally )
- You probably should never pass a sessionId 

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

- You can use the session like this:
~~~javascript
const { Loggur, App } = require( 'event_request' );
const app = App();

app.apply( app.er_body_parser_json );
app.apply( app.er_body_parser_form );
app.apply( app.er_body_parser_multipart );
app.apply( app.er_data_server );
app.apply( app.er_session );

// Redirect to login if authenticated is not true
app.add( async ( event ) => {
    // Initialize the session
    await event.initSession()

    if (
        event.path !== '/login'
        && ( event.session.get( 'authenticated' ) !== true )
    ) {
        event.redirect( '/login' );
        return;
    }

    event.next();
});

app.post( '/login', async ( event ) => {
    const result = event.validate( event.body, { username : 'filled||string', password : 'filled||string' } );

    if ( result.hasValidationFailed() )
    {
        event.redirect( '/login' );
        return;
    }

    const { username, password } = result.getValidationResult();

    if ( username === 'username' && password === 'password' )
    {
        event.session.add( 'username', username );
        event.session.add( 'authenticated', true );

        event.redirect( '/' );
    }
    else
    {
        event.redirect( '/login' );
    }
});

app.get( '/login', ( event ) => {
    event.send( 'Try to post to /login with { username: "username", password: "password" } in the body. Make sure to send the cookie you get back!' );
})

app.get( '/',( event ) => {
    event.send( 'LOGGED IN!' );
});

app.listen( 80, () => {
    Loggur.log( 'Server started' );
});
~~~

***
***
***

# [er_templating_engine](#er_templating_engine)
- Adds a templating engine to the event request ( the default templating engine is used just to render static HTML, but there is an experimental templating engine that can parse JS inside the template )
- If you want to add a custom templating engine you have to set the render function in the options. Optionally you can set a different templateDir and templateExtension
- Use this ONLY if you want to serve static data or when testing
- **This Plugin can NOT be re-applied multiple times.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**render: Function**
- The render function should accept the template location as the first parameter and the variables as a second parameter
- If adding a custom templating engine, make sure to bind it's render function, in case that it needs to use `this`.
- Defaults to DefaultTemplatingEngine.renderFile which can be used to serve static HTML

**templateDir: String**
- Where to draw the templates from 
- Defaults to PROJECT_ROOT/public

**templateExtension: String**
- Since the templating engine builds the path for you dynamically, it will also add the templateExtension automatically. This is done to make the code easier to read. `event.render( 'index' );` instead of `event.render( 'index.html' );`. You can always choose to remove this by setting the templateExtension to an empty string. 
- This should be the extension without a dot infront of it!
- Defaults to 'html'

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**event.render( String templateName, Object variables = {} ): Promise**
- templateName will be the name of the file without the '.html' extension starting from the tempateDir given as a base ( folders are ok )
- The variables should be an object that will be given to the templating engine
- The promise will be resolved in case of a successful render. Note: you don't have to take any further actions, at this point the html has already been streamed
- The promise will be rejected in case of an error with the error that happened. Note: Make sure to catch any errors by doing something like: `event.render().catch( event.next );` or adding a custom handler
- This will not set a status code but use the one already set if any

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

~~~javascript
const app = require( 'event_request' )();
const customeTemplatingEngine = { render: ()=>{} };
app.apply( app.er_templating_engine, { templateDir: path.join( __dirname, './public' ) } );

// OR
app.apply( 'er_templating_engine' );

// OR
app.apply( app.er_templating_engine );

// OR
const PluginManager = server.getPluginManager();
const templatingEnginePlugin = PluginManager.getPlugin( app.er_templating_engine );

templatingEnginePlugin.setOptions( { templateDir : path.join( __dirname, './public' ), templateExtension: 'customExt', render : customeTemplatingEngine.render.bind( customeTemplatingEngine ) } ); 

app.apply( templatingEnginePlugin );

// THEN

app.get( '/preview', ( event ) => {
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

# [er_file_stream](#er_file_stream) 
- Adds a file streaming plugin to the site allowing different MIME types to be streamed
- Currently supported are :
  - Images: '.apng', '.bmp', '.gif', '.ico', '.cur', '.jpeg', '.jpg', '.jfif', '.pjpeg', '.pjp', '.png', '.svg', '.tif', '.tiff', '.webp'
  - Videos: '.mp4', '.webm'
  - Text: '.txt', '.js', '.php', '.html', '.json', '.cpp', '.h', '.md', '.bat', '.log', '.yml', '.ini', '.ts', '.ejs', '.twig', '', '.rtf', '.apt', '.fodt', '.rft', '.apkg', '.fpt', '.lst', '.doc', '.docx', '.man', '.plain', '.text', '.odm', '.readme', '.cmd', '.ps1'
  - Audio: '.mp3', '.flac', '.wav', '.aiff', '.aac'
- The VideoFileStream can be paired up with an HTML5 video player to stream videos to it
- The AudioFileStream can also be paired up with an HTML5 video player to stream audio to it
- Each file stream has a getType method that returns whether it is a video, text, image or audio
- Files with no extension will be treated as text files
- **This Plugin can NOT be re-applied multiple times.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**NONE**

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**event.streamFile( String file, Object options = {}, errCallback ): void** 
- This function accepts the absolute file name ( file ) and any options that should be given to the file stream ( options )
- This function may accept an errCallback that will be called if there are no fileStreams that can handle the given file, otherwise call it will call event.next() with an error and a status code of 400

**event.getFileStream( file, options = {} ): FileStream | null**
- This function accepts the absolute file name ( file ) and any options that should be given to the file stream ( options )
- This function will return null if no file streams were found or in case of another error

***
#### Attached Functionality:

**event.fileStreamHandler: Object**
- Object containing one function: **getFileStreamerForType( String file ): FileStream**

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

~~~javascript
const app = require( 'event_request' )();

const PluginManager = app.getPluginManager();
const fileStreamPlugin = PluginManager.getPlugin( 'er_file_stream' );
app.apply( fileStreamPlugin );

// OR
app.apply( app.er_file_stream );

// OR
app.apply( 'er_file_stream' );
~~~

- Example of streaming data:
~~~javascript
const fs = require( 'fs' );
const app = require( 'event_request' )();

app.apply( app.er_file_stream );

app.get( '/data', ( event ) => {
        const result    = event.validation.validate( event.query, { file: 'filled||string||min:1' } );
        const file        = ! result.hasValidationFailed() ? result.getValidationResult().file : false;

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

app.get( '/dataTwo', ( event ) => {
        const result    = event.validation.validate( event.query, { file: 'filled||string||min:1' } );
        const file        = ! result.hasValidationFailed() ? result.getValidationResult().file : false;

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

app.listen( '80', () => {
    app.Loggur.log( 'Try hitting http://localhost/data?file={someFileInTheCurrentProjectRoot}' );
});
~~~

***
***
***

# [er_logger](#er_logger) 
- Adds a logger to the eventRequest
- Attaches a log( data, level ) function to the process for easier access
- This can be controlled and turned off. The process.log( data, level ) calls the given logger
- **This Plugin can NOT be re-applied multiple times.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**logger: Logger**
- Instance of Logger, if incorrect object provided, defaults to the default logger from the Loggur

**attachToProcess: Boolean**
- Boolean whether the plugin should attach log to the process

***
#### Events:

**NONE**

***
#### EventRequest Events Attached To

**Event: 'error'**
- Logs with a log level of 100 ( error ) any error that is passed here 

**Event: 'on_error'**
- Logs with a log level of 100 ( error ) any error that is passed here 

**Event: 'redirect'**
- Logs with a log level of 400 ( info ) where the redirect was to

**Event: 'finished'**
- Logs with a log level of 500 ( verbose ) that the event is finished

**Event: 'cleanUp'**
- Logs with a log level of 300 ( notice ) the method, path, responseStatusCode, clientIp and userAgent

**Event: 'verbose'**
- Logs with a log level of 300 ( notice ) the method, path, responseStatusCode, clientIp and userAgent

**Middleware**
- Logs with a log level of 500 ( verbose ) the headers and the cookies

**event.logger: Logger**
- The logger that was passed to the logger plugin

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**process.log( data, level ): Promise**
- You can use the attached logger anywhere

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

~~~javascript
const app = require( 'event_request' )();

const PluginManager = app.getPluginManager();
const loggerPlugin = PluginManager.getPlugin( 'er_logger' );
app.apply( loggerPlugin );

//OR
app.apply( 'er_logger' );

//OR
app.apply( app.er_logger, { logger: SomeCustomLogger, attachToProcess: false } );
~~~

***
***
***

# [er_body_parser_json, er_body_parser_form, er_body_parser_multipart, er_body_parser_raw](#er_body_parsers)
- Adds a JsonBodyParser, FormBodyParser, MultipartBodyParser or RawBodyParser bodyParsers respectively
- They all implement the design principle behind the BodyParser
- Parsers are only fired if they support the given content-type
- json parser supports: application/json
- form body parser supports: application/x-www-form-urlencoded
- multipart body parser supports: multipart/form-data
- er_body_parser_raw is a fallback body parser that will return the data as a raw string if no other parser supports the request. The default body parser has a limit of 10MB. It can optionally be added as a final parser manually to have it's maxPayloadLength changed
- THE BODY PARSER PLUGINS WILL NOT PARSE DATA IF event.body exists when hitting the middleware
- This Plugin can be re-applied multiple times with different body parsers

***
***
#### Dependencies:

**NONE**

***
***

#### Accepted Options:

***
##### MultipartFormParser:

**maxPayload: Number**
- Maximum payload in bytes to parse if set to 0 means infinite 
- Defaults to 0

**tempDir: String** 
- The directory where to keep the uploaded files before moving 
- Defaults to the tmp dir of the os

***
##### JsonBodyParser:
**maxPayloadLength: Number** 
- The max size of the body to be parsed 
- Defaults to 104857600/ 100MB

**strict: Boolean**
- Whether the received payload must match the content-length 
- Defaults to false

***
##### RawBodyParser:
**maxPayloadLength: Number** 
- The max size of the body to be parsed 
- Defaults to 10485760/ 10MB

***
##### FormBodyParser:
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
***

#### Errors:

***
##### MultipartFormParser:

**app.er.bodyParser.multipart.invalidState**

**app.er.bodyParser.multipart.couldNotFlushBuffer**

**app.er.bodyParser.multipart.invalidMetadata**

***
##### JsonBodyParser:

**NONE** 

***
##### RawBodyParser:

**NONE** 


***
##### FormBodyParser:

**NONE** 


***
***

#### Events:

**NONE**

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**event.body: Object**
- Will hold different data according to which parser was fired
- Json and Form Body parsers will have a JS object set as the body
- The multipart body parser may have **$files** key set as well as whatever data was sent in a JS object format. The $files contain helpful data about the files saved ( as well as the absolute path they were saved in ). The files will automatically be cleared up if they were not moved before eventRequest.cleanUp event is called.

**event.rawBody: Object**
- Will hold the RAW request received
- Json and Form Body parsers will have a JS object 
- The multipart body parser will also have the rawBody set but will always be {}

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

~~~javascript
const app = require( 'event_request' )();
const path = require( 'path' );
const PROJECT_ROOT = path.parse( require.main.filename ).dir;

// Add Body Parsers
app.apply( app.er_body_parser_json );
app.apply( app.er_body_parser_form );
app.apply( app.er_body_parser_multipart );
app.apply( app.er_body_parser_raw );

// Add body parsers with custom options
app.apply( app.er_body_parser_json, { maxPayloadLength: 104857600, strict: false } );
app.apply( app.er_body_parser_form, { maxPayloadLength: 10485760, strict: false } );
app.apply( app.er_body_parser_multipart, { cleanUpItemsTimeoutMS: 100, maxPayload: 0, tempDir: path.join( PROJECT_ROOT, '/Uploads' ) } );
app.apply( app.er_body_parser_raw, { maxPayloadLength: 10485760 } );

app.post( '/submit', ( event ) => {
    console.log( event.body );
    console.log( event.rawBody );
    // This will be filled if files were processed by er_body_parser_multipart
    console.log( event.$files );

    event.send();
});
~~~

***
***
***


# [er_response_cache](#er_response_cache) 
## DEPRECATION NOTICE: this plugin was a very early adaptation of caching. You should be using browser caching instead of an approach like this. Check out er_etag and er_cache
- Adds a response caching mechanism.
- It will only cache IF you call event.send
- It will only cache 2xx responses
- **This Plugin can NOT be re-applied multiple times.**

***
#### Dependencies:

**er_data_server**

***
#### Accepted Options:

**NONE**

***
#### Events:

**cachedResponse()**
- Emits if the response is sent from the cache.

***
#### EventRequest Attached Functions

**cacheCurrentRequest(): Promise**
- Caches the current request.
- Will not cache the response if the response was not a String

***
#### Attached Functionality:

GlobalMiddleware: **cache.request**
- Can be added to any request as a global middleware and that request will be cached if possible

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

~~~javascript
const app = require( 'event_request' )();

app.apply( app.er_data_server );
app.apply( app.er_response_cache );

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// call event.cacheCurrentRequest() where you want to cache.
app.add({
    route : '/',
    method : 'GET',
    handler : ( event ) => {
        event.cacheCurrentRequest().catch( event.next );
        // Nothing else should be done after calling cache current request in the same middleware, a new one needs to be added
        // cacheCurrentRequest calls next inside it if it is not cached and caches it, if it is cached, then it will return the cached result
    }
});

// OR
// When setting a request to be cached, ttl and useIp may be passed that will overwrite the default options
// app.add( ( event ) => {
//     //**useIp** -> whether the user Ip should be included when caching. This allows PER USER cache. -> Defaults to false
//     //**ttl** -> time to live for the record. Defaults to 60 * 5000 ms
//
//     event.cacheCurrentRequest( { ttl: 20 * 1000, useIp: true } ).catch( event.next );
// });


let counter    = 0;

// call event.cacheCurrentRequest() where you want to cache.
app.add({
    route : '/',
    method : 'GET',
    handler : ( event ) => {
        counter ++;

        if ( counter > 1 )
            event.send( 'NOT CACHED', 500 );

        event.send( 'ok' );
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// OR  You can create your own middleware that will be added to all requests
// you want to cache, no need to do it separately
let counterTwo        = 0;
let counterThree    = 0;

app.get( /\/test/, ( event ) => {
    event.cacheCurrentRequest().catch( event.next );
});

app.get( '/testTwo', async ( event ) => {
    counterTwo ++;

    if ( counterTwo > 1 )
        event.send( 'NOT CACHED', 500 );

    event.send( 'ok' );
});

app.get( '/testThree', async ( event ) => {
    counterThree ++;

    if ( counterThree > 1 )
        event.send( 'NOT CACHED', 500 );

    event.send( 'ok' );
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let counterFour = 0;

// You can add it via a middleware to a specific route
app.get( '/testFour', 'cache.request', ( event )=>
    {
        counterFour ++;

        if ( counterFour > 1 )
            event.send( 'NOT CACHED', 500 );

        event.send( 'ok' );
    }
);

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost, http://localhost/testTwo, http://localhost/testThree, http://localhost/testFour' );
});
~~~

***
***
***

# [er_env](#er_env) 
- Adds environment variables from a .env file to the process.env Object. In case the .env file changes
- This plugin will automatically update the process.env and will delete the old environment variables.
- **This Plugin can NOT be re-applied multiple times.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**fileLocation: String**
- The absolute path to the .env file you want to use
- Defaults to PROJECT_ROOT

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

- Create a new .env file with the following content: `KEY=TEST`
~~~javascript
const app = require( 'event_request' )();

app.apply( 'er_env' );

console.log( process.env );

console.log( process.env.KEY );
~~~

***
***
***

# [er_etag](#er_etag) 
- This plugin provides helpful functions for setting and parsing ETags
- See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match
- See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match
- See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag
- **This Plugin can NOT be re-applied multiple times.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**strong: Boolean**
- Flag indicating if a strong or weak caching mechanism should be used
- This flag can be overwritten by every function that this plugin exposes
- Defaults to true

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**etag( String|Buffer|fs.Stats payload, Boolean strong ): String**
- Returns the Etag ready to be set directly to the ETag header.
- Depending on strong this function will prepend W/ for weak etags
- If strong is passed, then this value will overwrite the plugin strong value
- This function will throw a TypeError with code: `app.er.er_etag.invalid.payload` if payload is an incorrect format

**getConditionalResult( String|Buffer|fs.Stats payload, Boolean strong ): Object**
- This function checks if the event contains "Conditional" Headers: `If-None-Match` or `If-Match` and processes if the response should continue according to them and the calculated etag of the payload.
- This function returns an object containing 2 keys: `pass` and `etag`
- `pass` indicates if the request should continue execution. 
- `etag` is the calculated etag for the payload
- If strong is passed, then this value will overwrite the plugin strong value

**conditionalSend( String|Buffer payload, Number code, Boolean strong ): void**
- This function sends the payload depending on the conditional headers.
- This function uses getConditionalResult to determiner if the response should be sent.
- In the case that the response SHOULD NOT be sent, then according to the method either a 412 or a 304 empty response will be sent.
- This method will set a ETag header with the calculated value
- If strong is passed, then this value will overwrite the plugin strong value
- **NOTE: This function does not accept fs.Stats as a parameter**

**setEtagHeader( String etag ): EventRequest**
- This method sets a computed etag header.

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**etag( String|Buffer|fs.Stats payload, Boolean strong ): String**
- No differences

**getConditionalResult( EventRequest event, String|Buffer|fs.Stats payload, Boolean strong ): Object**
- Only difference is this function accepts EventRequest as a first parameter

**conditionalSend( EventRequest event, String|Buffer payload, Number code, Boolean strong ): void**
- Only difference is this function accepts EventRequest as a first parameter

***
#### Example:

- Example of conditionalSend
~~~javascript
const app = require( 'event_request' )();

app.apply( app.er_etag, { strong: true } );

app.get( '/', ( event ) => {
    event.conditionalSend( 'Some Fancy Body!' );
});

app.listen( 80, () => {
    app.Loggur.log( `Server started! Try going to http://localhost and check the network tab after refreshing the page. An empty response with a status of 304 should have been sent! ( it is better visible if you curl it, it may seem like nothing is happening, but check the response size )` );
});

~~~

***
***
***

# [er_cache](#er_cache) 
- Adds a Cache-control header with the given configuration
- Check out https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control for more details
- **This Plugin can be re-applied multiple times with different configurations.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**cacheControl: String**
- This can be one of the following: 'public', 'private', 'no-cache', 'no-store'
- By default will not be set

**revalidation: String**
- This can be one of the following: 'must-revalidate', 'proxy-revalidate', 'immutable'
- By default will not be set

**other: String**
- This can be one of the following: 'no-transform'
- By default will not be set

**expirationDirectives: Object**
- Contains keys with all the expiration directives you want to set that equal to values that MUST be numbers
- The keys can be one of the following: 'max-age', 's-maxage', 'max-stale', 'min-fresh', 'stale-while-revalidate', 'stale-if-errors'
- By default will not be set

**static: Boolean**
- This will set headers for static resources:
- Cache-control: public, max-age=604800, immutable
- Can be overwritten by custom directives
- Defaults to false

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**DynamicMiddleware: cache( Object options ): Function**
- This function generates a Dynamic Middleware
- Options is an object that accept the same options passed to the plugin, same rules apply

***
#### Example:

~~~javascript
const app = require( 'event_request' );

// Cache all requests
app.apply( app.er_cache, { cacheControl: 'private', expirationDirectives: { 'max-age': 123 }, revalidation: 'must-revalidate' } );

app.get( '/', ( event ) => {
    event.send( 'ok' );
});

// Cache only GET requests to /dynamic
app.get( '/dynamic', app.er_cache.cache( { static: true } ), ( event ) => {
    event.send( 'ok' );
});

app.listen( 80, () => {
    app.Loggur.log( 'Server started! Visit: http://localhost and check out the response headers! Look for the Cache-control header.' );
    app.Loggur.log( 'After that visit: http://localhost/dynamic and do the same!' );
});
~~~

***
***
***

# [er_validation](#er_validation) 
- Does not attach any functionality
- Provides a Dynamic Middleware that can validate any EventRequest properties
- **This Plugin can be re-applied multiple times with different configurations.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**failureCallback: Function**
- The plugin can be attached or setup to have a default failureCallback which will be taken if one is not provided

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**DynamicMiddleware: validate( Object validationRules, Function failureCallback): Function**
- This function generates a Dynamic Middleware
- This can validate any parameter of the EventRequest like: body/query/headers/etc
- It can validate multiple parameters at one time
- The validationRules must be an object with parametersToValidate pointing to validation skeletons
- If no failureCallback is provided then a generic error will be sent with the validation error directly
- if one is provided it must accept 3 parameters: ( EventRequest eventRequest, String validationParameter, ValidationResult validatrionResult )
- If the parameter you are trying to validate does not exist in the EventRequest object, then by default sendError is called with a status code of 400, code: app.er.validation.error and the message containing the invalid input
- After validation the validated params will be set in the EventRequest parameter that was validated: if you validated query for example the validated parameters will be set in the query object ( this way if any conversion was done by asserting a key is numeric or string for example, the correct type will be kept )
- You don't have to validate all the keys, the objects will be merged
- This plugin uses the built in validation suite

***
#### Example:

~~~javascript
const app = require( 'event_request' )();

app.apply( app.er_body_parser_multipart );

// This will validate the query parameters
app.get( '/',
    app.er_validation.validate( { query : { testKey: 'numeric||min:1||max:255' } } ),
    ( event ) => {
        event.send( { query: event.query } );
    }
);

app.listen( 80, () => {
        app.Loggur.log(
            'Server started on port 80. Try going to http://localhost?testKey=5. Change the value for testKey to get a different response.'
        );
    }
);
~~~

- Passing a custom failure callback
~~~javascript
const app = require( 'event_request' )();

// This will validate the query parameters and will call the error callback
app.get( '/',
    app.er_validation.validate(
        { query : { testKey: 'numeric||min:1||max:255' } },
        ( event, validationParameter, validationResult ) => {
            app.Loggur.log( validationParameter, null, true );
            app.Loggur.log( validationResult, null, true );

            event.send( 'ok' );
        }
    ),
    ( event ) => {
        event.send( { query: event.query } );
    }
);

app.listen( 80, () => {
        app.Loggur.log(
            'Server started on port 80. Try going to http://localhost?testKey=5. Change the value for testKey to get a different response.'
        );
    }
);
~~~

- When passing a default one and a custom one, the custom one will be used
~~~javascript
const app = require( 'event_request' )();

// Alternatively you can do:
app.er_validation.setOptions({
    failureCallback: ( event, validationParameter, validationResult ) => {
        app.Loggur.log( validationParameter, null, true );
        app.Loggur.log( validationResult, null, true );

        event.send( 'DEFAULT' );
    }
});

app.apply( app.er_body_parser_multipart );
app.apply( app.er_body_parser_json );
app.apply( app.er_body_parser_form );

// This will validate the query parameters and will call the error callback
app.get( '/',
    app.er_validation.validate(
        { query : { testKey: 'numeric||min:1||max:255' } },
        ( event, validationParameter, validationResult ) => {
            app.Loggur.log( validationParameter, null, true );
            app.Loggur.log( validationResult, null, true );

            event.send( 'CUSTOM' );
        }
    ),
    ( event ) => {
        event.send( { query: event.query } );
    }
);

app.listen( 80, () => {
        app.Loggur.log(
            'Server started on port 80. Try going to http://localhost?testKey=5. Change the value for testKey to get a different response.'
        );
    }
);
~~~

- When passing a default one if no failure callback is provided then the default one will be used
~~~javascript
const app = require( 'event_request' )();

app.apply(
    app.er_validation,
    {
        failureCallback: ( event, validationParameter, validationResult ) => {
            app.Loggur.log( validationParameter, null, true );
            app.Loggur.log( validationResult, null, true );

            event.send( 'ok' );
        }
    }
);

app.apply( app.er_body_parser_multipart );
app.apply( app.er_body_parser_json );
app.apply( app.er_body_parser_form );

// This will validate the query parameters and the body and will call the error callback
app.post( '/',
    app.er_validation.validate(
        { query : { testKey: 'numeric||min:1||max:255' }, body: { test: 'numeric||range:1-255' } }
    ),
    ( event ) => {
        event.send( { query: event.query, body: event.body } );
    }
);

// This will validate the query parameters and will call the error callback
app.get( '/',
    app.er_validation.validate(
        { query : { testKey: 'numeric||min:1||max:255' } }
    ),
    ( event ) => {
        event.send( { query: event.query } );
    }
);

app.listen( 80, () => {
        app.Loggur.log(
            'Server started on port 80. Try going to http://localhost?testKey=5. Change the value for testKey to'
            + ' get a different response. Try posting to http://localhost?testKey=5 with a body: test=5. Change the'
            + ' value for test in the body to get a different response'
        );
    }
);
~~~

***
***
***

# [er_cors](#er_cors) 
- Adds commonly used CORS headers
- In case of an options request returns 204 status code
- **This Plugin can NOT be re-applied multiple times.**
- Defaults to:

~~~javascript
const defaults = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': '*',
     'Access-Control-Allow-Methods': 'POST, PUT, GET, DELETE, HEAD, PATCH, COPY',
};
~~~

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**origin: String|Array**
- The allowed origins 
- Sets Access-Control-Allow-Origin
- If an array is passed then the origin will be retrieved from the request 'origin' header and echoed back if in the array, otherwise set the origin as the first value in that array
- You can also set the origin to `er_dynamic` which will always echo back the request 'origin' header
- Defaults to '*'

**headers: Array**
- he Access-Control-Allow-Headers response header is used in response to a preflight request which includes the Access-Control-Request-Headers to indicate which HTTP headers can be used during the actual request.
- Sets Access-Control-Allow-Headers
- Defaults to '*'

**exposedHeader: Array**
- Response header indicates which headers can be exposed as part of the response by listing their names.
- Sets Access-Control-Expose-Headers
- Defaults to '*'

**methods: Array**
- The Allowed methods
- Only returned in case of an OPTIONS request  
- Sets Access-Control-Allow-Methods
- Defaults to 'POST, PUT, GET, DELETE, HEAD, PATCH, COPY'

**status: Number**
- The status code that will be returned in case of an options request
- Only returned in case of an OPTIONS request  
- Defaults to 204

**credentials: Boolean**
- response header tells browsers whether to expose the response to frontend JavaScript code when the request's credentials mode (Request.credentials) is include.
- Sets Access-Control-Allow-Credentials
- Omitted by default

**maxAge: Number**
- indicates how long the results of a preflight request (that is the information contained in the Access-Control-Allow-Methods and Access-Control-Allow-Headers headers) can be cached.
- Sets Access-Control-Max-Age
- Maximum number of seconds the results can be cached.
- Firefox caps this at 24 hours (86400 seconds).
- Chromium (prior to v76) caps at 10 minutes (600 seconds).
- Chromium (starting in v76) caps at 2 hours (7200 seconds).
- Chromium also specifies a default value of 5 seconds.
- A value of -1 will disable caching, requiring a preflight OPTIONS check for all calls.
- Omitted by default

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

~~~javascript
const app = require( 'event_request' )();

app.apply( app.er_cors, {
    origin: 'http://example.com',
    methods: ['GET', 'POST'],
    headers: ['Accepts', 'X-Requested-With'],
    exposedHeaders: ['Accepts'],
    status: 200,
    maxAge: 200,
    credentials: true,
});

app.add(( event ) => {
    event.send( event.response.getHeaders() );
});

app.listen( 80, () => {
    app.Loggur.log( 'Server started, try going to http://localhost and check the body. It will have the returned headers!' )
});
~~~

- Multiple origins
~~~javascript
const app = require( 'event_request' )();

app.apply( app.er_cors, { origin: ['http://example.com', 'http://localhost'] });

app.add(( event ) => {
    event.send( event.response.getHeaders() );
});

app.listen( 80, () => {
    app.Loggur.log( 'Server started, try going to http://localhost and check the body. It will have the returned headers!' )
});
~~~

- Echoes back the requested origin with er_dynamic
~~~javascript
const app = require( 'event_request' )();

app.apply( app.er_cors, { origin: 'er_dynamic' });

app.add(( event ) => {
    event.send( event.response.getHeaders() );
});

app.listen( 80, () => {
    app.Loggur.log( 'Server started, try going to http://localhost and check the body. It will have the returned headers!' )
});
~~~

***
***
***

# [er_rate_limits](#er_rate_limits)
- THIS PLUGIN NEEDS WORK, IT'S WAY TOO RESOURCE CONSUMING
- Adds a Rate limits plugin to the server. 
- The rate limits plugin can monitor incoming requests and stop/delay/allow them if they are too many
- The rate limits plugin will create a new rate_limits.json file in the root project folder IF one does not exist and useFile is set to true
- If one exists, then the existing one's configuration will be taken. 
- Instead of passing fileLocation you can pass the rules directly as an array
- If you provide the same dataStore to two servers they should work without an issue
- If you don't provide a dataStore, then the er_data_server data store will be used. If that plugin is not set, then the default bucket one will be used
- **This Plugin can be re-applied multiple times with different configurations, however it may not be the best idea to do so.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**fileLocation**
- The absolute path to the rate limits json file.
- The rules will be validated.
- Defaults to ROOT DIR / rate_limits.json

**dataStore**
- The dataStore to use for the buckets
- Defaults to the LeakyBucket default DataStore

**rules**
- Optional parameter that if passed will have more weight than the rate_limits.json file.
- If this is passed the file will never be created/loaded
- The structure of this option must be the same as the one in the rate_limits.json file.
- The rules will be validated.
- Defaults to empty

**useFile**
- Optional parameter that determines if the rate limits should be fetched from a file ( specified by fileLocation ) or not
- Defaults to false

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**NONE**

***
#### Attached Functionality:

**event.rateLimited: Boolean**
- Flag depicting whether the request was rate limited or not

***
#### Exported Plugin Functions:

**DynamicMiddleware: rateLimit( Object rule ): Function**
- This function generates a Dynamic Middleware
- The rule provided will apply ONLY for this route. 
- It will ALWAYS match
- You don't need to provide path or methods for this rule, they will be determined dynamically
- If you want multiple rate limiting rules to be applied then you can call this function as many times as you would like and pass the array of functions
- You don't have to apply the plugin in order to use the rateLimit function but if you want to provide a custom data store for a distributed environment then you have to.
- !!!WARNING!!!: Due to the way that middlewares work, this will be fired very very late. If you want to limit things like file transfers or authorization ( operations that cost resources ), then this approach may not be the best. Alternatively you can add a new middleware with the same route/method as the one you want to rate limit just before these costly operations and rate limit that.

***
#### Notes:
If you want to create custom rate limiting you can get er_rate_limits plugin and use getBucketFromOptions to get a new bucket, given options for it
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
- Defaults to false
- Optional

**ipLimit: Boolean**
- whether the rate limiting should be done per ip
- Defaults to false
- Optional

*** 
#### POLICIES:

**PERMISSIVE_POLICY**    = 'permissive';

This policy will let the client connect freely but a flag will be set that it was rate limited

**CONNECTION_DELAY_POLICY**    = 'connection_delay';

This policy will rate limit normally the request and will hold the connection until a token is freed
If this is the policy specified then **delayTime** and **delayRetries** must be given. This will be the time after
a check should be made if there is a free token.
The first connection delay policy hit in the case of many will be used to determine the delay time but
all buckets affected by such a connection delay will be affected


**STRICT_POLICY**    = 'strict';

This policy will instantly reject if there are not enough tokens and return an empty response with a 429 header.
This will also include a Retry-After header. If this policy is triggered, stopPropagation will be ignored and
the request will be immediately canceled

***
#### Example:
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

- Simple implementation
~~~javascript
const app = require( 'event_request' )();

const rule = {
    path : '/rate',
    methods : ['GET'],
    maxAmount :3,
    refillTime :10,
    refillAmount :2,
    policy : 'strict'
};

app.apply( app.er_rate_limits, { rules: [rule] } );

app.get( '/rate', ( event ) => {
    event.send( 'ok' );
});

app.listen( 80, () => {
    app.Loggur.log( 'Server started at port 80, try visiting http://localhost:80/rate a 4 times' );
});
~~~

- If you implement a custom distributed DataServer you can sync between servers
~~~javascript
const { Server } = require( 'event_request' );
const DataServer = require( 'event_request/server/components/caching/data_server' );
const dataStore = new DataServer( { persist: false, ttl: 90000 } );

const appOne = new Server();
const appTwo = new Server();

const rule = {
    path : '/rate',
    methods : ['GET'],
    maxAmount :3,
    refillTime :10,
    refillAmount :2,
    policy : 'strict'
};

appOne.apply( appOne.er_rate_limits, { dataStore, rules: [rule] } );
appTwo.apply( appTwo.er_rate_limits, { dataStore, rules: [rule] } );

appOne.get( '/rate', ( event ) => {
    event.send( 'ok' );
});

appTwo.get( '/rate', ( event ) => {
    event.send( 'ok' );
});

appOne.listen( 80, () => {
    appOne.Loggur.log( 'Server One started at port 80, try visiting http://localhost:80/rate 2 times' )
});

appTwo.listen( 81, () => {
    appTwo.Loggur.log( 'Server Two started at port 81, try visiting http://localhost:81/rate 2 times' )
});
~~~

- Using the global middleware
~~~javascript
const app = require( 'event_request' )();

const rule = {
    "maxAmount":3,
    "refillTime":100,
    "refillAmount":2,
    "policy": 'strict'
};

// No need to apply this
app.apply( app.er_rate_limits );

app.get( '/testRoute', app.er_rate_limits.rateLimit( rule ), ( event ) => {
    event.send( 'ok' );
});

const ruleTwo  = {
    "maxAmount":1,
    "refillTime":100,
    "refillAmount":1,
    "policy": 'permissive'
};

app.get( '/testRouteTwo', [
    app.er_rate_limits.rateLimit( ruleTwo ),
    app.er_rate_limits.rateLimit( rule )
], ( event ) => {
    event.send( `You have been rate limited by permissive: ${event.rateLimited}` );
});

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost/testRoute and then to http://localhost/testRouteTwo and refreshing a few times' );
});
~~~

- Adding with rules directly:
~~~javascript
const app = require( 'event_request' )();

const rules = [
    {
        "path": "/",
        "methods": [],
        "maxAmount": 2,
        "refillTime": 5,
        "refillAmount": 1,
        "policy": "strict"
    },
    {
        "path": "/connection",
        "methods": [],
        "maxAmount": 2,
        "refillTime": 5,
        "refillAmount": 1,
        "policy": "connection_delay",
        "delayTime": 3,
        "delayRetries": 5,
        "ipLimit": true
    },
    {
        "path": "/permissive",
        "methods": [],
        "maxAmount": 2,
        "refillTime": 5,
        "refillAmount": 1,
        "policy": "permissive",
        "ipLimit": true
    },
];

app.apply( app.er_rate_limits, { rules } );

app.get( '/', ( event ) => {
    event.send( 'You have been allowed in!' );
});

app.get( '/connection', ( event ) => {
    event.send( 'You have been allowed in!' );
});

app.get( '/permissive', ( event ) => {
    event.send( `You have been limited: ${event.rateLimited}` );
});

app.listen( 80, () => {
    app.Loggur.log( 'Try going to http://localhost and hit refresh a few times. You will get an error but after a while you will be let back in.' );
    app.Loggur.log( 'Try going to http://localhost/connection and hit refresh a few times. The site will be stuck loading for a while but will eventually connect.' );
    app.Loggur.log( 'Try going to http://localhost/permissive and hit refresh a few times. You will not get an error but you will see a flag is set' );
});
~~~

***
***
***

# [er_security](#er_security) 
- Adds common security http headers
- Options for all the headers can be passed directly in the options and later changed as all components used by the security plugin implement a builder pattern
- **This Plugin can be re-applied multiple times with different configurations, however it may not be a good idea to do so.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

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
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**event.$security.build(): void**
- This function accepts no arguments. 
- It is used to set all the security headers
- This function is called if the build flag is set

***
#### Attached Functionality:

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
#### Exported Plugin Functions:

**NONE**

***
#### Objects:

##### HTTP Strict Transport Security
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

##### Content Type Options
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

##### Expect-CT
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

##### Content Security Policy
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
- Tfhis will add single quotes if needed

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
#### Example:

- Apply the plugin with defaults
~~~javascript
const app = require( 'event_request' )();

// It's a good idea to do this first before attaching any other plugins or adding routes
app.apply( app.er_security );
~~~

- Apply the plugin and use the builder methods
~~~javascript
const app = require( 'event_request' )();

app.apply( app.er_security );

app.add(( event ) => {
    event.$security.csp.enableSandbox();
    event.$security.hsts.setEnabled( false );
    event.$security.cto.setEnabled( false );
    event.$security.ect.setMaxAge( 300 );
    event.$security.ect.setReportUri( '/report/uri' );

    event.$security.build();

    event.send();
});

app.listen( 80, () => {
    app.Loggur.log( 'Try opening http://localhost and checking the headers sent from the server!' );
});
~~~

- Apply the plugin with custom directives
~~~javascript
const app = require( 'event_request' )();

app.apply( app.er_security, {
    csp    : {
        directives    : {
            'font-src'    : ['https://fonts.gstatic.com'],
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

app.add(( event ) => {
    event.send( '' );
});

app.listen( 80, () => {
    app.Loggur.log( 'Try opening http://localhost and checking the headers sent from the server!' );
});
~~~

- Apply the plugin with a lot of different commands later, as well as rebuilding
~~~javascript
const app = require( 'event_request' )();
app.apply( app.er_security, { csp : { xss: false } } );

app.add(( event ) => {

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
    event.$security.ect.setEnabled( true );

    // This will overwrite the previous build and set the new modified headers
    event.$security.build();

    event.send( '' );
});

app.listen( 80, () => {
    app.Loggur.log( 'Try opening http://localhost and checking the headers sent from the server!' );
});
~~~

***
***
***
