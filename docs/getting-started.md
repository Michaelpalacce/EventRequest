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