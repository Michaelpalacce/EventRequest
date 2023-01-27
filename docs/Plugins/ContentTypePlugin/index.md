# Content Type Plugin ( WIP )

# [er_content_type](#er_content_type)
- Attaches methods for handling content-type header based on concrete content-type that you can supply or inferred from a file extension
- Attaches a default handler for adding the default content-type header if none are set when sending. Defaults to application/json
- **This Plugin can be re-applied multiple times with different configurations.**

***
#### Dependencies:

**NONE**

***
#### Accepted Options:

**defaultContentType: String**
- The default content-type to be added in case no other are added
- If not provided, `application/json` will be used

***
#### Events:

**NONE**

***
#### EventRequest Attached Functions

**contentType( contentType: string, charset: string = "UTF-8" ): void**
- Adds a header with the given concrete contentType
- By default the charset will be "UTF-8"
- Format is : `${contentType}; charset=${charset}`

**contentTypeFromFileName( fileName: string, charset: string = "UTF-8" ): void**
- Adds a content-type header based on the filename ( uses the MimeType component )
- By default the charset will be "UTF-8"
- Format is : `${contentType}; charset=${charset}`

***
#### Attached Functionality:

**NONE**

***
#### Exported Plugin Functions:

**NONE**

***
#### Example:

Attach the content type plugin using defaults
~~~javascript
const App = require( 'event_request' );
const app = App();

app.apply( app.er_content_type )

app.get('/',(event) => {
    // Send JSON response, without setting the content-type header, it will set application/json by default
    event.send({key: 123});
});

app.listen( 80, () => {
    app.Loggur.log( 'Try opening http://localhost' )
});
~~~

Attach the content type plugin with custom default
~~~javascript
const App = require( 'event_request' );
const app = App();

app.apply( app.er_content_type, {
    defaultContentType: "text/plain"
} )

app.get('/',(event) => {
    event.send({key: 123});
});

app.listen( 80, () => {
    app.Loggur.log( 'Try opening http://localhost' )
});
~~~
