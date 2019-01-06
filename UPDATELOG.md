3.0.1
- Bug fix to the next function. Now no need to be binded 

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
