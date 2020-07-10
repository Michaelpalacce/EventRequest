'use strict';

const { assert, test, Mock, Mocker }	= require( '../../../test_helper' );
const ValidationResult					= require( './../../../../server/components/validation/validation_result' );
const ValidationAttribute				= require( './../../../../server/components/validation/validation_attribute' );
const MockValidationAttribute			= Mock( ValidationAttribute );

test({
	message	: 'ValidationResult validateAllAttributes doesn\'t validate if already validated',
	test	: ( done )=>{
		const result		= new ValidationResult( { key: 123 }, { key: 'numeric' } );

		result.validateAllAttributes();
		assert.equal( result.hasValidationFailed(), false );

		result.skeleton	= {};

		result.validateAllAttributes();
		assert.equal( result.hasValidationFailed(), false );

		done();
	}
});

test({
	message	: 'ValidationResult hasValidationFailed',
	test	: ( done )=>{
		const result		= new ValidationResult( { key: 123 }, { key: 'numeric' } );

		result.validateAllAttributes();
		assert.equal( result.hasValidationFailed(), false );

		done();
	}
});

test({
	message	: 'ValidationResult hasValidationFailed if one has failed',
	test	: ( done )=>{
		const result		= new ValidationResult( { key: 123 }, { key: 'array' } );

		result.validateAllAttributes();
		assert.equal( result.hasValidationFailed(), true );

		done();
	}
});

test({
	message	: 'ValidationResult getValidationResult',
	test	: ( done )=>{
		const result		= new ValidationResult( { key: 123 }, { key: 'string' } );

		result.validateAllAttributes();
		assert.deepStrictEqual( result.getValidationResult(), { key: '123' } );

		done();
	}
});

test({
	message	: 'ValidationResult getValidationResult when something has failed',
	test	: ( done )=>{
		const result		= new ValidationResult( { key: 123 }, { key: 'array' } );

		result.validateAllAttributes();
		assert.deepStrictEqual( result.getValidationResult(), { key: ['array'] } );

		done();
	}
});
