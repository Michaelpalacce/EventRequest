'use strict';

/**
 * @brief	Validation attribute that holds data for the current attribute and can be used to validate it
 */
class ValidationAttribute
{
	constructor( key, value, rules, data )
	{
		this.key	= key;
		this.value	= value;
		this.rules	= rules;
		this.data	= data;
	}
}

module.exports	= ValidationAttribute;