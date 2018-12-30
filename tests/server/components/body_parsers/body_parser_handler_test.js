'use strict';

const { Mock, Mocker, assert, test, helpers }	= require( '../../../test_helper' );
const {
	BodyParserHandler,
	BodyParser,
	MultipartFormParser,
	JsonBodyParser,
	FormBodyParser
}												= require( '../../../../server/components/body_parsers/body_parser_handler' );

test({
	message	: 'BodyParserHandler.constructor on defaults throws because EventRequest is invalid',
	test	: ( done )=>{
		assert.throws(()=>{
			new BodyParserHandler();
		});

		done();
	}
});

test({
	message	: 'BodyParserHandler.constructor does not throw with valid arguments',
	test	: ( done )=>{
		assert.doesNotThrow(()=>{
			new BodyParserHandler( helpers.getEventRequest() );
		});
		done();
	}
});

test({
	message	: 'BodyParserHandler.constructor sets default parsers if they are not set',
	test	: ( done )=>{
		let bodyParserHandler	= new BodyParserHandler( helpers.getEventRequest() );
		let expectedParsers		= [];
		expectedParsers.push( FormBodyParser.getInstance() );
		expectedParsers.push( MultipartFormParser.getInstance() );
		expectedParsers.push( JsonBodyParser.getInstance() );

		assert.deepStrictEqual( bodyParserHandler.parsers, expectedParsers );

		done();
	}
});

test({
	message	: 'BodyParserHandler.constructor does not set default parsers if any others are passed',
	test	: ( done )=>{
		let parsers				= [{ instance: JsonBodyParser, options : {} }];
		let bodyParserHandler	= new BodyParserHandler( helpers.getEventRequest(), { parsers } );
		let expectedParsers		= [];
		expectedParsers.push( JsonBodyParser.getInstance( {} ) );

		assert.deepStrictEqual( bodyParserHandler.parsers, expectedParsers );

		done();
	}
});

test({
	message	: 'BodyParserHandler.constructor sets defaults if default is passed as an array key',
	test	: ( done )=>{
		let parsers				= [{ instance: JsonBodyParser, options : {} }, 'default'];
		let bodyParserHandler	= new BodyParserHandler( helpers.getEventRequest(), { parsers } );
		let expectedParsers		= [];
		expectedParsers.push( JsonBodyParser.getInstance( {} ) );
		expectedParsers.push( FormBodyParser.getInstance() );
		expectedParsers.push( MultipartFormParser.getInstance() );
		expectedParsers.push( JsonBodyParser.getInstance() );

		assert.deepStrictEqual( bodyParserHandler.parsers, expectedParsers );

		done();
	}
});

test({
	message	: 'BodyParserHandler.parseBody sets an event body if it is supported',
	test	: ( done )=>{
		let MockBodyParser		= Mock( BodyParser );
		let testBody			= 'Test';
		Mocker( MockBodyParser, {
			method			: 'supports',
			shouldReturn	: true
		} );
		Mocker( MockBodyParser, {
			method			: 'parse',
			shouldReturn	: ( event, callback )=>{
				callback( false, testBody );
			}
		} );
		let parsers				= [{ instance: MockBodyParser, options : {} }];
		let event				= helpers.getEventRequest();
		let bodyParserHandler	= new BodyParserHandler( event, { parsers } );
		bodyParserHandler.parseBody(( err )=>{
			assert.equal( err, false );
			assert.equal( event.body, testBody );
			done();
		});
	}
});

test({
	message	: 'BodyParserHandler.parseBody does not parse if not supports and does not return an error',
	test	: ( done )=>{
		let MockBodyParser		= Mock( BodyParser );

		Mocker( MockBodyParser, {
			method			: 'supports',
			shouldReturn	: false
		} );

		Mocker( MockBodyParser, {
			method	: 'parse',
			called	: 0
		} );

		let parsers				= [{ instance: MockBodyParser, options : {} }];
		let bodyParserHandler	= new BodyParserHandler( helpers.getEventRequest(), { parsers } );
		bodyParserHandler.parseBody(( err )=>{
			assert.equal( err, false );
			done();
		});
	}
});

test({
	message	: 'BodyParserHandler.parseBody calls only the first one that supports it',
	test	: ( done )=>{
		let MockBodyParser		= Mock( BodyParser );
		let MockBodyParserTwo	= Mock( BodyParser );
		let testBody			= 'Test';
		let testBodyTwo			= 'TestTwo';
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
			shouldReturn	: ( event, callback )=>{
				callback( false, testBody );
			}
		} );

		let parsers				= [{ instance: MockBodyParser, options : {} }, { instance: MockBodyParserTwo, options : {} } ];
		let event				= helpers.getEventRequest();
		let bodyParserHandler	= new BodyParserHandler( event, { parsers } );
		bodyParserHandler.parseBody(( err )=>{
			assert.equal( err, false );
			assert.equal( event.body, testBody );

			done();
		});
	}
});

test({
	message	: 'BodyParserHandler.parseBody returns an error in case of an error in the body parser',
	test	: ( done )=>{
		let MockBodyParser	= Mock( BodyParser );
		let error			= 'Not supported';
		Mocker( MockBodyParser, {
			method			: 'supports',
			shouldReturn	: true
		} );

		Mocker( MockBodyParser, {
			method			: 'parse',
			shouldReturn	: ( event, callback )=>{
				callback( error );
			}
		} );

		let parsers				= [{ instance: MockBodyParser, options : {} }];
		let bodyParserHandler	= new BodyParserHandler( helpers.getEventRequest(), { parsers } );
		bodyParserHandler.parseBody(( err )=>{
			assert.equal( err, error );
			done();
		});
	}
});
