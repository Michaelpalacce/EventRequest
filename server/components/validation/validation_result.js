'use strict';

/**
 * @brief	Validation result that holds information of all the attributes being validated and their results
 */
class ValidationResult
{
	constructor()
	{
		this.attributes	= [];
	}

	/**
	 * @brief	Adds attributes to the validation result
	 *
	 * @param	ValidationAttribute attribute
	 *
	 * @return	void
	 */
	addAttribute( attribute )
	{
		this.attributes.push( attribute );
	}

	/**
	 * @brief	Triggers the validate self on each of the added attributes
	 *
	 * @return	void
	 */
	validateAllAttributes()
	{
		this.attributes.forEach( ( attribute ) => {
			console.log( attribute.validateSelf() );
		})
	}
}

module.exports	= ValidationResult;