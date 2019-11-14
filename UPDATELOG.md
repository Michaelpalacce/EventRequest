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
