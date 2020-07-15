'use strict';

const ValidationAttribute	= require( './validation_attribute' );

/**
 * @brief	Validation result that holds information of all the attributes being validated and their results
 */
class ValidationResult
{
	/**
	 * @param	validationInput Object
	 * @param	skeleton Object
	 */
	constructor( validationInput, skeleton )
	{
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
	validateAllAttributes()
	{
		if ( this.validationFailed !== null )
			return;

		this.validationFailed	= false;
		const failures			= {};

		this._formResult( this.validationInput, this.skeleton, this.result, failures );

		if ( this.validationFailed )
		{
			this._sanitizeFailures( failures );

			this.result	= failures;
		}
	}

	/**
	 * @brief	Forms the result using recursion
	 *
	 * @param	validationInput Object
	 * @param	skeleton Object
	 * @param	result Object
	 * @param	failures Object
	 *
	 * @private
	 *
	 * @return	void
	 */
	_formResult( validationInput, skeleton, result, failures )
	{
		let key;

		for ( key in skeleton )
		{
			let value	= validationInput[key];
			const rules	= skeleton[key];

			if ( typeof rules === 'object' && typeof rules.$default === 'undefined' && typeof rules.$rules === 'undefined' )
			{
				if ( value === undefined )
				{
					value	= {};
				}

				result[key]		= {};
				failures[key]	= {};

				this._formResult( value, rules, result[key], failures[key] );
				continue;
			}

			const attribute		= new ValidationAttribute( key, value, rules, validationInput );
			const validation	= attribute.validateSelf();

			if ( validation !== false )
			{
				this.validationFailed	= true;

				failures[attribute.key]	= validation;
			}
			else
			{
				result[attribute.key]	= typeof attribute.value === 'undefined'
										|| attribute.value === null
										? attribute.default
										: attribute.value;
			}
		}
	}

	/**
	 * @brief	Sanitizes the failures object to not report any empty properties
	 *
	 * @param	failures Object
	 *
	 * @private
	 *
	 * @return	void
	 */
	_sanitizeFailures( failures )
	{
		for ( const key in failures )
		{
			if ( typeof failures[key] === 'object' )
			{
				if ( Object.keys( failures[key] ).length === 0 )
				{
					delete failures[key];
				}
				else
				{
					this._sanitizeFailures( failures[key] );

					if ( Object.keys( failures[key] ).length === 0 )
					{
						delete failures[key];
					}
				}
			}
		}
	}

	/**
	 * @brief	Checks if the validation of a given ValidationInput has failed.
	 *
	 * @return	Boolean
	 */
	hasValidationFailed()
	{
		this.validateAllAttributes();

		return this.validationFailed;
	}

	/**
	 * @brief	Gets the reason if any of validation failure otherwise the returned
	 * 			object will have the values mapped to the keys that were being validated
	 *
	 * @return	Array
	 */
	getValidationResult()
	{
		this.validateAllAttributes();

		return this.result;
	}
}

module.exports	= ValidationResult;