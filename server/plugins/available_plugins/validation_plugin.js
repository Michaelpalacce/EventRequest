'use strict';

const PluginInterface	= require( '../plugin_interface' );

/**
 * @brief	Plugin that is used to input the validation suite directly in the route with a Dynamic Middleware
 */
class ValidationPlugin extends PluginInterface
{
	/**
	 * @param	{String} pluginId
	 * @param	{Object} [options={}]
	 */
	constructor( pluginId, options = {} )
	{
		super( pluginId, options );

		this.setOptions( options );
	}

	/**
	 * @param	{Object} options
	 */
	setOptions( options )
	{
		super.setOptions( options );

		this.failureCallback	= typeof options.failureCallback === 'function'
								? options.failureCallback
								: ( event, validationParameter, validationResult ) => {
									event.send( { [validationParameter]: validationResult.getValidationResult() } );
								};
	}

	/**
	 * @brief	Does Validation given rules
	 *
	 * @details	This will merge the result with the properties that are being validated
	 *
	 * @param	{Object} validationRules
	 * @param	{Function} failureCallback
	 *
	 * @return	Function
	 */
	validate( validationRules, failureCallback )
	{
		failureCallback	= typeof failureCallback === 'undefined' ? this.failureCallback : failureCallback;

		return ( event ) => {
			for ( const toValidate in validationRules )
			{
				if ( typeof event[toValidate] !== 'object' )
					return event.next( `Could not validate ${toValidate} as it is not a property of the EventRequest` );

				const validationResult	= event.validate( event[toValidate], validationRules[toValidate] );

				if ( validationResult.hasValidationFailed() )
					return failureCallback( event, toValidate, validationResult );

				event[toValidate]	= Object.assign( event[toValidate], validationResult.getValidationResult() );
			}

			event.next();
		};
	}
}

module.exports	= ValidationPlugin;