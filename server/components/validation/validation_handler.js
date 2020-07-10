'use strict';

// Dependencies
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

		return new ValidationResult( validationInput, skeleton );
	}
}

module.exports	= ValidationHandler;