'use strict';

const VALIDATION_ERRORS	= {
	rules	: 'rules'
};

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
			return VALIDATION_ERRORS.rules;
		}

		let allRules	= this.rules.split( '||' );
		let index, rule, result;

		for ( index = 0; index < allRules.length; ++ index )
		{
			rule	= allRules[index];
			result	= this.validateRule( rule, index, allRules );

			if ( result !== true )
			{
				return result;
			}
		}
	}

	/**
	 * @brief	Validates each rule separately
	 *
	 * @param	String rule
	 * @param	Number index
	 * @param	Array allRules
	 *
	 * @return	String|Boolean
	 */
	validateRule( rule, index, allRules )
	{
		rule	= this.getRuleParams( rule );
		switch ( rule )
		{

			default:
				return VALIDATION_ERRORS.rules;
		}
	}

	/**
	 * @brief	Splits the rule additionally and returns any params found
	 *
	 * @param	String rule
	 *
	 * @return	Object
	 */
	getRuleParams( rule )
	{

	}
}

module.exports	= ValidationAttribute;