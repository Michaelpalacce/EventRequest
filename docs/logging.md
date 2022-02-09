
# [Logging](#logging)

- Logging is done by using the Loggur class mainly.
- The Loggur can create different loggers who can have different transports
- For example you can have an access logger with a file transport and another error logger with console transport,
  calling Loggur.log you will call both of the loggers.
- You should configure these loggers per project.
- If you need finer control then you can always use the loggers created by the Loggur.
- The Loggur and any Logger class are hot swappable in regards to the log function.


The `Logging` Suite exported by the module contains the following:
- Loggur -> instance of Loggur used to log data and create Loggers. Generally this class can be used to log data
- Logger -> The Logger class. Every logger can be attached to the Loggur, which will call all the loggers
- Transport -> The interface used by the loggers
- Console -> Transport that logs to the console
- File -> Transport that logs to a file
- Log -> The Log object used by all the internal classes
- LOG_LEVELS -> The Default log levels
- The Loggur can be accessed directly from the server { Loggur }

## Disabling Logging:
- If you want to disable Logging done by the framework you can do:
~~~javascript
const { Loggur } = require( 'event_request' );

Loggur.disableDefault();
~~~

- Alternatively to disable logging you can add a middleware that removes all listeners:
~~~javascript
app.add( ( event ) => {
   event.removeAllListeners('error')
   event.removeAllListeners('on_error')
   event.next();
});
~~~

## Default Logger:
- The default logger is attached directly to the Loggur instance. it can be enabled or disabled by calling Loggur.enableDefault() or Loggur.disableDefault().
- The default Logger has a log level of `300` and logs up until level `600` which is the debug level.

## Retrieving the Loggur from the framework instance
- You can also retrieve the Loggur directly form the framework instance by doing `app().Loggur`

~~~javascript
const app = require( 'event_request' )();

app.Loggur.log( 'TEST' );
~~~

***
***
***

## [Loggur:](#loggur)
- Loggur used to create, store and use different loggers
- Every logger added to the Loggur will be called when doing Loggur.log
- Loggur.log returns a promise which will be resolved when the logging is complete

#### Functions:
**enableDefault(): void**
- Enables the default logger

**disableDefault(): void**
- Disables the default logger

**addLogger( String loggerId, Logger|Object logger ): void**
- This function adds a logger to the Loggur
- You can pass a Logger instance or an object of logger options
- Passing logger options will attempt to create a new Logger

**getDefaultLogger(): void**
- Gets the default Logger

**log( Log||String||mixed log, Number level, Boolean isRaw ): Promise**
- log determines what should be logged
- The level is the log level that we should log at. This is optional. Defaults to the default logLevel of the logger
- The isRaw flag determines whether we should attempt to log the data raw. Only specific transport types support raw. Defaults to false

~~~javascript
    Loggur.log( 'Log' ); // This logs by default to an error level
    Loggur.log( 'Log', LOG_LEVELS.debug ); // LOG_LEVELS.debug === Number, this will log 'Log' with debug level
    Loggur.log( { test: 'value' }, LOG_LEVELS.debug, true ); // This will log on debug and will try to log the data raw
~~~

**setLogLevel( Number level ): void**
- Sets the Loggur default log level

**createLogger( Object options ): Logger**
- You can create a new logger by calling Loggur.createLogger({});
- The newly created logger can be attached to the Loggur instance by calling Loggur.addLogger( 'loggerId', logger );

***
- If you want to change the log level of a logger it can easily be done with .setLogLevel( logLevel )
~~~javascript
logger.setLogLevel( 600 );
~~~

***
- If you want to change the log level of all the loggers attached to Loggur it can easily be done with .setLogLevel( logLevel )
~~~javascript
Loggur.setLogLevel( 600 ); // will change the logLevel of all loggers attached
~~~

Loggers can be added to the main instance of the Loggur who later can be used by: Loggur.log, which will call all the loggers added to it
~~~javascript
const { Loggur, Console, LOG_LEVELS } = require( 'event_request' ).Logging;

const logger = Loggur.createLogger({
    transports : [
        new Console( { logLevel : LOG_LEVELS.notice } ),
    ]
});

Loggur.addLogger( 'logger_id', logger );

console.log( typeof Loggur.loggers['logger_id'] !== 'undefined' );
~~~

***
***
***

## [Logger:](#logger)
- Logger class that can be configured for specific logging purposes like access logs or error logs
- First parameter of the constructor is the options which can be used to configure the logger and the second is the logger Id which must be a string, otherwise an error `app.er.logger.invalidUniqueId` will be thrown
- Each Logger can have it's own transport layers.
- Every transport layer has his set of processors that change the data to be logged ( timestamp is beautified, colors are added, data is sanitized )
- Every transport layer has one formatter that changes the format of the data to be logged ( plain text, json )
- Every transport layer can choose if they support or do not support the log
- Every transport layer will be called when calling logger.log
- Logger.log returns a promise which will be resolved when the logging is complete

#### Accepted options
**serverName: String**
- The name of the server to be concatenated with the uniqueId
- Defaults to empty

**transports: Array**
- Array of the transports to be added to the logger
- Defaults to empty

**logLevel: Number**
- The log level lower than which everything will be logged
- This will also be the default logLevel for the logger
- Example: if the logLevel is set to LOG_LEVELS.info then info, notice, warning and error will be logged, but verbose and debug will not
- The higher a log level is the less sever it is
- Defaults to LOG_LEVELS.info

**logLevels: Object**
- JSON object with all the log severity levels and their values. All added log levels will be attached to the instance of the logger class
- The logger will be able to log ONLY on these log levels
- If you have log levels: 100 and 200 and you try with a log level of 50 or a 300 it won't log
- Defaults to LOG_LEVELS

**capture: Boolean**
- Whether to attach event listeners for process.on uncaughtException and unhandledRejection
- Defaults to false

**dieOnCapture: Boolean**
- If the process should exit in case of a caught exception
- Defaults to true

**unhandledExceptionLevel: Number**
- What level should the unhandled exceptions be logged at
- Defaults to error

#### Functions:

**constructor( Object options = {}, String uniqueId = null )**
- Available options can be checked in the section above.
- If uniqueId is not a string or is not passed, then an error will be thrown

**log( Log||String||mixed log, Number level, Boolean isRaw ): Promise**
- log determines what should be logged
- The level is the log level that we should log at. This is optional. Defaults to the default logLevel of the logger
- The isRaw flag determines whether we should attempt to log the data raw. Only specific transport types support raw. Defaults to false

~~~javascript
    logger.log( 'Log' ); // This logs by default to an error level
    logger.log( 'Log', LOG_LEVELS.debug ); // LOG_LEVELS.debug === Number, this will log 'Log' with debug level
    logger.log( { test: 'value' }, LOG_LEVELS.debug, true ); // This will log on debug and will try to log the data raw
~~~

**error(): Promise** || **notice(): Promise ||** **warning(): Promise** || ...
- Every logger attaches all the log levels as functions that accept log and isRaw as arguments
- The level will be determined by the function being called
- All the rules that apply to log apply to these too

~~~javascript
    logger.error( 'Log' ); // This logs by default to an error level
    logger.debug( 'Log', true ); // This will log on debug and will try to log the data raw
~~~

**setLogLevel( Number level ): void**
- Sets the logger default log level
- Each logger attaches itself to the unhandledRejection and uncaughtException of the process
- It is recomended you have a single logger that handles these and the others should be set not to capture

**addTransport( Transport transport ): Boolean**
- Adds a new transport to the logger ( console/file )

**supports( Log log ): true**
- Returns true or false if the log is supported by the logger ( determined by the log level )

**getUniqueId(): String**
- Returns a unique id to be set in the log

***
***
***

## [Transports](#logging-transports)
- Transports are object whose job is to transport the data to the given medium ( console, file, other )
- They should check if the log is supported
- They have multiple processors that modify the way the data is presented
- They have one formatter that changes the format of the data to be logged: it could be a json format or plain text
- There are 2 Transports currently.
- Every Transport has all the available processors and formatters attached to it. Check the section on Processors and Formatters for more info


### [Console](#console)
- Logs data in the console
- It can log raw logs

***
#### Accepted options:

**logLevel: Number**
- The log level lower than which everything will be logged
- This will also be the default logLevel for the logger
- Example: if the logLevel is set to LOG_LEVELS.info then info, notice, warning and error will be logged, but verbose and debug will not
- The higher a log level is the less sever it is
- Defaults to LOG_LEVELS.info

**logLevels: Array**
- JSON object with all the log severity levels and their values All added log levels will be attached to the instance of the logger class
- The logger will be able to log ONLY on these log levels
- If you have log levels: 100 and 200 and you try with a log level of 50 or a 300 it won't log
- Defaults to LOG_LEVELS

**processors: Array**
- Holds The processors that the log will be passed through before it is formatted and logged
- It must be an Array, otherwise the defaults are taken
- Defaults to [Console.processors.time(), Console.processors.stack(), Console.processors.color()]

**formatter: Function**
- Holds the formatter that is going to be called after the processors are done with the log context
- Must be a function, otherwise the default is taken
- Defaults to Console.formatters.plain()

### [File](#file)
- Logs data to a file
- It can't log raw logs

***
#### Accepted options:

**logLevel: Number**
- The log level lower than which everything will be logged
- This will also be the default logLevel for the logger
- Example: if the logLevel is set to LOG_LEVELS.info then info, notice, warning and error will be logged, but verbose and debug will not
- The higher a log level is the less sever it is
- Defaults to LOG_LEVELS.info

**logLevels: Array**
- JSON object with all the log severity levels and their values All added log levels will be attached to the instance of the logger class
- The logger will be able to log ONLY on these log levels
- If you have log levels: 100 and 200 and you try with a log level of 50 or a 300 it won't log
- Defaults to LOG_LEVELS

**filePath: String**
- The location of the file to log to.
- Accepts Absolute and relative paths
- If it is not provided the transport will not log

**processors: Array**
- Holds The processors that the log will be passed through before it is formatted and logged
- It must be an Array, otherwise the defaults are taken
- Defaults to [File.processors.time(), File.processors.stack()]

**formatter: Function**
- Holds the formatter that is going to be called after the processors are done with the log context
- Must be a function, otherwise the default is taken
- Defaults to Console.formatters.plain()

~~~javascript
const { Loggur, LOG_LEVELS, Console, File } = require( 'event_request' ).Logging;

// Create a custom Logger
const logger = Loggur.createLogger({
    serverName : 'Test', // The name of the logger
    logLevel : LOG_LEVELS.debug, // The logLevel for which the logger should be fired
    capture : false, // Do not capture thrown errors
    transports : [
        new Console( { logLevel : LOG_LEVELS.notice } ), // Console logger that logs everything below notice
        new File({ // File logger
            logLevel : LOG_LEVELS.notice, // Logs everything below notice
            filePath : '/logs/access.log', // Log to this place ( this is calculated from the root folder ( where index.js is )
            logLevels : { notice : LOG_LEVELS.notice } // The Log levels that this logger can only log to ( it will only log if the message to be logged is AT notice level, combining this with the er_logger plugin that logs all request paths to a notice level, you have a nice access log. Alternatively you can log to notice yourself )
        }),
        new File({
            logLevel : LOG_LEVELS.error,
            filePath : '/logs/error_log.log'
        }),
        new File({
            logLevel : LOG_LEVELS.debug,
            filePath : '/logs/debug_log.log'
        })
    ]
});

Loggur.addLogger( 'serverLogger', logger );

console.log( typeof Loggur.loggers['serverLogger'] !== 'undefined' );
~~~

***
## [Processors](#processors)
- Processors are responsible for changing the log data
- They are called in the beginning of the logging process, followed by the formatters and after that the data is shipped by the transporters
- They are attached to the Transport, Console and File classes directly: `Console.processors`, `Transport.processors`, `File.processors`

### [Available Processors](#available-processprs)

#### [Color](#color-processor)
- Processor responsible for coloring the log message
- It can be configured to log with different colors
- Usage: `Transport.processor.color( { logColors } )`, `Console.processor.color( { logColors } )`, `File.processor.color( { logColors } )`

#### Accepted Options:

**logColors: Object**
- An object containing logLevels mapped to colors
- It is ideal if the logLevels are the same as the ones passed in the Transporter, or data may not be collored correctly
- Defaults to:
~~~
{
 [LOG_LEVELS.error] : 'red',
 [LOG_LEVELS.warning] : 'yellow',
 [LOG_LEVELS.notice] : 'green',
 [LOG_LEVELS.info] : 'blue',
 [LOG_LEVELS.verbose] : 'cyan',
 [LOG_LEVELS.debug] : 'white'
}
~~~

***
#### [New Line](#new-line-processor)
- Processor responsible for changing all the EOLs to the system EOL
- Is this needed? No. Does it hurt? No. Did I implement it and wonder why I implemented it? Yes. Does that bother me? No.
- Usage: `Transport.processor.line()`, `Console.processor.line()`, `File.processor.line()`

#### Accepted Options:

**NONE**

***
#### [Stack](#stack-processor)
- Processor that will check if the message is an instance of Error and save the stack as the message
- Usage: `Transport.processor.stack()`, `Console.processor.stack()`, `File.processor.stack()`

#### Accepted Options:

**NONE**

***
#### [Timestamp](#timestamp-processor)
- Processor that will change the timestamp of the log to a human readable string: 08/03/20, 14:37:40 (mm/dd/yy h : m : s)
- Usage: `Transport.processor.time()`, `Console.processor.time()`, `File.processor.time()`

#### Accepted Options:

**NONE**

***
## [Formatters](#formatters)
- Formatters are responsible for changing how the data is represented
- They are called after the processors have done processing the data
- They are attached to the Transport, Console and File classes directly: `Console.formatters`, `Transport.formatters`, `File.formatters`

### [Available Formatters](#available-formatters)

#### [Plain](#plain-formatter)
- Formatter that will format the data in a non standard way: `Default/Master - 08/03/20, 14:37:40 : Test message`
- Usage: `Transport.formatters.plain()`, `Console.formatters.plain()`, `File.formatters.plain()`

#### Accepted Options:

**noRaw**
- This will signal the formatter to ignore the isRaw flag in the logs ( usefull when logging to file for example )
- Defaults to false

***
#### [Json](#json-formatter)
- Formatter that will format the data in a json format
- Usage: `Transport.formatters.json()`, `Console.formatters.json()`, `File.formatters.json()`

#### Accepted Options:

**replacer: function**
- You can provide a custom json replacer

***
***
***
#### Examples:

~~~javascript
const { Loggur, LOG_LEVELS, Console, File } = require( 'event_request' ).Logging;

const logColors = {
    [LOG_LEVELS.error] : 'red',
    [LOG_LEVELS.warning] : 'yellow',
    [LOG_LEVELS.notice] : 'green',
    [LOG_LEVELS.info] : 'blue',
    [LOG_LEVELS.verbose] : 'cyan',
    [LOG_LEVELS.debug]  : 'white'
};

// Create a custom Logger
const logger = Loggur.createLogger({
    transports : [
        new Console({ 
            logLevel : LOG_LEVELS.notice,
            processors : [Console.processors.color( { logColors } ), File.processors.time()]
        }),
        new File({
            logLevel : LOG_LEVELS.error,
            filePath : '/logs/error_log.log',
            processors : [File.processors.color( { logColors } ), File.processors.line(), File.processors.line()],
            formatter : File.formatters.json()
        }),
    ]
});

Loggur.addLogger( 'serverLogger', logger );

console.log( Loggur.loggers['serverLogger'] );
~~~

## [Log Levels](#log-levles)
- error   : 100,
- warning : 200,
- notice  : 300,
- info    : 400,
- verbose : 500,
- debug   : 600

***
***
***
