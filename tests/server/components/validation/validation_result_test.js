'use strict';

const { assert, test, Mock, Mocker }	= require( '../../../test_helper' );
const ValidationResult					= require( './../../../../server/components/validation/validation_result' );
const ValidationAttribute				= require( './../../../../server/components/validation/validation_attribute' );
const MockValidationAttribute			= Mock( ValidationAttribute );

test({
	message	: 'ValidationResult addAttribute',
	test	: ( done )=>{
		let attribute	= new MockValidationAttribute();
		let result		= new ValidationResult();

		result.addAttribute( attribute );
		
		done();
	}
});

test({
	message	: 'ValidationResult addAttribute throws if not an instance of ValidationAttribute',
	test	: ( done )=>{
		let attribute	= {};
		let result		= new ValidationResult();

		assert.throws(()=>{
			result.addAttribute( attribute );
		});

		done();
	}
});

test({
	message	: 'ValidationResult validateAllAttributes doesn\'t validate if already validated',
	test	: ( done )=>{
		let attribute	= new MockValidationAttribute();
		let result		= new ValidationResult();

		Mocker( attribute, {
			method			: 'validateSelf',
			shouldReturn	: false,
			called			: 1
		});

		result.addAttribute( attribute );

		result.validateAllAttributes();
		result.validateAllAttributes();

		done();
	}
});

test({
	message	: 'ValidationResult hasValidationFailed',
	test	: ( done )=>{
		let attribute	= new MockValidationAttribute( 'key', 'value', [''], {} );
		let result		= new ValidationResult();

		Mocker( attribute, {
			method			: 'validateSelf',
			shouldReturn	: false,
			called			: 1
		});

		result.addAttribute( attribute );
		result.validateAllAttributes();

		assert.equal( false, result.hasValidationFailed() );

		done();
	}
});

test({
	message	: 'ValidationResult hasValidationFailed if one has failed',
	test	: ( done )=>{
		let attribute	= new MockValidationAttribute( 'key', 'value', [''], {} );
		let result		= new ValidationResult();

		Mocker( attribute, {
			method			: 'validateSelf',
			shouldReturn	: ['string'],
			called			: 1
		});

		result.addAttribute( attribute );
		result.validateAllAttributes();

		assert.equal( true, result.hasValidationFailed() );

		done();
	}
});

test({
	message	: 'ValidationResult getValidationResult',
	test	: ( done )=>{
		let attribute	= new MockValidationAttribute( 'key', 'value', [''], {} );
		let result		= new ValidationResult();

		Mocker( attribute, {
			method			: 'validateSelf',
			shouldReturn	: false,
			called			: 1
		});

		result.addAttribute( attribute );
		result.validateAllAttributes();

		assert.deepEqual( { key: false }, result.getValidationResult() );

		done();
	}
});

test({
	message	: 'ValidationResult getValidationResult when something has failed',
	test	: ( done )=>{
		let attribute	= new MockValidationAttribute( 'key', 'value', [''], {} );
		let result		= new ValidationResult();

		Mocker( attribute, {
			method			: 'validateSelf',
			shouldReturn	: ['string'],
			called			: 1
		});

		result.addAttribute( attribute );
		result.validateAllAttributes();

		assert.deepEqual( { key: ['string'] }, result.getValidationResult() );

		done();
	}
});
