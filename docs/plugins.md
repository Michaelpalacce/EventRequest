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

**None**

***
#### Attached Functionality:

**event.session: Session**
- This is the main class that should be used to manipulate the user session.
- The session will automatically be created and either fetched or initialized depending if a cookie/header is passed and the session is found.
- There is no need to save the changes done to the session, that will be done automatically at the end of the request

***
#### The Session exports the following functions:

**init(): Promise: void**
- Fetches or creates a new session.
- This will be called automatically by the session plugin

**hasSession(): Promise: Boolean**
- Returns true if the user has a session started.

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

**getAll(): Object**
- Gets all values from the session

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
// Initiallizes a session
app.apply( app.er_session );

// Redirect to login if authenticated is not true
app.add( async ( event ) => {
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
- Adds a Rate limits plugin to the server.
- The rate limits plugin can monitor incoming requests and stop/delay/allow them if they are too many
- If you provide the same dataStore to two servers they should work without an issue
- If you don't provide a dataStore, then the er_data_server data store will be used. If that plugin is not set, then the default bucket one will be used
- **This Plugin can be re-applied multiple times with different configurations, however it may not be the best idea to do so.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**dataStore**
- The dataStore to use for the buckets
- Defaults to a Simple LeakyBucket datastore with no persistence

**rules**
- The rules will be validated.
- If options are passed and rules is invalid will default to:
~~~js
const DEFAULT_RULE						= {
	"path":"",
	"methods":[],
	"maxAmount":10000,
	"refillTime":10,
	"refillAmount":1000,
	"policy": CONNECTION_DELAY_POLICY,
	"delayTime": 3,
	"delayRetries": 5,
	"stopPropagation": false,
	"ipLimit": false
};
~~~
- Defaults to empty

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
- strict, permissive and connection_delay available
- If invalid, will be strict by default

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
