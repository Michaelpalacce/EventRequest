# [Components:](#components)
- Components are parts of the server that can be used standalone or extended and replaced ( mostly )
- Any component can be retrieved from : event_request/server/components
- Extendable components are :
    - body_parsers => require( 'event_request/server/components/body_parsers/body_parser' )
    - caching => require( 'event_request/server/components/caching/data_server' )
    - error => require( 'event_request/server/components/error/error_handler' )
    - file_streams => require( 'event_request/server/components/file_streams/file_stream' )
    - rate_limiter => require( 'event_request/server/components/rate_limiter/bucket' )
    - mime_type => require( 'event_request/server/components/mime_type/mime_type' )

***
***
***

# [MimeType](#mime-type)
- Component used to fetch the mime type of files

#### Methods:

**findMimeType( extension: String, getFirst: Boolean = true ):String|Array**
- This will get the mime type of the given extension
- If nothing is found, return */*
- If getFirst is true, will return the (usually more common and only) first mime-type

**findExtension( mimeType: String ): null|String**
- This will get the extension given a mime type
- If nothing is found, return null

***
***
***


# [BodyParser](#body-parser)
- If you want to create a new BodyParser the new BodyParser must implement the functions described below

#### Accepted options

**NONE**

#### Functions

**supports( EventRequest event ): Boolean**
- This function will be called by the BodyParserHandler attached by the body parser plugin before the parser is actually called
- It must return a Boolean
- If a parser returns that it supports the given request, no further body parsers will be called

**parse( EventRequest event ): Promise: Object**
- Returns a promise
- This is called only if the body parser is supported.
- It must resolve with an object containing two parameters: { body : {}, rawBody: * }

#### Examples

- If you want to add a custom BodyParser you can do:

~~~javascript
const BodyParserPlugin = require( 'event_request/server/plugins/available_plugins/body_parser_plugin' );

class CustomBodyParser
{
    parse(){} // define logic

    supports(){} // define logic
}

// The CustomBodyParser is the class and the options are the end are the parameters to be passed to the class
// This is done because A new body parser will be created on each request
const plugin    = new BodyParserPlugin( CustomBodyParser, 'custom_body_parser', { optionOne: 123, optionTwo: 'value' } );
~~~

***
***
***

# [DataServer](#data-server)
- Is an EventEmitter
- Can be extended
- This Data Server can store around 8million keys

~~~javascript
const DataServer   = require( 'event_request/server/components/caching/data_server' );

console.log( DataServer );
console.log( new DataServer( options ) );
~~~

***
#### Accepted options

**ttl: Number**
- The time in seconds to be used as a default 'Time To Live' if none is specified.
- If ttl is set to -1 then the data will never expire
- Defaults to 300

**persistPath: String**
- The absolute path of the file that will persist data.
- Defaults to <PROJECT_ROOT>/cache

**persistInterval: Number**
- The time in seconds after which data will be persisted.
- Defaults to 100

**gcInterval: Number**
- The time in seconds after which data will be garbageCollected.
- Defaults to 60

**persist: Boolean**
- Flag that specifies whether the data should be persisted to disk.
- Defaults to false

The DataServer provides a set of methods that have to be implemented if you want to create your own Caching server to be
integrated with other plugins.

#### Events:

**_saveDataError( Error error )**
- Emitted in case of an error while saving data

**_saveData()**
- Emitted when the data has finished saving

**stop()**
- Emitted when the server is stopping


#### Functions:
**stop(): void**
- This will stop the connection of the DataServer
- It calls _stop()
- It emits a 'stop' event
- It clears all the intervals
- It removes all the listeners

**_stop(): void**
- This method is the protected method that should be implemented in case extension of the DataServer should be done
- Removes the cache file

**_configure: void**
- This method is a protected method that should be implemented in case extension of the DataServer should be done
- This method sets up any options that will be used in the data server
- This method sets up persistence, garbage collection, etc
- This is called as a last step in the constructor.

**_setUpPersistence(): void**
- This method is the protected method that should be implemented in case extension of the DataServer should be done
- It is called in _configure to create the cache file we will be using if persistence is enabled

**get( String key, Object options = {} ): Promise: Object|null**
- Retrieves the value given a key. Returns null if the key does not exist.
- This function is a 'public' method to be used by users.
- In the case that you want to implement your own DataServer, you should override **_get( String key )**

**_get( String key, Object options ): Promise: mixed|null**
- This method is the protected method that should be implemented in case extension of the DataServer should be done
- Removes the DataSet if it is expired, otherwise returns it. Returns null if the data is removed.
- No need to check if key is a String, that has been done in the _get method already.
- This method also sets the expiration of the DataSet to Infinity if it is null.
- This will return the value set by set()
- NOTE: Always check the data. Just because for example a number is set it is not a rule to return a number. Different Data Store handle this differently

**set( String key, mixed value, Number ttl = 0, Object options = {} ): Promise: Object|null**
- Returns the data if it was set, otherwise returns null
- Sets the given key with the given value.
- ttl is the time in **seconds** that the data will be kept.
- If ttl is -1 then the dataSet will NEVER expire
- If ttl is 0 then the Default TTL will be used.
- If ttl is > 0 then the value will be used
- Calls _set() after checking the arguments if they are valid

**_set( String key, mixed value, Number ttl, Object options ): Promise: Object|null**
- Implement for development. No need to do checks of the values of the parameter as that is done in the set() function
- This function commits the key/value to memory with all it's attributes
- If the dataSet existed, then a key 'isNew' must be set to true or false
- The options accept a Boolean flag persist that will override the global persist value. You can set a key to not be persisted.
  However if the global persist is set to false, this will not work
- Returns the data if it was set, otherwise returns null

**_makeDataSet( String key, mixed value, Number ttl, Boolean persist ): Object**
- Forms the dataSet object and returns it in the following format: `{ key, value, ttl, expirationDate, persist };`

**touch( String key, Number ttl = 0, Object options = {} ): Promise: Boolean**
- Returns a Boolean whether the data was successfully touched
- Returns a false if key is not String or ttl is not Number
- Calls _touch after checking if arguments are valid

**_touch( String key, Number ttl, Object options ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the touch() function
- Returns a Boolean whether the data was successfully touched
- If ttl = 0 then the dataSet will be updated with it's own ttl
- This function actually touches the data

**decrement( String key, Number value = 1, Object options = {} ): Promise: Number|null**
- If value is not a number, returns null
- If the data was not set correctly returns null
- If the data to decrement was not set correctly returns null
- If the data to decrement was not numeric returns null
- Calls _decrement() after checking for validity of data
- The ttl of the value will be extended by it's original ttl

**_decrement( String key, Number value, Object options ): Promise: Number|null**
- Implement for development. No need to do checks of the values of the parameter as that is done in the decrement() function
- Retrieves, decrements and then saves the new dataset
- If the operation is successfully done, returns the decremented value

**increment( String key, Number value = 1, Object options = {} ): Promise: Number|null**
- If value is not a number, returns null
- If the data was not set correctly returns null
- If the data to increment was not set correctly returns null
- If the data to increment was not numeric returns null
- Calls _increment() after checking for validity of data
- The ttl of the value will be extended by it's original ttl

**_increment( String key, Number value, Object options ): Promise: Number|null**
- Implement for development. No need to do checks of the values of the parameter as that is done in the increment() function
- Retrieves, increment and then saves the new dataset
- If the operation is successfully done, returns the incremented value

**delete( String key, Object options = {} ): Promise: Boolean**
- Deletes the given data
- WIll return false if arguments are invalid

**_delete( String key, Object options ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the delete() function
- This function deletes the actual data
- Will return true always

**lock( String key, Object options = {} ): Promise: Boolean**
- Acquires a lock given a key.
- This calls _lock

**_lock( String key, Object options ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the lock() function
- Acquires a lock given a key.
- This will return true only if there is no key like that in the DataServer, otherwise return false

**unlock( String key, Object options = {} ): Promise: Boolean**
- Releases a lock
- This calls _unlock

**_unlock( String key, Object options ): Promise: Boolean**
- Implement for development. No need to do checks of the values of the parameter as that is done in the unlock() function
- Releases a lock
- This returns true always

**_garbageCollect(): void**
- Prunes all the data from the server if needed
- Implement this if your Data Server needs it, otherwise leave it blank

**_saveData(): void**
- Persists all the data set to be persisted to disk
- Extra measures have been taken so this operation will not break if it is running fast, however if the persist interval is too low it still may cause an issue while saving
- This respects any data set with persist = false

**_loadData(): void**
- Loads all the data from disk

**_getExpirationDateFromTtl( Number ttl = -1 ): Number**
- Gets the the correct ttl according to the rules described in **set()**

**Used for development purposes:**

**length(): Number**
- Returns how many keys there are


***
***
***


# [DataServerMap](#data-server-map)
- Is an EventEmitter
- Can be extended
- Extends the DataServer
- Same as the default data server but uses a Map instead of an object
- It is recommended you use this one ( even tho it is not the default data server )
- This DataServer can store up to 16.7 million keys
- It can be extended to use a near infinite amount of keys if you set useBigMap to true
- Keep in mind when persisting millions of keys... is not fast

~~~javascript
const DataServerMap   = require( 'event_request/server/components/caching/data_server_map' );

console.log( DataServerMap );
console.log( new DataServerMap( options ) );
~~~

***
#### Accepted options

**ttl: Number**
- The time in seconds to be used as a default 'Time To Live' if none is specified.
- If ttl is set to -1 then the data will never expire
- Defaults to 300

**persistPath: String**
- The absolute path of the file that will persist data.
- Defaults to <PROJECT_ROOT>/cache

**persistInterval: Number**
- The time in seconds after which data will be persisted.
- Defaults to 100

**gcInterval: Number**
- The time in seconds after which data will be garbageCollected.
- Defaults to 60

**persist: Boolean**
- Flag that specifies whether the data should be persisted to disk.
- Defaults to false

**useBigMap: Boolean**
- Flag that specifies whether the data should be stored in a Map or a BigMap.
- Defaults to false

#### Events:

**_saveDataError( Error error )**
- Emitted in case of an error while saving data

**_saveData()**
- Emitted when the data has finished saving

**stop()**
- Emitted when the server is stopping


#### Functions:

**_stop(): void**
- Removes the cache file
- Flushes the Map

**_configure: void**
- This method sets up any options that will be used in the data server
- This method sets up persistence, garbage collection, etc
- This is called as a last step in the constructor.

**_setUpPersistence(): void**
- It is called in configure to create the cache file we will be using if persistence is enabled

**_get( String key, Object options ): Promise: mixed|null**
- Removes the DataSet if it is expired, otherwise returns it. Returns null if the data is removed.
- No need to check if key is a String, that has been done in the _get method already.
- This method also sets the expiration of the DataSet to Infinity if it is null.
- This will return the value set by set()

**_set( String key, mixed value, Number ttl, Object options ): Promise: Object|null**
- This function commits the key/value to memory with all it's attributes
- If the dataSet existed, then a key 'isNew' must be set to true or false
- The options accept a Boolean flag persist that will override the global persist value. You can set a key to not be persisted.
  However if the global persist is set to false, this will not work
- Returns the data if it was set, otherwise returns null

**_touch( String key, Number ttl, Object options ): Promise: Boolean**
- Returns a Boolean whether the data was successfully touched
- If ttl = 0 then the dataSet will be updated with it's own ttl
- This function actually touches the data

**_decrement( String key, Number value, Object options ): Promise: Number|null**
- Retrieves, decrements and then saves the new dataset
- If the operation is successfully done, returns the decremented value

**_increment( String key, Number value, Object options ): Promise: Number|null**
- Retrieves, increment and then saves the new dataset
- If the operation is successfully done, returns the incremented value

**_delete( String key, Object options ): Promise: Boolean**
- This function deletes the actual data
- Will return true always

**_lock( String key, Object options ): Promise: Boolean**
- Acquires a lock given a key.
- This will return true only if there is no key like that in the DataServer, otherwise return false

**_unlock( String key, Object options ): Promise: Boolean**
- Releases a lock
- This returns true always

**_garbageCollect(): void**
- Prunes all the data from the server if needed
- Implement this if your Data Server needs it, otherwise leave it blank

**_saveData(): void**
- Persists all the data set to be persisted to disk
- Extra measures have been taken so this operation will not break if it is running fast, however if the persist interval is too low it still may cause an issue while saving
- This respects any data set with persist = false

**_loadData(): void**
- Loads all the data from disk

**Used for development purposes:**

**length(): Number**
- Returns how many keys there are


***
***
***
# [BigMap](#big-map)
- An implementation of the normal Map API
- This one can store a near infinite amounts of data
- It has the exact same usage as the normal Map and can be pretty much used as a replacement
- It will create a new Map every 14,000,000 keys.
- The internal limit can be changed by doing `map._limit = {LIMIT};`

***
***
***

# [Templating Engine](#templating-engine)
- By default the er_templating_engine plugin comes with a templating engine that just fetches the file and returns is as is
- No extra configurations are needed to use that.
- There is an experimental version of another templating engine that supports variables, loops and other logic inside it
- The ExperimentalTemplatingEngine has some XSS protection as well.

#### How to apply:
~~~javascript
const app = App();
const TemplatingEngine = require( 'event_request/server/components/templating_engine/experimental_templating_engine' );
const templatingEngine = new TemplatingEngine();

app.apply( app.er_templating_engine, { templateDir: '.', render: templatingEngine.renderFile.bind( templatingEngine ) } );

app.get( '/', ( event ) => {
    const variables	= { test: 'TEST!!', hello: 'HELLO WORLD!!'};

    // You need to have a file called test.html in the main directory for this setup to work
    event.render( 'test', variables ).catch( event.next ); // If this fails, this will be automatically handled by the framework
});

app.listen( 80 );
~~~

#### Syntax

1. Raw JS syntax: You can use `<?js />` and write any piece of JS code you want. This will not be displayed by the user, but you can do variable assignment here, loops, instantiate objects, etc.
- This will display `Hello World!` 5 times
~~~html
<?js for(let i=0;i<5;i++){ />
    Hello World!
<?js } />
~~~
- Switch Statement:
~~~html
<?js switch( test ){ case '1': />
    <%test1%>
<?js break; case '2': />
    <% test %>
<?js break; } />

OR

<?js switch( test ){
        case '1': />
            <%test1%>
<?js        break;
        case '2': />
            <% test %>
<?js        break;
 } />
~~~

2. Rendering variables
- Any variables you've passed can be rendered using: `<% variableName %>` syntax
- Note: any variables you create inside the template can also be rendered using this syntax.
- For safety reasons, variables rendered this way are subject to XSS filtering done by the engine

#### What is not supported:
- COMMENTS. HTML comments of template syntax is NOT going to work as expected!
- INCLUDES. Including other templates is currently NOT supported

#### How to use:
- After you've applied the templating engine, you can call the render function like:
~~~javascript
app.get( '/', ( event ) => {
    const variables	= { test: 'TEST!!', hello: 'HELLO WORLD!!'};

    // You need to have a file called test.html in the main directory for this setup to work
    event.render( 'test', variables ).catch( event.next ); // If this fails, this will be automatically handled by the framework
});
~~~
- The variables passed can be access from anywhere in the template using: `<% test %>` or <% hello %>

#### Using as a separate component
- You could use the Engine as a separate component by requiring it:

~~~javascript
const TemplatingEngine = require( 'event_request/server/components/templating_engine/experimental_templating_engine' );
~~~
- The engine exposes the following methods:

**async renderFile( String templateLocation, Object variables ): Promise: String**
- This will read a file and parse it.
- The templateLocation must be the absolute path to the file
- The variables is an object with keys and values. Key -> the key to access in the template, Value -> what will be rendered

**async render( String html, Object variables ): String**
- Same as renderFile but this is the already fetched template

***
***
***

# [LeakyBucket](#leaky-bucket)
This class can be used to limit data in one way or another.

***
#### Accepted constructor arguments:

**refillAmount: Number**
- How many tokens to refill after the refillTime
- Defaults to 100

**refillTime: Number**
- How long after we should refill in seconds
- If 1 is passed and 2 seconds pass, we will refill refillAmount * 2
- Defaults to 60

**maxAmount: Number**
- The max amount of tokens to be kept
- Defaults to 1000

**prefix: String**
- Prefix that the data will be stored under in the DataStore provided
- Defaults to $LB:

**key: String|null**
- The current key that the bucket is stored under
- If this is provided the bucket settings will be retrieved from the dataStore using this key without adding a prefix or generating a new one
- Defaults to null ( generate a random 64 chars key and add a prefix )

**dataStore: DataServer**
- Instance of a DataServer to use for storage
- By default uses the in memory one with persistency set to false and ttl set to: this.maxAmount / this.refillAmount * this.refillTime * 2

**dataStoreRefetchInterval: Number**
- Milliseconds after which a retry should be sent to the dataStore ( usually should be set to 1 or 2, set to more if the dataStore cannot handle a lot of traffic )
- Used to set the maxCounter using the following formula: Math.min( Math.floor( 10000 / dataStoreRefetchInterval ), 1000 )
- Defaults to 1

***
#### The class has the following functions:

**async init(): Bucket**
- This has to be called before using the class

**async reset(): void**
- Resets the tokens to full

**async get(): Number**
- Returns the currently available tokens

**async reduce( tokens = 1 ): Boolean**
- How many tokens should be taken.
- This function returns Boolean whether there were enough tokens to be reduced or not

**async isFull(): Boolean**
- This function returns Boolean whether the bucket is full

#### Example:

~~~javascript
     const LeakyBucket = require( 'event_request/server/components/rate_limiter/bucket' );
~~~

***
***
***
