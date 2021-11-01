
# [Validation](#validation-suite)
The validation is done by using:

~~~javascript
const app = require( 'event_request' )();

app.get( '/', ( event ) => {
    const objectToValidate = { username: 'user@test.com', password: 'pass' };

    // Validation shorthand
    // Password will not fit the range
    const resultOne    = event.validate(
        objectToValidate,
        {
            username: 'filled||string||email||max:255',
            password: 'filled||string||range:6-255'
        }
    );

    // You can also do validation like this
    // Password will fit the range
    const resultTwo    = event.validation.validate(
        objectToValidate,
        {
            username: 'filled||string||email||max:255',
            password: 'filled||string||range:1-255'
        }
    );

    event.send({
        resultOne    : {
            hasValidationFailed    : resultOne.hasValidationFailed(),
            validationResult    : resultOne.getValidationResult()
        },
        resultTwo    : {
            hasValidationFailed    : resultTwo.hasValidationFailed(),
            validationResult    : resultTwo.getValidationResult()
        }
    });
});

app.listen( 80, () => {
    app.Loggur.log( 'Try hitting http://localhost')
});
~~~

- You can also fetch the ValidationHandler and do validation using it anywhere:

~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

const result = validationHandler.validate(
    {
        key: 'value'
    },
    {
        key: 'string||range:1-10'
    }
);

console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );
~~~

- skeleton must have the keys that are to be validated that point to a string of rules separated by ||

- if the object to be validated is multi dimensional then you can specify the multi dimensional keys as well ( see example below )
- if the object to be validated contains an array of object you have to specify an array for the given key and provide only ONE Object that will be used to validate all the arrays( see example below )

- Asserting that an input is a string|numeric|boolean will do type conversion on the input to the appropriate type. You should retrieve the value FROM the validation result for correct result

***
#### Possible rules are:

**optional**
- if set as long as the input is empty it will always be valid. if not empty other possible rules will be called

**filled**
- checks if the input is filled

**array**
- checks if the input is an array

**notArray**
- checks if the input is not an array

**string**
- checks if the input is a string.
- Will convert a number to a string

**weakString**
- checks if the input is a string
- will not do value conversion

**notString**
- checks if the input is NOT a string

**range**
- Is followed by min and max aka: range:1-2 where 1 is the minimum and 2 maximum.
- If the type is numeric then it will check if it's within the range.
- If the type is a string then the length will be checked
- If the type is an array then the array length will be checked

**min**
- minimum input length aka: min:10
- Same rules about types apply as in **range**

**max**
- maximum input length aka: max:50
- Same rules about types apply as in **range**

**email**
- checks if the input is a valid email

**isTrue**
- checks if the input evaluates to true
- 1 will be asserted as true, true will be asserted as true, 'true' and '1' will also be asserted as true
- The value will be converted to a boolean

**weakIsTrue**
- checks if the input equals to true ( boolean )
- will not do value conversion

**isFalse**
- checks if the input evaluates to false
- 0 will be asserted as false, false will be asserted as false, 'false' and '0' will also be asserted as false
- The value will be converted to a boolean

**weakIsFalse**
- checks if the input equals to false ( boolean )
- will not do value conversion

**boolean**
- checks if the input is a boolean
- The value will be converted to a boolean
- Applies the same rules as **isFalse** and **isTrue**

**weakBoolean**
- checks if the input is a boolean
- will not do value conversion

**notBoolean**
- checks if the input is not a boolean

**numeric**
- checks if the input is a number.
- This will convert the input to a Number if possible

**weakNumeric**
- checks if the input is numeric
- will not do value conversion

**notNumeric**
- checks if the input is not a number

**date**
- checks if the input is a date

**same**
- checks if the input is the same as another input aka: same:emailInput

**different**
- checks if the input is different from another input aka: different:emailInput

**equals**
- checks if the input equals another given string: equals:makeSureToEqualToThis

#### Note: in case of an error the exact rule/s that failed will be returned, furthermore if the rules passed were malformed a special "rules" error will be returned for the field/s

When validation is done a ValidationResult is returned. It has 2 methods:
getValidationResult that in case of a validation error will return an object with the fields tested mapped to the errors found.
Otherwise it will be an object with the fields tested mapped to the values
hasValidationFailed that returns a boolean whether there is an error

~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

const body = {
    username: 'test@example.com',
    password: 'test',
    customerNumber: 30,
    address : {
        street: 'Test str',
        number:'64',
        numberTwo: 64 // THIS WILL NOT FAIL
        // numberTwo: '64' // THIS WILL FAIL since it is weakNumeric
    }
}

const bodyWhereEverythingFails = {
    username: 123,
    password: true,
    customerNumber: 'x'.repeat( 33 ),
    address : {
        street: 123,
        number:'wrong',
        numberTwo: '64'
    },
    extra: true
}

const skeleton    = {
    username : 'filled||string||email||range:6-32',
    password : 'filled||string',
    customerNumber: 'numeric||max:32',
    address: { street: 'string', number: 'numeric', numberTwo: 'weakNumeric' },
    extra : { $rules: 'optional||string', $default: 'def' }
};

const result = validationHandler.validate( body, skeleton );

const resultWithFails = validationHandler.validate( bodyWhereEverythingFails, skeleton );

console.log( 'Validiation passes:' );
console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );
console.log( '=============================' );

console.log( 'Validation fails:' );
console.log( resultWithFails.hasValidationFailed() );
console.log( resultWithFails.getValidationResult() );

// If errors were found hasValidationFailed would return true and getValidationResult will have a map
// of which input failed for whatever reason. Otherwise getValidationResult will return an object :
// { 'username':'username', 'password': 'password', 'customerNumber': 16, address: { street: 'street', number: 64, numberTwo: 62 }, extra: 'def' }
~~~

The example will validate that the username is filled is a string and is within a range of 6-32 characters
It will also validate that the password is filled and is a string
The customerNumber will be validated to be numeric that is lower than 32
The address will be asserted to be an object and the keys in it will be validated
The extra if not passed will default to 'def'

***
#### Validation defaults

- Validation results can also have defaults set.
- This is done by instead of passing a string of rules to the skeleton keys, an object is passed with two values: $rules and $default
- The $rules must be optional otherwise validation will fail
- In case where the parameters have NOT been passed, the default value will be used.
~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

//IF no values are provided then the defaults will be taken
const body = {};
const result = validationHandler.validate(
    body,
    {
        username : { $rules: 'optional||string', $default: 'root' },
        password : { $rules: 'optional||string', $default: 'toor' }
    }
);

console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );

//IF the values do exist then they will be validated
const bodyTwo = { username: 'u', password: 'p' };
const resultTwo = validationHandler.validate(
    bodyTwo,
    {
        username : { $rules: 'optional||string||min:5', $default: 'root' },
        password : { $rules: 'optional||string||min:5', $default: 'toor' }
    }
);

console.log( resultTwo.hasValidationFailed() );
console.log( resultTwo.getValidationResult() );
~~~


~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

const dataToValidate = {
    testOne : 123,
    testTwo : '123',
    123 : [1,2,3,4,5],
    testThree : {
        'deepOne' : 123,
        deepTwo : {
            deeperOne : 123,
            deeperTwo : '123',
            deeperFour : '4'
        },
        deepThree : [
            {
                deepThreeOne: 'stringOne',
                deepThreeTwo: '1542'
            },
            {
                deepThreeOne: 'stringOne',
                deepThreeTwo: 1542
            }
        ]
    },
    testFour: true,
    testFive: 'true',
    testSix : '1'
};

const result    = validationHandler.validate(
    dataToValidate,
    {
        testOne        : 'string||range:2-4',
        testTwo        : 'numeric||range:123-124',
        123            : 'array||range:4-6',
        testThree    : {
            deepOne    : 'numeric||range:122-124',
            deepTwo    : {
                deeperOne    : 'string||range:2-4',
                deeperTwo    : 'numeric||range:123-124',
                deeperThree    : { $rules: 'optional||min:2||max:5', $default: 4 },
                deeperFour    : { $rules: 'optional||numeric||min:2||max:5', $default: 4 }
            },

            deepThree : [
                {
                    deepThreeOne: 'string',
                    deepThreeTwo: 'numeric'
                }
            ]
        },
        testFour    : 'boolean',
        testFive    : 'boolean',
        testSix        : 'boolean',
        testSeven    : { $rules: 'optional||min:2||max:5', $default: 4 }
    }
);
console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );

// false

// {
//   '123': [ 1, 2, 3, 4, 5 ],
//   testOne: '123',
//   testTwo: 123,
//   testThree: {
//     deepOne: 123,
//     deepTwo: { deeperOne: '123', deeperTwo: 123, deeperThree: 4, deeperFour: 4 },
//     deepThree : [
//     {
//         deepThreeOne: 'stringOne',
//         deepThreeTwo: 1542
//     },
//     {
//         deepThreeOne: 'stringOne',
//         deepThreeTwo: 1542
//     }
//     ]
//   },
//   testFour: true,
//   testFive: true,
//   testSix: true,
//   testSeven: 4
// }
~~~

- Really deep validations
~~~javascript
const validationHandler = require( 'event_request/server/components/validation/validation_handler' )

const dataToValidate    = {
    testOne    : 123,
    testTwo    : '123',
    123            : [1,2,3,4,5],
    testThree    : {
        'deepOne'    : 123,
        deepTwo    : {
            deeperOne    : 123,
            deeperTwo    : '123',
            deeperFour    : '4'
        },
        deepThree : [
            {
                deepThreeOne: 'stringOne',
                deepThreeTwo: '1542'
            },
            {
                deepThreeOne: 'stringOne',
                deepThreeTwo: 'string'
            }
        ]
    },
    testFour    : true,
    testFive    : 'true',
    testSix        : '1',
    testNine    : {
        weakString    : 'weakString',
        weakBoolean    : true,
        weakNumeric    : 123,
        weakIsTrue    : true,
        weakIsFalse    : false,
    }
};

const result    = validationHandler.validate(
    dataToValidate,
    {
        testOne        : 'string||range:2-4',
        testTwo        : 'numeric||range:123-124',
        123            : 'array||range:4-6',
        testThree    : {
            deepOne    : 'numeric||range:122-124',
            deepTwo    : {
                deeperOne    : 'string||range:2-4',
                deeperTwo    : 'numeric||range:123-124',
                deeperThree    : { $rules: 'optional||min:2||max:5', $default: 4 },
                deeperFour    : { $rules: 'optional||numeric||min:2||max:5', $default: 4 },
                deepThree : [
                    {
                         deepThreeOne: 'string',
                         deepThreeTwo: 'numeric'
                    }
                ]
            }
        },
        testFour    : 'boolean',
        testFive    : 'boolean',
        testSix        : 'boolean',
        testSeven    : { $rules: 'optional||min:2||max:5', $default: 4 },
        testEight    : 'numeric',
        testNine    : {
            weakString    : 'weakString',
            weakBoolean    : 'weakBoolean',
            weakNumeric    : 'weakNumeric',
            weakIsTrue    : 'weakIsTrue',
            weakIsFalse    : 'weakIsFalse',
            deep    : {
                deeper    : {
                    deepest: 'string'
                }
            }
        }
    }
);
console.log( result.hasValidationFailed() );
console.log( result.getValidationResult() );

// true
//{ testThree: { deepThree: { 1:{ deepThreeTwo: [ 'numeric' ] } } },testEight: [ 'numeric' ], testNine: { deep: { deeper: deepest: ['string'] } } }
~~~

***
***
***
