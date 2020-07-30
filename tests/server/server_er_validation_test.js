const { assert, test, helpers }	= require( '../test_helper' );
const { Server }				= require( './../../index' );

test({
	message	: 'Server.testValidation',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate( { query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } } ),
			( event ) => {
				event.send( { query: event.query, body: event.body } );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=50',
			'GET',
			200,
			JSON.stringify( { email: 'test@example.com' } ),
			{ 'content-type': 'application/json' },
			4110
		).then(( response ) => {
			assert.deepStrictEqual(
				JSON.parse( response.body.toString() ),
				{ query: { testKey: 50 }, body: { email: 'test@example.com' } }
			);
			done();
		}).catch( done );

		app.listen( 4110 );
	}
});

test({
	message	: 'Server.testValidation.when.validation.fails',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate( { query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } } ),
			( event ) => {
				event.send( { query: event.query, body: event.body } );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=50',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4111
		).then(( response ) => {
			assert.deepStrictEqual(
				JSON.parse( response.body.toString() ),
				{ body: { email: ['email'] } }
			);
			done();
		}).catch( done );

		app.listen( 4111 );
	}
});

test({
	message	: 'Server.testValidation.when.validation.fails.returns.first.only',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate( { query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } } ),
			( event ) => {
				event.send( { query: event.query, body: event.body } );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=test',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4112
		).then(( response ) => {
			assert.deepStrictEqual(
				JSON.parse( response.body.toString() ),
				{ query: { testKey: ['numeric'] } }
			);
			done();
		}).catch( done );

		app.listen( 4112 );
	}
});

test({
	message	: 'Server.testValidation.when.custom.error.callback',
	test	: ( done ) => {
		const app	= new Server();

		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate(
				{ query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } },
				( event, validationParameter, validationResult ) => {

					assert.deepStrictEqual( validationParameter, 'query' );
					assert.deepStrictEqual( validationResult.getValidationResult(), { testKey: ['numeric'] } );

					event.send( 'ok' );
				}
			),
			( event ) => {
				event.next( 'Error!' );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=test',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4113
		).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'ok'
			);
			done();
		}).catch( done );

		app.listen( 4113 );
	}
});

test({
	message	: 'Server.testValidation.when.default.error.callback',
	test	: ( done ) => {
		const app	= new Server();

		app.apply(
			app.er_validation,
			{
				failureCallback: ( event, validationParameter, validationResult ) => {
					assert.deepStrictEqual( validationParameter, 'query' );
					assert.deepStrictEqual( validationResult.getValidationResult(), { testKey: ['numeric'] } );

					event.send( 'ok' );
				}
			}
		);
		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate(
				{ query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } }
			),
			( event ) => {
				event.next( 'Error!' );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=test',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4114
		).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'ok'
			);
			done();
		}).catch( done );

		app.listen( 4114 );
	}
});

test({
	message	: 'Server.testValidation.when.custom.error.callback.and.default.error.callback',
	test	: ( done ) => {
		const app	= new Server();

		app.apply(
			app.er_validation,
			{
				failureCallback: ( event ) => {
					event.next( 'Error!' );
				}
			}
		);
		app.apply( app.er_body_parser_json );

		app.get( '/testValidation',
			app.er_validation.validate(
				{ query: { testKey: 'numeric||min:1||max:255'}, body: { email: 'string||email' } },
				( event, validationParameter, validationResult ) => {

					assert.deepStrictEqual( validationParameter, 'query' );
					assert.deepStrictEqual( validationResult.getValidationResult(), { testKey: ['numeric'] } );

					event.send( 'ok' );
				}
			),
			( event ) => {
				event.next( 'Error!' );
			} );

		helpers.sendServerRequest(
			'/testValidation?testKey=test',
			'GET',
			200,
			JSON.stringify( { email: 'test' } ),
			{ 'content-type': 'application/json' },
			4115
		).then(( response ) => {
			assert.deepStrictEqual(
				response.body.toString(),
				'ok'
			);
			done();
		}).catch( done );

		app.listen( 4115 );
	}
});