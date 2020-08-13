'use strict';

const CACHE_CONTROL_HEADER				= 'Cache-control';

const AVAILABLE_CACHE_CONTROL			= ['public', 'private', 'no-cache', 'no-store'];
const AVAILABLE_EXPIRATION_DIRECTIVES	= ['max-age', 's-maxage', 'max-stale', 'min-fresh', 'stale-while-revalidate', 'stale-if-errors'];
const AVAILABLE_REVALIDATION_DIRECTIVES	= ['must-revalidate', 'proxy-revalidate', 'immutable'];
const AVAILABLE_OTHER_DIRECTIVES		= ['no-transform', 'only-if-cached'];

class CacheControl
{
	constructor( options )
	{
		this.options	= options;
	}

	setCacheControl( directive )
	{
	}

	addExpirationDirective( directive, seconds )
	{
	}

	addRevalidationDirective( directive )
	{
	}

	addOtherDirective( directive )
	{
	}

	build()
	{
		return ``;
	}
}

module.exports	= CacheControl;