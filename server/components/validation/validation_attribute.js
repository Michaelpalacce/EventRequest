'use strict';

// Dependencies
const assert	= require( './validation_rules' );

const VALIDATION_ERRORS	= {
	rules	: 'rules',
	string	: 'string',
	filled	: 'filled',
	range	: 'range',
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
		console.log( this );
	}

	/**
	 * @brief	Returns true otherwise returns reason why it is not valid
	 *
	 * @return	String|Boolean
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

		return true;
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
		let params	= this.getRuleParams( rule );

		switch ( params.rule )
		{
			case VALIDATION_ERRORS.string:
				return assert.assertIsString( this.value ) ? true : VALIDATION_ERRORS.string;

			case VALIDATION_ERRORS.filled:
				return assert.assertNotEmpty( this.value ) ? true : VALIDATION_ERRORS.filled;

			case VALIDATION_ERRORS.range:
				let range		= params.params[0].split( '-' );
				let valueLength	= typeof this.value.length === 'undefined' ? this.value : this.value.length;
				if ( range.length !== 2 || assert.assertIsEmpty( range[0] ) || assert.assertIsEmpty( range[1] ) )
				{
					return VALIDATION_ERRORS.range;
				}

				return assert.assertBiggerOrEqual( valueLength, Number( range[0] ) )
						&& assert.assertSmallerOrEqual( valueLength, Number( range[1] ) )
						? true
						: VALIDATION_ERRORS.range;

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
		rule	= rule.split( ':' );

		return{
			rule	: rule.shift(),
			params	: rule
		}
	}
}

module.exports	= ValidationAttribute;