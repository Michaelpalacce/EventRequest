'use strict';

// Dependencies
const assert	= require( './validation_rules' );

/**
 * @brief	Constants
 */
const VALIDATION_ERRORS	= {
	rules		: 'rules',
	array		: 'array',
	notArray	: 'notArray',
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
	weakString	: 'weakString',
	weakNumeric	: 'weakNumeric',
	weakBoolean	: 'weakBoolean',
	weakIsTrue	: 'weakIsTrue',
	weakIsFalse	: 'weakIsFalse',
	same		: 'same',
	different	: 'different',
	equals		: 'equals'
};

/**
 * @brief	Validation attribute that holds data for the current attribute and can be used to validate it
 */
class ValidationAttribute {
	constructor( key, value, rules, data ) {
		this.key		= key;
		this.value		= value;
		this.rules		= rules;
		this.data		= data;
		this.default	= undefined;
	}

	/**
	 * @brief	Returns false otherwise returns reason why it is not valid
	 *
	 * @return	Array|Boolean
	 */
	validateSelf() {
		if ( typeof this.rules === 'object' && typeof this.rules['$default'] !== 'undefined' && typeof this.rules['$rules'] === 'string') {
			this.default	= this.rules['$default'];
			this.rules		= this.rules['$rules'];
		}

		if ( this.rules === undefined || typeof this.rules !== 'string' )
			return [VALIDATION_ERRORS.rules];

		let allRules	= this.rules.split( '||' );
		let index, rule, result, params, validationErrors	= [];

		for ( index = 0; index < allRules.length; ++ index ) {
			rule	= allRules[index];
			params	= this.getRuleParams( rule );

			if ( params.rule === VALIDATION_ERRORS.optional && assert.assertIsEmpty( this.value ) )
				return false;

			result	= this.validateRule( rule, index, params );

			if ( result !== false )
				validationErrors.push( result );
		}

		return validationErrors.length > 0 ? validationErrors : false;
	}

	/**
	 * @brief	Validates each rule separately
	 *
	 * @property	{String} rule
	 * @property	{Number} index
	 * @property	{Object} params
	 *
	 * @return	String|Boolean
	 */
	validateRule( rule, index, params ) {
		let valueLength, sameEntry, inputEntry;

		switch ( params.rule ) {
			case VALIDATION_ERRORS.optional:
				return false;

			case VALIDATION_ERRORS.string:
				if ( assert.assertIsNumeric( parseInt( this.value ) ) )
					this.value	= this.value.toString();

				return assert.assertIsString( this.value ) ? false : VALIDATION_ERRORS.string;

			case VALIDATION_ERRORS.notString:
				return assert.assertNotString( this.value ) ? false : VALIDATION_ERRORS.notString;

			case VALIDATION_ERRORS.weakString:
				return assert.assertIsInternalType( this.value, 'string' ) ? false : VALIDATION_ERRORS.weakString;

			case VALIDATION_ERRORS.weakNumeric:
				return assert.assertIsInternalType( this.value, 'number' ) ? false : VALIDATION_ERRORS.weakNumeric;

			case VALIDATION_ERRORS.weakBoolean:
				return assert.assertIsInternalType( this.value, 'boolean' ) ? false : VALIDATION_ERRORS.weakBoolean;

			case VALIDATION_ERRORS.weakIsTrue:
				return this.value === true ? false : VALIDATION_ERRORS.weakIsTrue;

			case VALIDATION_ERRORS.weakIsFalse:
				return this.value === false ? false : VALIDATION_ERRORS.weakIsFalse;

			case VALIDATION_ERRORS.numeric: {
				const result	= assert.assertIsNumeric( parseInt( this.value ) ) ? false : VALIDATION_ERRORS.numeric;

				if ( result === false )
					this.value	= parseInt( this.value );

				return result;
			}
			case VALIDATION_ERRORS.notNumeric:
				return assert.assertNotNumeric( parseInt( this.value ) ) ? false : VALIDATION_ERRORS.notNumeric;

			case VALIDATION_ERRORS.array:
				return assert.assertIsArray( this.value ) ? false : VALIDATION_ERRORS.array;

			case VALIDATION_ERRORS.notArray:
				return assert.assertNotArray( this.value ) ? false : VALIDATION_ERRORS.notArray;

			case VALIDATION_ERRORS.filled:
				return assert.assertNotEmpty( this.value ) ? false : VALIDATION_ERRORS.filled;

			case VALIDATION_ERRORS.range: {
				const range	= params.params[0].split( '-' );
				valueLength	= assert.getLength( this.value );

				if ( range.length !== 2 || assert.assertIsEmpty( range[0] ) || assert.assertIsEmpty( range[1] ) )
					return VALIDATION_ERRORS.rules;

				return assert.assertBiggerOrEqual( valueLength, Number( range[0] ) ) && assert.assertSmallerOrEqual( valueLength, Number( range[1] ) )
					? false
					: VALIDATION_ERRORS.range;
			}

			case VALIDATION_ERRORS.min: {
				valueLength	= assert.getLength( this.value );
				const min	= params.params[0];

				if ( params.params.length !== 1 || assert.assertIsEmpty( min ) )
					return VALIDATION_ERRORS.rules;

				return assert.assertBiggerOrEqual( valueLength, Number( min ) ) ? false : VALIDATION_ERRORS.min;
			}

			case VALIDATION_ERRORS.max: {
				valueLength	= assert.getLength( this.value );
				const max	= params.params[0];

				if ( params.params.length !== 1 || assert.assertIsEmpty( max ) )
					return VALIDATION_ERRORS.rules;

				return assert.assertSmallerOrEqual( valueLength, Number( max ) ) ? false : VALIDATION_ERRORS.max;
			}

			case VALIDATION_ERRORS.email:
				return assert.assertIsValidEmail( this.value ) ? false : VALIDATION_ERRORS.email;

			case VALIDATION_ERRORS.isTrue: {
				const isTrueForIsTrueValidation	= assert.assertTrue( this.value );

				if ( isTrueForIsTrueValidation )
					this.value	= true;

				return isTrueForIsTrueValidation ? false : VALIDATION_ERRORS.isTrue;
			}

			case VALIDATION_ERRORS.isFalse: {
				const isFalseForIsFalseValidation	= assert.assertFalse( this.value );

				if ( isFalseForIsFalseValidation )
					this.value	= false;

				return isFalseForIsFalseValidation ? false : VALIDATION_ERRORS.isFalse;
			}

			case VALIDATION_ERRORS.boolean: {
				const isTrueForBooleanValidation	= assert.assertTrue( this.value );
				const isFalseForBooleanValidation	= assert.assertFalse( this.value );

				if ( isTrueForBooleanValidation )
					this.value	= true;

				if ( isFalseForBooleanValidation )
					this.value	= false;

				return isTrueForBooleanValidation || isFalseForBooleanValidation ? false : VALIDATION_ERRORS.boolean;
			}

			case VALIDATION_ERRORS.notBoolean:
				return assert.assertNotBoolean( this.value ) ? false : VALIDATION_ERRORS.notBoolean;

			case VALIDATION_ERRORS.same: {
				sameEntry	= params.params[0];

				if ( params.params.length !== 1 )
					return VALIDATION_ERRORS.rules;

				inputEntry	= this.data[sameEntry];

				return assert.assertStrictEqual( this.value, inputEntry ) ? false : VALIDATION_ERRORS.same;
			}

			case VALIDATION_ERRORS.different: {
				sameEntry	= params.params[0];

				if ( params.params.length !== 1 )
					return VALIDATION_ERRORS.rules;

				inputEntry	= this.data[sameEntry];

				return assert.assertStrictNotEqual( this.value, inputEntry ) ? false : VALIDATION_ERRORS.different;
			}

			case VALIDATION_ERRORS.equals: {
				const comparator	= params.params[0];

				if ( params.params.length !== 1)
					return VALIDATION_ERRORS.rules;

				return assert.assertStrictEqual( this.value, comparator ) ? false : VALIDATION_ERRORS.equals;
			}

			default:
				return VALIDATION_ERRORS.rules;
		}
	}

	/**
	 * @brief	Splits the rule additionally and returns any params found
	 *
	 * @property	{String} rule
	 *
	 * @return	Object
	 */
	getRuleParams( rule ) {
		const ruleParams	= rule.split( ':' );

		return{
			rule	: ruleParams.shift(),
			params	: ruleParams
		};
	}
}

ValidationAttribute.VALIDATION_ERRORS	= VALIDATION_ERRORS;

module.exports	= ValidationAttribute;
