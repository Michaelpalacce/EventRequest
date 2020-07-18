23.0.0
- Major Global Middlewares rework
- Added New test for this rework
- Rewrote the documentation
- Added A Dynamic Middleware for the rate limits plugin
- Made the ipLimit and stopPropagation in the rules optional
- Added a new useFile option for the rate limits plugin. By default it is false
- The plugins attached to the server are now the actual instances instead of just the strings
- The getPlugin and hasPlugin now support passing in PluginInterface directly

22.1.2
- General code cleanup
- General Documentation cleanup

22.1.1
- Small documentation fix

22.1.0
- Added extra tests
- Made the file stream handler an object and not a class
- Removed unnecessary logic
- Fixed an issue with the headers where they may not be retrieved correctly. Now they should be truly case insensitive
- Added an option to the session to be header based
- Tested the new header session

22.0.0
- Small Documentation improvements
- Added router block caching. This caches the execution block of the request and in case of the same path the same parameters will be applied as well as the same block will be returned. This should result in faster requests and nothing else. 
- Added documentation about router caching
- Added extra package keywords to reflect new functionality
- Converted all params to JSDoc @params
- Renamed the event.js to event_request.js
- Renamed the getHeaders in the event request to getRequestHeaders
- Added CORS support -> er_cors plugin

21.0.0
- Updated the documentation
- The validationHandler in the event is now called just validation
- The Validation Handler is no longer a class. It is now an object with one function: validate
- Fixed an issue with the validation where it would throw in case of a deep validation and the structure not being set in the value to be validated

20.0.0
- Added tests for rate limiting with params to confirm it works as expected
- Reworked the validation to now be able to validate arrays
- Reworked validation to be able to do "deep" assertion in multi dimensional objects
- Renamed the rules and default to $rules and $default in the validation
- Added VALIDATION_ERRORS to ValidationAttribute class

19.0.0
- Changed the name of header methods to better reflect where the headers are being sent, added tests
- The Rate limiting rules can now be set inline as well as in a json file, added tests
- The Rate limiting plugin will no longer store the buckets but create a new bucket every time. Should no longer take memory
- The leaky bucket has been updated where it will not try to set the key if the key is passed
- Fixed a small bug with the leaky bucket

18.3.0
- Changed the way that loggur passes data so it's no longer his job to verify the arguments of the log function.
- Documentation arguments changes for my sake
- Changed the rate limits plugin rules key that was attached to erRateLimitRules

18.2.0
- Code cleanup for the router route adding
- Small changes to validation. The type of the input will be changed to the appropriate type now
- Some documentation improvements

18.1.0
- Fixed the way strict behaves in the body parser so now it will only affect the content length and not the actual maxPayload
- Added a fallback body parser that will parse everything and return it as a string
- Added a new plugin er_body_parser_raw

18.0.0
- Major breaking version. The way the server is created has changed. This was done to simplify the whole procedure. The Server retrieved from the module can now be used to create separate web servers. 
- Added a new export App that can be used to fetch the singleton instance of the web server
- Updated the documentation

17.2.1
- Updated the documentation so that routing is easier to find for people and is moved up

17.2.0
- Added rawBody when parsing json and form data. In the case of multipart data raw body will be set but will always be equal to {}
- Added documentation about this new change
- Updated the documentation and added plugin URLS

17.1.0
- Main focus of this release is to remove dependencies in case where custom logic wants to be added to some classes.
- Added x-powered-by
- Removed the BodyParser as a parent to all BodyParsers. Now the BodyParserHandler uses duck-typing to determine if it is correct
- The ErrorHandler no longer needs to be the correct class when setting in the EventRequest. Now uses duck-typing
- The FileStreams no longer need to extend FileStream to work. Now uses duck-typing
- Small Rework to the templating engine plugin that should not affect anything

17.0.0
- Renamed er_cache_server to er_data_server
- Updated DataServer handleServer error and added tests for it
- DataServer refactored to accept options everywhere in case of specific options needed for some DataServers
- Added more DataServer tests
- Rate limits plugin now takes the er_data_server data server if present
- Fixed documentation
- DataServer.get will now return ONLY the value
- DataServer.increment and DataServer.decrement now return true and false instead of objects

16.2.2
- Added repository urls to package.json

16.2.1
- Added more tests for the security section
- Fixed an issues with the expect-ct with the way it was being formatted

16.2.0
- Added more types to the text file stream
- Added removeHeader to the eventRequest and tested it
- Added Security Plugin
- Tested Security Plugin
- Documented Security Plugin
- Templating engine plugin now sets the header as text/html
- Static resources plugin now correctly sets the content-type
- Fixed Static resources plugin always adding public as a static path

16.1.2
- Router matchRoute and matchMethod are now also exported in the router instance
- next is no longer cleared up on cleanUp

16.1.1
- Data Server with a default ttl of -1 will now save data with infinity too

16.1.0
- Added router merging on routes
- Tests added for new functionality and documentation updated
- Loggers and Loggur now support a third parameter in the log function and a second in the magic error,debug, etc called isRaw
- Router RegExp results will now be added to the event.params.match
- Added bucket stability improvements

16.0.0
- DataServer now returns if key is newly set or overwritten 
- DataServer increment and decrement are now done with a single operation nothing async within them
- Leaky bucket now uses a DataStore by default it will create an in memory data store using the data server
- EventRequest will now only send an error for async errors if the response is not finished
- The rate limits plugin now works with the new leaky bucket and can also work in a cluster. Just use the same data store

15.1.0
- Added DataServer increment and decrement
- Renamed _isFull to isFull in the Leaky Bucket

15.0.0
- Improved Tester documentation
- Added Tester cli arguments
- Router speed improvements
- Removed the Development suite. Any functionality can be required from the directory structure
- Added More documentation 

14.0.1
- Error handler fixes

14.0.0
- Templating engine plugin no longer sets the response as raw so it can be cached
- send will emit with a payload if the response is a string regardless if it is raw or not
- If the handler is async, in case of an error it will be caught now.
- Added more tests

13.7.0
- Fix for the save to be done when the stream has ended in the DataServer
- Updated logging documentation
- Data Server is now an EventEmitter
- Improvements to Data Server to be able to be extended easier
- The tester now accepts --filter= as a cli argument
- The tester now says if filtering
- Added Router tests
- Added some DataServer assertions

13.6.3
- The data_server will now first save data to a tmp file and then overwrite the cache file

13.6.2
- Fixed a typo

13.6.1
- Removed dot from file streams

13.6.0
- Updated README
- Added AudioFileStream

13.5.6
- Added more file streams files ( video and text )
- Changed the video type to video and not mp4
- Updated README

13.5.5
- Fixed the Session to remove the cookie on removeSession
- Fixed the setCookie method to modify expires and max-age options to date

13.5.4
- Updated the documentation for validation

13.5.3
- Changed the way the env plugin sets the variables so it's more synchronous
- Changed the name of the test_script.js to just test.js

13.5.2
- Multipart Data Parser now unlinks only when needed
- Added CleanUpItemsInMS for the multipart data parser
- Added Logging in case of failed deletion of files for multipart data parser

13.5.1
- Reduced Package size
- Linux tests fixed
- RateLimit fix if config is invalid
- Added more multipart data parser tests
- Multipart Data Parser now uses the line end provided by the request.

13.5.0
- Updated so the setCookie will work correctly now.
- Added more tests
- The sendError now sends all the arguments to the error handler
- Updated documentation on eventRequest functions 

13.4.1
- Tests fix for linux

13.4.0
- Added Body Parser Plugins tests
- Added Header tests
- Fixed Body Parser tests
- Fixed JSON Body Parser to now stop if strict
- Fixed Form Body Parser to now stop if strict
- Fixed a bug with the multipart body parser error handling

13.3.0
- Updated documentation for plugins
- RateLimiter now emmits rateLimited with rule and policy
- MultipartBodyParsers sets $files instead of files in the body now

13.2.1
- Fixed documentation
- Added logger plugin tests
- Fixed File Log Transport on error for the file stream

13.2.0
- Added File stream tests
- Fixed an error where calling event.next twice will break the app... this should have been fixed a while ago
- Headers are now always lowercased when getting, setting, searching

13.1.0
- Added some more tests
- Renamed start to listen and moved it to the Instance rather than the singleton object to keep it the same as the http.createServer().listen method

13.0.0
- Updated the way the server will be attached 
- Added some er_rate_limiter tests that will prevent the bug that happened in 12.4.0 to occur 
- Added more server tests
- Started drastically improving the documentation
- Render now returns a promise
- Static resources plugin now accepts a string
- The EventRequest no longer emits the response on send if the response was raw
- Added ResponseCache plugin server tests
- Small ResponseCachePlugin improvements

12.4.1
- Bugfix for rate_limiter_plugin

12.4.0
- Added more server tests
- Renamed the session makeNewSessionId to _makeNewSessionId
- Removed the sessionId from Session.removeSession()
- Updated the documentation about er_session and the Session class
- Fixed a bug with the dataServer persist ( the default persist was always set to true, now looks at the given persist setting )

12.3.0
- Added more server tests
- Made it possible to add handlers directly using app.add or router.add
- Updated README

12.2.0
- Added more server tests
- Added some documentation
- Fixed the Leaky bucket where it was refilling for twice less the time 

12.1.0
- Made sure all the possible methods in the server and the router that don't return something else will return either the server or the router instance
- Added Tests for the http methods for both the server and the router
- Added Tests for the Router plugin that it attaches the methods
- Made the DataServer write the cache file synchronously instead of a write stream.
- Removed the resolve method in the Server
- Added Server Functionality tests

12.0.0
- Removed the generator completely
- Renamed getHeaderValue to getHeader
- Made most of the EventRequest variables writable again, expanded the cleanUp to include them
- Updated the documentation on the Plugins and the Loggers as well as some other minor improvements
- Removed LOG_LEVELS from the exported modules
- Updated FileStreamHandler plugin now has a new function and the old one is slightly modified.
- Updated all the file stream handlers to accept an event rather than have it set in the constructor
- Updated the README.md for the file stream plugin and the templating engine plugin
- Changed when the render event is emitted
- Changed when the stream_start event is emitted
- Added Memory Data Server Plugin Tests

11.1.0
- Added cache.request middleware when attaching er_response_cache

11.0.1
- Body Parser Plugin bugfix

11.0.0
- Added a pluginBag to the server where plugins may persist data
- Reworked the BodyParsers to use Promises
- The Body parser plugins are now more or less connected by using only a single BodyParserHandler and only one of them adds a middleware
- Removed default json and form body parsers
- Removed the BodyParserHandler suite entirely 
- Refactored the Body Parser plugin to work with only one specific parser

10.5.0
- The DataServer now does operations async.
- The ResponseCache.cacheCurrentRequest is now async
- The SessionPlugin.initSession is now async
- Most Session functions are now async
- The Logger now has the LOG_LEVELS attached to it

10.4.0
- DataServer delete now checks if key is string and calls a _delete method. Also returns Boolean
- DataServer touch now checks if key is string and ttl is a number and calls a _touch method. Also returns Boolean
- Updated README.md accordingly

10.3.5
- Removed the generator from the README as it does not work currently.

10.3.3
- Removed console.log

10.3.3
- Fix that will prevent the session to be saved if it was not initialized

10.3.2
- Added the Chat App as an example Project

10.3.1
- Added Travis Build Image

10.3.0
- Renamed some Bucket functions, Bucket has been exported as LeakyBucket
- Added Error tests
- Added Unique Id tests
- Added LeakyBucket tests
- Added Default Templating Engine tests
- Fixed some other tests
- The ErrorHandler now has a default code of 500

10.2.1
- Small Documentation fix
- Fix of the caching plugin

10.2.0
- Added DataServer tests
- Added Caching documentation
- Fixed the DataServer class by adding a few checks and implemented a stop() functionality
- Fixed the DataServer class's intervals
- Improved the MemoryDataPlugin and the way it is implemented to better facilitate specifying a DataServer as store

10.1.2
- Added EventRequest tests
- Added Server tests
- Fixed getHeaderValue
- Added Server.cleanUp()
- Updated README.md
- Added Empty Test Folders for future tests
- Started working on the DataServer tests
- Added deploy script
- Tester now exits with not a 1 in case of error
- Tester now exits with 1 in case of error
- DataServer will not die in case of invalid cache data

10.1.1
- Added Middleware tests

10.1.0
- Added Route middlewares
- Added all the plugins in the PluginManager to the server
- Improvements to the TemplatingEnginePlugin to not throw an error with empty options ( now accepts default templates path to /public )
- Updates to the default generated script

10.0.3
- Fixed all the tests
- Added a few new tests
- Small changes to the setCookie function in event_request, now does not allow empty value or key 
- Fixed an issue with the logger plugin to show the user-agent correctly

10.0.2
- Small fix to DefaultTemplatingEngine

10.0.1
- Introduced a DefaultTemplatingEngine

10.0.0
- BREAKING RELEASE.
- Reworked how the server is started

9.2.9
- Added Ability to set defaults to the validations
- Updated README.md accordingly

9.2.8
- Added more RESTFUL methods

9.2.7
- The server now accepts String as port if it can be typecast to Number

9.2.6
- Fixed event request not returning 404 in case of an route not found.
- Fixed EventRequest.send to not die in case of null or undefined
- Added new options to the server ( ability to specify host )

9.2.5
- Fixed a commit where the FormBodyParser was mistakenly replaced

9.2.4
- Fixed an issue with sending an empty body and passing JSON. Also set the strict flag to true.

9.2.3
- Fixed an error with the send. Now calling send without any parameters will return an empty response
- Fixed an error with the validation result where it wouldn't be JSON.stringified cause of the way it is formed
- Updated documentation a bit. 
- Added assert to the Testing suite as stated in the documentation

9.2.2
- Updated the Logger to be more extensive ( log more )

9.2.1
- Added Server project as an example

9.2.0
- Reworked DataServer a bit to be more extendable ( moved configuration/setup in a private method instead of constructor )
- Added setLogLevel to Logger and Loggur for easier changing of Log Level
- process.dumpStack and process.log will now use Loggur to log

9.1.6
- Added ability to give max age to the cookies as well as a domain
- Updated documentation for the setCookie

9.1.5
- Fixed validator

9.1.4
- Added HEAD to the router
- Fixed generator a bit

9.1.3
- Added link in readme to GitHub

9.1.2
- Improved error handling on templating engine
- Improved error handling when sending a response
- Exported FileStream from Development
- Added new function to FileStream's getType that returns the type of stream they are

9.1.1
- Fixed the rate limits plugin to now be attached VIA the getPluginMiddleware. This way you can attach the static resources BEFORE
 you attach the rate limiter. This way you can decide not to rate limit your statics even if you have site wide rate limiting rules.
 - Bucket is now exported. This way you can do your own Rate limiter with RegExp for example.
 - Testing has been moved to Development

9.1.0
- Fixes to the Multipart uploader so that it will delete the files after a second of two AFTER the request has finished to prevent race conditions when uploading a LOT of files
- Fixed to logger to log at a later date

9.0.1
- Now 404 have the correct status code

9.0.0
- Fixed to work with latest NODEJS version

8.1.0
- Fixed the memory caching. 
- Fixed the session 
- Fixed the Response cache
- Added improvements to the data server

8.0.0
- Completely reworked the in-memory caching server
- Removed the Memory caching server completely 
- A LOT OF PLUGINS CHANGED. RELEASE IS NOT STABLE
- DOCUMENTATION IS MISSING.
- TESTS ARE MISSING

7.0.0
- Rate Limit Reworked to use Leaky Bucket Strategy
- Rate Limiting tests have not been written yet.
- Now you can use setStatusCode and be sure that sending will not overwrite it UNLESS u specifically point a different status code then

6.6.3
- Fixed some tests

6.6.2
- Fixed the logger a bit by adding more information
- Reverted the mp4 file stream

6.6.1
- Small mp4 file improvements
- Documentation fixes
- Added better isFinished detection

6.6.0
- Added new getAll functionality for the DataServerModel

6.5.2
- Now DataModels are cached
- Improvements

6.4.1
- Removed forgotten log

6.4.0
- Fixed Validations, now they show better, fixed bug in them
- New, now you can set an entry in the in memoryData to never expire, which is dangerous but can be done

6.2.1 
- Added a project generator
- Now router doesn't need to be updated

5.1.1
- Bugfix: The env plugin now loads synchronously

5.1.0
- Added rules to the rate limits plugin and improved some old tests. Fixed some small bugs with the session
- Updated the README with the new and some missing documentation

5.0.0
- Fix so the default logger will have a higher Log level
- Fix so by default the console created in case of no transports in the logger will have the same log level and logLevels as the Logger
- Added Log.getStackTrace() that returns a string with a sanitized stack trace for debugging
- Modified the logger plugin to modify the process global object by adding dumpStack() and log functions
- Added rate limits Plugin 
- Added tests for rate limits plugin
- Added new in memory plugin
- Added tests for the in memory plugin and the in memory server
- Data servers can now create MODELS that provide helpful functions and can be used instead of using the data server directly
- Added tests for the DataModels
- Can now set the data server to use in the memory_data_server_plugin with the use
- Updated README

4.2.3 
- You can now choose to disable all the pre-installed plugins
- Added new tests to the server as well as tests to test the applyPlugins functionality.
- Updated readme with the new functionality
- Fix a bug in the env_plugin_test
- Added new way to add routes. get,post,put,delete
- Refactored README to be more consistent and easier to understand. Added missing documentation as well
- setStatusCode added as a function in the EventRequest

4.2.2 
- Updated the README

4.2.1
- Added the file system watcher on the .env file
- Old environment variables will be removed when the event is triggered

4.2.0
- Major fixes to the memory data server
- Added Linux support

4.1.0
- Added new .env processor plugin that will load variables from a .env file to the process.env. This is done only when the plugin is first attached to the server
- Added tests for the environment processor plugin
- If the .env file changes then the environment will be loaded once MORE into the process.env the plugin will detect any changes ( planned for a future version )

4.0.0
- Removed security module
- Created new session plugin that will actually have a session and a session only, not worry about security. Security will be removed
- Added Session module tests
- Session Module can now be used to implement security, but own logic must be used
- Added ability to apply plugin options when applying the plugin to the server via a second argument
- no longer emitting error event in eventRequest on sendError, now emitting on_error
- Improved error return consistency from the memory data server
- Improved the tester to display a BIT more info on silent like how many tests are being ran and how long it took to finish

3.3.1
- Fix with the preinstalled plugins

3.3.0
- Improved on the headers functionality

3.2.0
- Fully tested the response cache
- Added ability to cache by IP and to set expiration of the response cached in memory.
- Fixed the routing and the way requests are matched. Now no longer will there be Objects that are returned. Instead Booleans are returned
- Fixed Routing tests that got affected by this change and security components.

3.1.2
- Fix to the memory data server plugin where it did not return the correct information. Test fixed as well

3.1.1
- Removed error

3.1.0
- Big improvements to the memory data server. Improved functionality of it
- Introduced SERVER_STATES to the Data servers
- Improved the plugin application in the server, now you can get applied plugins for cross plugin interactions.
- Memory Data Cache plugin now accepts callback for start and stop of the server and also returns better info
- Added response cache plugin, ( BETA )
- Preloaded plugin ids have changed

3.0.1
- Bug fix to the next function. Now no need to be bound 

3.0.0
- Changed the way the server is created. Now it is exported as a callback that creates the server

2.0.0
- Moved the file streaming functionality to a plugin, functionality removed from the eventRequest naturally 
- Updated the Loggur and Logger to have the log function accept a second level argument instead of passing an object. Passing an object is now deprecated
- Added examples to the README
- The Plugin manager is now located in the server and is not extracted by default
- Added Many tests of functionality that was not tested before
- Refactored the way that logging is done. Now you don't pass an object in the log
- The ErrorLogger is no longer something that can be set
- Moved the logger to a plugin
- Moved the body parsers to a plugin

1.14.0
- Plugin improvements. Plugins now have access to the server and can attach to events emitted by the server to fine tune any request
- Removed the render from the event request, moved functionality to a templating engine plugin

1.13.0
- Added Plugin dependencies. Now when adding a plugin if not all dependencies are present, then the application will throw an exception
- Removed the Caching Server from the server
- Moved the Memory Caching server to a plugin
- Moved the Session to a Plugin
- Pre-loaded the Memory Caching server
- Pre-loaded the SessionPlugin
- Added tests for the memory data_server_plugin and session_plugin
- Fixed the MemoryDataClient to respond when being created

1.12.0
- Removed the Clusters away from the main server. The clustering will reworked and will be exported as a module that you can use if you so desire but will not be 100% mandatory
- Moved the server functionality away from the index.js
- Moved the routing to ./server/component/routing instead of ./server
- Fixed the Caching in case of them not working when trying to set up 2 now should be fine

1.11.1
- Added static resources plugin as well as tested it. Functionality is the same as in the middleware container where it
was removed from, but the headers are set correctly.
- Added the plugin to the plugin manager
- Moved the preloading of plugins away from the index.js

1.11.0
- New Plugin Interface Functionality
- The tester will no longer throw an error by default, also removed the error throwing from the test_script callback
- Moved components to different folders for readability 
- Added PluginManager to hold all available plugins
- Removed the timeout middleware, moved to a plugin
- Added Timeout Plugin Tests
- Added Plugin Manager Tests

1.10.2 
- Error from npm version increment

1.10.1
- Added Validation Result tests
- Reverted so the other test suites will be called
- Fixed Validation Result hasValidationFailed method to return correctly

1.10.0
- Fixed Validation Attributes to actually return negative  in case of no error. Thank you tests
- Added Validation Attribute tests
- Modification to Validation Results, they will not return an array anymore but a validation result.
    The array can still be extracted by doing validationResult.getValidationResult and using hasValidationFailed
    will check if the validation has failed.
- Version incremented to 1.10.0 because of big bug fix

1.9.0
- Separated test into test suites
- Renamed the testing_suite to test_helper
- Added test_bootstrap
- Validation Rule tests added
- Added dataProviders to the tester

1.8.10:
- Fixed Templating engine bug

1.8.9:

- Keywords Updated
- Documentation Updated
- Validation changed to return a negative in case there is no error.
- Removed an unnecessary "options" step in setting a templatingEngine via the
	middlewareContainer

1.8.8:

- Fixed the templating engine middleware

1.8.7:

 - Fixed an issue with the File Logging, where it would die immediately
