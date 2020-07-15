'use strict';

// Dependencies
const ValidationResult		= require( './validation_result' );

module.exports	= {
	/**
	 * @brief	Validates the given object and returns validation results for each object property
	 *
	 * @param	validationInput Object
	 * @param	skeleton Object
	 *
	 * @return	ValidationResult
	 */
	validate	: ( validationInput, skeleton )=>{
		if ( typeof validationInput !== 'object' )
		{
			validationInput	= {};
		}

		return new ValidationResult( validationInput, skeleton );
	}
};