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
