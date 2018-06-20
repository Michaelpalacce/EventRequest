'use strict';

// Dependencies
const ValidationAttribute	= require( './validation/validation_attribute' );
const ValidationResult		= require( './validation/validation_result' );

/**
 * @brief	Validation Handler used to validate POST data
 */
class ValidationHandler
{
	/**
	 * @brief	Validates the body given
	 *
	 *
	 */
	validateEventBody( body, skeleton )
	{
		if ( typeof body !== 'object' )
		{
			body	= {};
		}

		let key,
			value,
			rules,
			validationAttribute,
			validationResult	= new ValidationResult();

		for ( key in body )
		{
			value				= body[key];
			rules				= skeleton[key];
			validationAttribute	= new ValidationAttribute( key, value, rules, body );

			validationResult.addAttribute( validationAttribute );
		}
	}
}

module.exports	= ValidationHandler;