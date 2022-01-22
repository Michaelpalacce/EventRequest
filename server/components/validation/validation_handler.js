'use strict';

// Dependencies
const ValidationResult		= require( './validation_result' );

module.exports	= {
	/**
	 * @brief	Validates the given object and returns validation results for each object property
	 *
	 * @property	{Object} validationInput
	 * @property	{Object} skeleton
	 *
	 * @return	ValidationResult
	 */
	validate	: ( validationInput, skeleton ) => {
		if ( typeof validationInput !== 'object' )
			validationInput	= {};

		if ( typeof skeleton !== 'object' )
			skeleton	= {};

		return new ValidationResult( validationInput, skeleton );
	}
};
