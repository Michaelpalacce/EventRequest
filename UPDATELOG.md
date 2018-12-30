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
