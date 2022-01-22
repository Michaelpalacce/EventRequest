'use strict';

const ValidationAttribute	= require( './validation_attribute' );

/**
 * @brief	Validation result that holds information of all the attributes being validated and their results
 */
class ValidationResult {
	/**
	 * @param	{Object} validationInput
	 * @param	{Object} skeleton
	 */
	constructor( validationInput, skeleton ) {
		this.validationInput	= validationInput;
		this.skeleton			= skeleton;
		this.result				= {};
		this.validationFailed	= null;
	}

	/**
	 * @brief	Validates all the attributes
	 *
	 * @details	Will not validate if validation was already performed
	 *
	 * @return	void
	 */
	validateAllAttributes() {
		if ( this.validationFailed !== null )
			return;

		this.validationFailed	= false;
		const failures			= {};

		this.result				= this._formResult( this.validationInput, this.skeleton, failures );

		if ( this.validationFailed ) {
			this._sanitizeFailures( failures );

			this.result	= failures;
		}
	}

	/**
	 * @brief	Forms the result using recursion
	 *
	 * @param	{Object} validationInput
	 * @param	{Object} skeleton
	 * @param	{Object} failures
	 *
	 * @private
	 *
	 * @return	Object|Array
	 */
	_formResult( validationInput, skeleton, failures ) {
		let result	= {};

		if ( this._isSingleObjectArray( skeleton ) ) {
			if ( Array.isArray( validationInput ) ) {
				const rules	= skeleton[0];
				result		= [];

				for ( let i = 0; i < validationInput.length; i ++ ) {
					failures[i]				= {};
					const validationEntry	= validationInput[i];
					result.push( this._formResult( validationEntry, rules, failures[i] ) );
				}

				return result;
			}
			else {
				this.validationFailed	= true;
				failures[0]				= {};

				this._formResult( validationInput, skeleton[0], failures[0] );

				return [];
			}
		}

		for ( const key in skeleton ) {
			/* istanbul ignore next */
			if ( ! {}.hasOwnProperty.call( skeleton, key ) )
				continue;

			let value	= validationInput[key];
			const rules	= skeleton[key];

			if ( this._isActualRuleObject( rules ) ) {
				if ( value === undefined )
					value	= {};

				failures[key]	= {};
				result[key]		= this._formResult( value, rules, failures[key] );
				continue;
			}

			const attribute		= new ValidationAttribute( key, value, rules, validationInput );
			const validation	= attribute.validateSelf();

			if ( validation !== false ) {
				this.validationFailed	= true;

				failures[attribute.key]	= validation;
			}
			else
				result[attribute.key]	= typeof attribute.value === 'undefined' || attribute.value === null
										? attribute.default
										: attribute.value;
		}

		return result;
	}

	/**
	 * @brief	Returns if the rules object is valid or not
	 *
	 * @details	If $default or $rules are set, that means that the object is an instructional object for the ValidationAttribute
	 *
	 * @param	{Object} rules
	 *
	 * @private
	 *
	 * @return	{Boolean}
	 */
	_isActualRuleObject( rules ) {
		return typeof rules === 'object' && typeof rules.$default === 'undefined' && typeof rules.$rules === 'undefined';
	}

	/**
	 * @brief	Checks if the element given is an Array that contains only one element that is an object
	 *
	 * @details	This is done because if we want to validate an array of arrays this is the way that the data is passed to be validated
	 *
	 * @param	{*} array
	 *
	 * @private
	 *
	 * @return	{Boolean}
	 */
	_isSingleObjectArray( array ) {
		return Array.isArray( array ) && array.length === 1 && typeof array[0] === 'object';
	}

	/**
	 * @brief	Sanitizes the failures object to not report any empty properties
	 *
	 * @param	{Object} failures
	 *
	 * @private
	 *
	 * @return	void
	 */
	_sanitizeFailures( failures ) {
		for ( const key in failures ) {
			if ( typeof failures[key] === 'object' ) {
				if ( Object.keys( failures[key] ).length === 0 )
					delete failures[key];
				else {
					this._sanitizeFailures( failures[key] );

					if ( Object.keys( failures[key] ).length === 0 )
						delete failures[key];
				}
			}
		}
	}

	/**
	 * @brief	Checks if the validation of a given ValidationInput has failed.
	 *
	 * @return	Boolean
	 */
	hasValidationFailed() {
		this.validateAllAttributes();

		return this.validationFailed;
	}

	/**
	 * @brief	Gets the reason if any of validation failure otherwise the returned
	 * 			object will have the values mapped to the keys that were being validated
	 *
	 * @return	Array
	 */
	getValidationResult() {
		this.validateAllAttributes();

		return this.result;
	}
}

module.exports	= ValidationResult;
