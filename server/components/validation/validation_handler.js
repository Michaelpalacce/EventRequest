'use strict';

// Dependencies
const ValidationAttribute	= require( './validation_attribute' );
const ValidationResult		= require( './validation_result' );

/**
 * @brief	Validation Handler used to validate POST data
 */
class ValidationHandler
{
	/**
	 * @brief	Validates the given object and returns validation results for each object property
	 *
	 * @return	Object
	 */
	validate( validationInput, skeleton )
	{
		if ( typeof validationInput !== 'object' )
		{
			validationInput	= {};
		}

		let key,
			value,
			rules,
			validationAttribute,
			validationResult	= new ValidationResult();

		for ( key in validationInput )
		{
			value				= validationInput[key];
			rules				= skeleton[key];

			validationAttribute	= new ValidationAttribute( key, value, rules, validationInput );
			validationResult.addAttribute( validationAttribute );
		}

		validationResult.validateAllAttributes();

		return validationResult;
	}
}

module.exports	= ValidationHandler;