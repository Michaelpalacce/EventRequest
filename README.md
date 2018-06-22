# EventRequest
A backend server in NodeJs
Includes:
- Body parsers 
1) Form Body Parser
2) Multipart Body Parser 
3) Json Body Parser
- Cookie parser
- Session security
- File streams
- Templating engine
- Easy Routing
- Middlewares
- Logging
1) Console
2) File
- Static Routes
- Request timeout
- Error handling
- Caching ( in memory )
- Input Validation


# Server Options

The server is exported from the main module:

> const { Server } = require( 'event_request' )

The server constructor accepts the following options:

**protocol** - String - The protocol to be used ( http || https ) -> Defaults to http

**httpsOptions** - Object - Options that will be given to the https webserver -> Defaults to {}

**port** - Number - The port to run the webserver/s on -> Defaults to 3000

**clusters** - Number - The amount of instances of the webserver to be started. Cannot be more than the machine's CPUs -> Defaults to the max amount of CPUs of the machine's

**communicationManager**- CommunicationManager - The communication manager to be used for the IPC communication between the master and the workers -> Defaults to base CommunicationManager

**errorHandler** - ErrorHandler - The error handler to be called when an error occurs inside of the EventRequest -> Defaults to base errorHandler

## The server is started by calling server.start();

***
The server has 2 ways of adding routes/middleware

When adding a Route the **server.add(route)** can be used

route accepts 3 parameters:
* handler - Function - The callback function ! Required
* route - String|RegExp - The route to match - optional if omitted the handler will be called on every request
* method - String|Array - The method(s) to be matched for the route - optional if omitted the handler will be called on every request as long as the route matches


***

Middlewares can be added by **server.use('middlewareName', middlewareOptions)**

Available middleware:
* logger -> Sets up the logger
* * Accepted options:
* * - logger - Logger - which must be provided in order for the logger to be added and must be an instance of Logger

* setFileStream

* templatingEngine -> Sets the templating engine
* * Accepted options:
* * - engine - TemplatingEngine - the templating engine to be used. Must be an instance of TemplatingEngine defaults to BaseTemplatingEngine
* * - options - Object - the options to be passed to the engine

* session -> Adds one or many SecurityManager descendants 
* * Accepted options:
* * - sessionName - String - the session name ( aka cookie name ) - Defaults to sid
* * - authenticationRoute - String - The route on which authentication should happen ! Required
* * - tokenExpiration - Number - The Time to keep the tokens before they expire - Defaults to 0 which is forever
* * - authenticationCallback - Function - The callback to be called when authentication has to happen. This callback must return a boolean - Defaults to ()=>{ return false; };
* * - managers - Array - The managers to be added to the security ( they have 2 parameters : instance which must be an instance of SecurityManager and options which are options to be passed to that specific manager only - Defaults to { instance : AuthenticationManager }, { instance : SessionAuthenticationManager }, { instance : LoginManager }, { instance : SessionSaveManager } if default is passed to the array

* bodyParser -> Adds one or many BodyParser descendants 
* * Accepted options:
* * - parsers - Array - Array of BodyParser descendants. If the array has a key default these parsers will be added:  { instance : FormBodyParser }, { instance : MultipartFormParser }, { instance : JsonBodyParser }

* parseCookies -> Parses cookies and saves them to event.cookies

* addStaticPath -> adds static resource path
* * Accepted options:
* * - path - String - The path to make available 

* timeout -> Adds a timeout to the request
* * Accepted options:
* * - timeout - Number - the time after which the request should timeout



# Logging

The Loggur can be accessed by directly from the server { Loggur }

The Loggur can be used to create Loggers which accept the following options:
* **serverName** - String - The name of the server to be concatenated with the uniqueId - Defaults to empty
* **transports** - Array - Array of the transports to be added to the logger - Defaults to empty
* **logLevel** - Number - The log severity level -> Defaults to error
*  **logLevels** - Object - JSON object with all the log severity levels and their values All added log levels will be attached to the instance of the logger class -> Defaults to LOG_LEVELS
* **capture** - Boolean - Whether to attach event listeners for process.on uncaughtException and unhandledRejection - Defaults to true
* **dieOnCapture** - Boolean - If the process should exit in case of a caught exception -> Defaults to true
* **unhandledExceptionLevel** - Number - What level should the unhandled exceptions be logged at -> Defaults to error

Loggers can be added to the main instance of the Loggur who later can be used by: Loggur.log and will call all added Loggers

Each Logger can have it's own transport layers.
There are 2 predefined transport layers:
* **Console** 
* * Accepted options:
* * - color - Boolean - Whether the log should be colored -> Defaults to true
* * - logColors - Object - The colors to use -> Defaults to 
* * * [LOG_LEVELS.error]	: 'red',
* * * [LOG_LEVELS.warning]	: 'yellow',
* * * [LOG_LEVELS.notice]	: 'green',
* * * [LOG_LEVELS.info]		: 'blue',
* * * [LOG_LEVELS.verbose]	: 'cyan',
* * * [LOG_LEVELS.debug]	: 'white'

* **File**
* * Accepted options:
* * - filePath - String - the location of the file to log to -> if it is not provided the transport will not log


### Default log levels:
	error	: 100,
	warning	: 200,
	notice	: 300,
	info	: 400,
	verbose	: 500,
	debug	: 600

When logging an object can be passed that accepts 2 options: level, message. Alternatively a string can be passed which will be interpreted as an error

# Validation

The validation is done by using the event.validationHandler.validate( objectToValidate, skeleton )

skeleton must have the keys that are to be validated that point to a string of rules separated by ||

## Possible rules are:

* rules - if malformed rules string is passed
* optional - if set as long as the input is empty it will always be valid. if not empty other possible rules will be called
* filled - checks if the input is filled
* string - checks if the input is a string
* notString - checks if the input is NOT a string
* range - Is followed by min and max aka: range:1-2 where 1 is the minimum and 2 maximum.
* min - minimum input length
* max - maximum input length
* email - checks if the input is a valid email
* isTrue - checks if the input evaluates to true
* isFalse - checks if the input evaluates to false
* boolean - checks if the input is a boolean
* notBoolean - checks if the input is not a boolean 
* numeric - checks if the input is a number
* notNumeric  - checks if the input is not a number
* date  - checks if the input is a date
* same  - checks if the input is the same as another input aka: same:emailInput
* different  - checks if the input is different from anotehr input aka: different:emailInput
* equals  - checks if the input equals another given string: equals:makeSureToEqualToThis

If any errors occurr they will be returned as an array of keys eg: ['string','min','max','range','filled'] 
