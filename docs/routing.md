
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
