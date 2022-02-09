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
