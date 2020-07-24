'use strict';

const { Mock, Mocker, assert, test, helpers }	= require( '../../../test_helper' );
const BodyParserHandler							= require( '../../../../server/components/body_parsers/body_parser_handler' );
const JsonBodyParser							= require( '../../../../server/components/body_parsers/json_body_parser' );
const RawBodyParser								= require( '../../../../server/components/body_parsers/raw_body_parser' );

test({
	message	: 'BodyParserHandler.constructor does not throw with valid arguments',
	test	: ( done ) => {
		assert.doesNotThrow(() => {
			new BodyParserHandler();
		});
		done();
	}
});

test({
	message	: 'BodyParserHandler.addParser does not throw with valid parser',
	test	: ( done ) => {
		assert.doesNotThrow(() => {
			const bodyParserHandler	= new BodyParserHandler();

			const bodyParser		= {
				parse		: () => {},
				supports	: () => {}
			};

			bodyParserHandler.addParser( bodyParser );
		});
		done();
	}
});

test({
	message	: 'BodyParserHandler.addParser throws with invalid parser',
	test	: ( done ) => {
		assert.throws(() => {
			const bodyParserHandler	= new BodyParserHandler();

			bodyParserHandler.addParser( {} );
		});
		done();
	}
});

test({
	message	: 'BodyParserHandler.parseBody if no parsers support it',
	test	: ( done ) => {
		assert.doesNotThrow(() => {
			const MockBodyParser	= Mock( RawBodyParser );
			const fallbackParser	= new MockBodyParser();
			const testBody			= 'Test';

			fallbackParser._mock({
				method			: 'supports',
				shouldReturn	: true
			});

			fallbackParser._mock({
				method			: 'parse',
				shouldReturn	: () => {
					return new Promise(( resolve, reject ) => {
						resolve( testBody );
					})
				}
			});

			const bodyParserHandler				= new BodyParserHandler();
			bodyParserHandler.fallbackParser	= fallbackParser;

			bodyParserHandler.parseBody( helpers.getEventRequest() ).then(( parsedData ) => {
				assert.deepStrictEqual( parsedData, testBody );
				done();
			});
		});
	}
});

test({
	message	: 'BodyParserHandler.parseBody calls BodyParser parse if supported',
	test	: ( done ) => {
		const MockBodyParser	= Mock( JsonBodyParser );
		const testBody			= 'Test';
		Mocker( MockBodyParser, {
			method			: 'supports',
			shouldReturn	: true
		} );
		Mocker( MockBodyParser, {
			method			: 'parse',
			shouldReturn	: () => {
				return new Promise(( resolve, reject ) => {
					resolve( testBody );
				})
			}
		} );
		const event				= helpers.getEventRequest();
		const bodyParserHandler	= new BodyParserHandler();

		bodyParserHandler.addParser( new MockBodyParser() );
		bodyParserHandler.parseBody( event ).then(( data ) => {
			assert.equal( data, testBody );
			done();
		}).catch( done );
	}
});

test({
	message	: 'BodyParserHandler.parseBody does not parse if not supports and does not return an error',
	test	: ( done ) => {
		const MockBodyParser	= Mock( JsonBodyParser );
		const MockRawBodyParser	= Mock( RawBodyParser );
		const fallbackParser	= new MockRawBodyParser();

		Mocker( MockBodyParser, {
			method			: 'supports',
			shouldReturn	: false
		} );

		Mocker( MockBodyParser, {
			method	: 'parse',
			called	: 0
		} );

		fallbackParser._mock({
			method			: 'supports',
			shouldReturn	: true
		});

		fallbackParser._mock({
			method			: 'parse',
			shouldReturn	: () => {
				return new Promise(( resolve, reject ) => {
					resolve( { body: {}, rawBody: {} } );
				})
			}
		});

		const event							= helpers.getEventRequest();
		const bodyParserHandler				= new BodyParserHandler();
		bodyParserHandler.fallbackParser	= fallbackParser;

		bodyParserHandler.addParser( new MockBodyParser() );
		bodyParserHandler.parseBody( event ).then(( data ) => {
			assert.deepStrictEqual( { body: {}, rawBody: {} }, data );
			done();
		}).catch( done );
	}
});

test({
	message	: 'BodyParserHandler.parseBody calls only the first one that supports it',
	test	: ( done ) => {
		const MockBodyParser	= Mock( JsonBodyParser );
		const MockBodyParserTwo	= Mock( JsonBodyParser );
		const testBody			= 'Test';
		Mocker( MockBodyParserTwo, {
			method			: 'supports',
			shouldReturn	: true
		} );

		Mocker( MockBodyParserTwo, {
			method	: 'parse',
			called	: 0
		} );

		Mocker( MockBodyParser, {
			method			: 'supports',
			shouldReturn	: true
		} );

		Mocker( MockBodyParser, {
			method			: 'parse',
			shouldReturn	: ( event, callback ) => {
				return new Promise(( resolve ) => {
					resolve( testBody)
				});
			}
		} );

		const event				= helpers.getEventRequest();
		const bodyParserHandler	= new BodyParserHandler();

		bodyParserHandler.addParser( new MockBodyParser() );
		bodyParserHandler.addParser( new MockBodyParserTwo() );
		bodyParserHandler.parseBody( event ).then(( body ) => {
			assert.equal( body, testBody );
			done();
		}).catch( done );
	}
});

test({
	message	: 'BodyParserHandler.parseBody returns an error in case of an error in the body parser',
	test	: ( done ) => {
		const MockBodyParser	= Mock( JsonBodyParser );
		const error			= 'Not supported';
		Mocker( MockBodyParser, {
			method			: 'supports',
			shouldReturn	: true
		} );

		Mocker( MockBodyParser, {
			method			: 'parse',
			shouldReturn	: ( event, callback ) => {
				return new Promise(( resolve, reject ) => {
					reject( error )
				});
			}
		} );

		const event				= helpers.getEventRequest();
		const bodyParserHandler	= new BodyParserHandler();

		bodyParserHandler.addParser( new MockBodyParser() );
		bodyParserHandler.parseBody( event ).then(() => {
			done( 'Should have rejected!' );
		}).catch( ( err ) => {
			assert.equal( err, error );
			done();
		} );
	}
});
