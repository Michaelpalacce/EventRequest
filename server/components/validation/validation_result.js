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

	addAttribute( attribute )
	{
		this.attributes.push( attribute );
	}

	validateAllAttributes()
	{
		this.attributes.forEach( ( attribute ) => {
			attribute.validateSelf();
		})
	}
}

module.exports	= ValidationResult;