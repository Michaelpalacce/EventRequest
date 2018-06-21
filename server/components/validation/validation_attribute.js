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

	/**
	 * @brief	Returns true otherwise returns reason why it is not valid
	 *
	 * @return	String
	 */
	validateSelf()
	{
		if ( this.rules === undefined )
		{
			return 'rules';
		}

		this.rules	= this.rules.split( '||' );

		this.rules.forEach( ( rule, index, allRules ) => {
		})
	}
}

module.exports	= ValidationAttribute;