'use strict';

// Dependencies
const ValidationResult		= require( './validation_result' );

module.exports	= {
	/**
	 * @brief	Validates the given object and returns validation results for each object property
	 *
	 * @param	{Object} validationInput
	 * @param	{Object} skeleton
	 *
	 * @return	ValidationResult
	 */
	validate	: ( validationInput, skeleton )=>{
		if ( typeof validationInput !== 'object' )
			validationInput	= {};

		return new ValidationResult( validationInput, skeleton );
	}
};