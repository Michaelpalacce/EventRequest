'use strict';

// Dependencies
const assert	= require( './validation_rules' );

/**
 * @brief	Constants
 */
const VALIDATION_ERRORS	= {
	rules		: 'rules',
	optional	: 'optional',
	filled		: 'filled',
	string		: 'string',
	notString	: 'notString',
	range		: 'range',
	min			: 'min',
	max			: 'max',
	email		: 'email',
	isTrue		: 'isTrue',
	isFalse		: 'isFalse',
	boolean		: 'boolean',
	notBoolean	: 'notBoolean',
	numeric		: 'numeric',
	notNumeric	: 'notNumeric',
	date		: 'date',
	same		: 'same',
	different	: 'different',
	equals		: 'equals'
};

/**
 * @brief	Validation attribute that holds data for the current attribute and can be used to validate it
 */
class ValidationAttribute
{
	constructor( key, value, rules, data )
	{
		this.key		= key;
		this.value		= value;
		this.rules		= rules;
		this.data		= data;
		this.default	= undefined;
	}

	/**
	 * @brief	Returns true otherwise returns reason why it is not valid
	 *
	 * @return	String|Boolean
	 */
	validateSelf()
	{
		if ( typeof this.rules === 'object' && typeof this.rules['default'] !== 'undefined' && typeof this.rules['rules'] === 'string')
		{
			this.default	= this.rules['default'];
			this.rules		= this.rules['rules'];
		}

		if ( this.rules === undefined || typeof this.rules !== 'string' )
		{
			return VALIDATION_ERRORS.rules;
		}

		let allRules	= this.rules.split( '||' );
		let index, rule, result, params, validationErrors	= [];

		for ( index = 0; index < allRules.length; ++ index )
		{
			rule	= allRules[index];
			params	= this.getRuleParams( rule );

			if ( params.rule === VALIDATION_ERRORS.optional && assert.assertIsEmpty( this.value ) )
			{
				return false;
			}

			result	= this.validateRule( rule, index, params, allRules );

			if ( result !== false )
			{
				validationErrors.push( result );
			}
		}

		return validationErrors.length > 0 ? validationErrors : false;
	}

	/**
	 * @brief	Validates each rule separately
	 *
	 * @param	String rule
	 * @param	Number index
	 * @param	Object params
	 * @param	Array allRules
	 *
	 * @return	String|Boolean
	 */
	validateRule( rule, index, params, allRules )
	{
		let valueLength, sameEntry, inputEntry;

		switch ( params.rule )
		{
			case VALIDATION_ERRORS.optional:
				return false;

			case VALIDATION_ERRORS.string:
				return assert.assertIsString( this.value ) ? false : VALIDATION_ERRORS.string;

			case VALIDATION_ERRORS.notString:
				return assert.assertNotString( this.value ) ? false : VALIDATION_ERRORS.notString;

			case VALIDATION_ERRORS.numeric:
				return assert.assertIsNumeric( parseInt( this.value ) ) ? false : VALIDATION_ERRORS.numeric;

			case VALIDATION_ERRORS.notNumeric:
				return assert.assertNotNumeric( parseInt( this.value ) ) ? false : VALIDATION_ERRORS.notNumeric;

			case VALIDATION_ERRORS.filled:
				return assert.assertNotEmpty( this.value ) ? false : VALIDATION_ERRORS.filled;

			case VALIDATION_ERRORS.range:
				let range	= params.params[0].split( '-' );
				valueLength	= assert.getLength( this.value );
				if ( range.length !== 2 || assert.assertIsEmpty( range[0] ) || assert.assertIsEmpty( range[1] ) )
				{
					return VALIDATION_ERRORS.rules;
				}

				return assert.assertBiggerOrEqual( valueLength, Number( range[0] ) )
						&& assert.assertSmallerOrEqual( valueLength, Number( range[1] ) )
						? false
						: VALIDATION_ERRORS.range;

			case VALIDATION_ERRORS.min:
				valueLength	= assert.getLength( this.value );
				let min		= params.params[0];
				if ( params.params.length !== 1 || assert.assertIsEmpty( min ) )
				{
					return VALIDATION_ERRORS.rules;
				}

				return assert.assertBiggerOrEqual( valueLength, Number( min ) ) ? false : VALIDATION_ERRORS.min;

			case VALIDATION_ERRORS.max:
				valueLength	= assert.getLength( this.value );
				let max		= params.params[0];
				if ( params.params.length !== 1 || assert.assertIsEmpty( max ) )
				{
					return VALIDATION_ERRORS.rules;
				}

				return assert.assertSmallerOrEqual( valueLength, Number( max ) ) ? false : VALIDATION_ERRORS.max;

			case VALIDATION_ERRORS.email:
				return assert.assertIsValidEmail( this.value ) ? false : VALIDATION_ERRORS.email;

			case VALIDATION_ERRORS.isTrue:
				return assert.assertTrue( this.value ) ? false : VALIDATION_ERRORS.isTrue;

			case VALIDATION_ERRORS.isFalse:
				return assert.assertFalse( this.value ) ? false : VALIDATION_ERRORS.isFalse;

			case VALIDATION_ERRORS.boolean:
				return assert.assertIsBoolean( this.value ) ? false : VALIDATION_ERRORS.boolean;

			case VALIDATION_ERRORS.notBoolean:
				return assert.assertNotBoolean( this.value ) ? false : VALIDATION_ERRORS.notBoolean;

			case VALIDATION_ERRORS.same:
				sameEntry	= params.params[0];
				if ( params.params.length !== 1 )
				{
					return VALIDATION_ERRORS.rules;
				}
				inputEntry	= this.data[sameEntry];

				return assert.assertStrictEqual( this.value, inputEntry ) ? false : VALIDATION_ERRORS.same;

			case VALIDATION_ERRORS.different:
				sameEntry	= params.params[0];
				if ( params.params.length !== 1 )
				{
					return VALIDATION_ERRORS.rules;
				}
				inputEntry	= this.data[sameEntry];

				return assert.assertStrictNotEqual( this.value, inputEntry ) ? false : VALIDATION_ERRORS.different;

			case VALIDATION_ERRORS.equals:
				let comparator	= params.params[0];
				if ( params.params.length !== 1)
				{
					return VALIDATION_ERRORS.rules;
				}

				return assert.assertStrictEqual( this.value, comparator ) ? false : VALIDATION_ERRORS.equals;

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
