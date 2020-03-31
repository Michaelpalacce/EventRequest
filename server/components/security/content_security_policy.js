'use strict';

// Option keys
const OPTIONS_DIRECTIVES_KEY		= 'directives';
const OPTIONS_REPORT_URI			= 'reportUri';
const OPTIONS_USE_REPORT_TO			= 'useReportTo';
const OPTIONS_ENABLE_XSS			= 'xss';
const OPTIONS_ENABLE_SANDBOX		= 'sandbox';
const OPTIONS_ENABLE_SELF			= 'self';

// Directive keys
const CHILD_SRC_KEY					= 'child-src';
const CONNECT_SRC_KEY				= 'connect-src';
const DEFAULT_SRC_KEY				= 'default-src';
const SCRIPT_SRC_KEY				= 'script-src';
const FONT_SRC_KEY					= 'font-src';
const FRAME_SRC_KEY					= 'frame-src';
const MANIFEST_SRC_KEY				= 'manifest-src';
const MEDIA_SRC_KEY					= 'media-src';
const OBJECT_SRC_KEY				= 'object-src';
const STYLE_SRC_KEY					= 'style-src';
const IMAGE_SRC_KEY					= 'img-src';
const BASE_URI_KEY					= 'base-uri';
const PLUGIN_TYPES_KEY				= 'plugin-types';
const SANDBOX_KEY					= 'sandbox';
const FORM_ACTION_KEY				= 'form-action';
const FRAME_ANCESTORS_KEY			= 'frame-ancestors';
const UPGRADE_INSECURE_REQUESTS_JEY	= 'upgrade-insecure-requests';
const REPORT_URI_KEY				= 'report-uri';
const REPORT_TO_KEY					= 'report-to';

// The name of the CSP header
const HEADER_NAME					= 'Content-Security-Policy';
const REPORT_ONLY_HEADER_NAME		= 'Content-Security-Policy-Report-Only';

// Directives that if found should have single quotations added around them
const DIRECTIVES_SPECIAL_ARGUMENTS	= ['self', 'unsafe-eval', 'unsafe-hashes', 'unsafe-inline', 'none'];

// Regular expression to match mime types
const MIME_TYPE_REGEXP				= new RegExp( /^[-*\w.]+\/[-*\w.]+$/ );

/**
 * @brief	CSP class that uses the builder pattern to build the CSP header
 */
class ContentSecurityPolicy
{
	constructor( options = {} )
	{
		this.directives	= {};
		this.reportOnly	= false;

		this.parseOptions( options );
	}

	/**
	 * @brief	Parses the given options and sets the different directives in keys
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	parseOptions( options )
	{
		this.setEnabled( options['enabled'] );

		this.directives		= typeof options[OPTIONS_DIRECTIVES_KEY] === 'object'
							? options[OPTIONS_DIRECTIVES_KEY]
							: {};

		const reportUri		= typeof options[OPTIONS_REPORT_URI] === 'string'
							? options[OPTIONS_REPORT_URI]
							: null;

		const useReportTo	= options[OPTIONS_USE_REPORT_TO] === true;

		if ( useReportTo === true && reportUri !== null )
		{
			this.setReportOnlyWithReportTo( reportUri );
		}
		else if ( reportUri !== null )
		{
			this.setReportOnly( reportUri );
		}

		if ( typeof options[OPTIONS_ENABLE_XSS] === 'boolean' ? options[OPTIONS_ENABLE_XSS] :  true )
		{
			this.xss();
		}

		if ( options[OPTIONS_ENABLE_SELF] === true )
		{
			this.enableSelf();
		}

		if ( options[OPTIONS_ENABLE_SANDBOX] === true )
		{
			this.enableSandbox();
		}
	}

	/**
	 * @brief	Enables xss protection
	 *
	 * @return	void
	 */
	xss()
	{
		this.addDefaultSrc( 'none' );
		this.addScriptSrc( 'self' );
		this.addImgSrc( 'self' );
		this.addFontSrc( 'self' );
		this.addStyleSrc( 'self' );
		this.addConnectSrc( 'self' );
		this.addChildSrc( 'self' );
		this.addMediaSrc( 'self' );
		this.addManifestSrc( 'self' );
		this.addObjectSrc( 'self' );
		this.addFrameAncestors( 'self' );
		this.addBaseUri( 'self' );
		this.upgradeInsecureRequests();
	}

	/**
	 * @param	uri String
	 *
	 * @return	void
	 */
	allowPluginType( mimeType )
	{
		if ( MIME_TYPE_REGEXP.test( mimeType ) )
			this._addDirective( PLUGIN_TYPES_KEY, mimeType );
	}

	/**
	 * @brief	Sets the component's to either be enabled or not
	 *
	 * @param	enabled Boolean
	 *
	 * @return	void
	 */
	setEnabled( enabled = true )
	{
		this.enabled	= typeof enabled === 'boolean' ? enabled : true;
	}

	/**
	 * @brief	Gets the header according to whether CSP is set to report only
	 *
	 * @return	String
	 */
	getHeader()
	{
		return this.reportOnly ? REPORT_ONLY_HEADER_NAME : HEADER_NAME;
	}

	/**
	 * @brief	Sets the header to be in report only mode
	 *
	 * @param	uri String
	 *
	 * @return	void
	 */
	setReportOnly( uri )
	{
		if ( typeof uri !== 'string' || uri === '' )
		{
			return;
		}

		this.reportOnly	= true;

		this._addDirective( REPORT_URI_KEY, uri );
	}

	/**
	 * @brief	Sets the header to be in report only mode with report-to instead of report-uri
	 *
	 * @details	The report-uri header won't be added for you, you have to specify that yourself
	 *
	 * @param	uri String
	 *
	 * @return	void
	 */
	setReportOnlyWithReportTo( uri )
	{
		if ( typeof uri !== 'string' || uri === '' )
		{
			return;
		}

		this.reportOnly	= true;

		this._addDirective( REPORT_TO_KEY, uri );
	}

	/**
	 * @return	void
	 */
	enableSandbox()
	{
		this._addDirective( SANDBOX_KEY );
	}

	/**
	 * @return	void
	 */
	upgradeInsecureRequests()
	{
		this._addDirective( UPGRADE_INSECURE_REQUESTS_JEY );
	}

	/**
	 * @param	value String
	 *
	 * @return	void
	 */
	allowSandboxValue( value )
	{
		this._addDirective( SANDBOX_KEY, value );
	}

	/**
	 * @param	uri String
	 *
	 * @return	void
	 */
	addBaseUri( uri )
	{
		this._addDirective( BASE_URI_KEY, this._decorateFetchDirectiveSource( uri ) );
	}

	/**
	 * @param	uri String
	 *
	 * @return	void
	 */
	restrictFormActionUrl( uri )
	{
		this._addDirective( FORM_ACTION_KEY, this._decorateFetchDirectiveSource( uri ) );
	}

	/**
	 * @param	uri String
	 *
	 * @return	void
	 */
	addFrameAncestors( uri )
	{
		this._addDirective( FRAME_ANCESTORS_KEY, this._decorateFetchDirectiveSource( uri ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addScriptSrc( source )
	{
		this._addDirective( SCRIPT_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addImgSrc( source )
	{
		this._addDirective( IMAGE_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addChildSrc( source )
	{
		this._addDirective( CHILD_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addConnectSrc( source )
	{
		this._addDirective( CONNECT_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addDefaultSrc( source )
	{
		this._addDirective( DEFAULT_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @brief	Enables all src for self only
	 *
	 * @return	void
	 */
	enableSelf()
	{
		this._addDirective( DEFAULT_SRC_KEY, "'self'" );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addFontSrc( source )
	{
		this._addDirective( FONT_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addFrameSrc( source )
	{
		this._addDirective( FRAME_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addManifestSrc( source )
	{
		this._addDirective( MANIFEST_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addMediaSrc( source )
	{
		this._addDirective( MEDIA_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addObjectSrc( source )
	{
		this._addDirective( OBJECT_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @param	source String
	 *
	 * @return	void
	 */
	addStyleSrc( source )
	{
		this._addDirective( STYLE_SRC_KEY, this._decorateFetchDirectiveSource( source ) );
	}

	/**
	 * @brief	Builds the CSP header
	 *
	 * @return	String
	 */
	build()
	{
		if ( ! this.enabled )
			return '';

		let directives	= '';

		for ( const directive in this.directives )
		{
			// Remove duplicates
			let attributes	= [...new Set( this.directives[directive] )];
			attributes		= attributes.join( ' ' );

			// Add Space only if needed, not critical but it is according to specification
			if ( attributes !== '' )
			{
				attributes	= ` ${attributes}`;
			}


			if ( directives !== '' )
				directives			+= ' ';

			directives			+= `${directive}${attributes};`;
		}


		return directives;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @brief	Decorates Fetch directives source
	 *
	 * @details	Adds quotes when needed
	 *
	 * @param	source String
	 *
	 * @return	String
	 */
	_decorateFetchDirectiveSource( source )
	{
		if ( DIRECTIVES_SPECIAL_ARGUMENTS.includes( source ) )
		{
			return `'${source}'`;
		}

		return source;
	}

	/**
	 * @brief	Adds a new directive
	 *
	 * @param	directive String
	 * @param	value String
	 *
	 * @return	void
	 */
	_addDirective( directive, value = '' )
	{
		if ( typeof this.directives[directive] === 'undefined' )
		{
			this.directives[directive]	= [];
		}

		if ( value !== '' )
			this.directives[directive].push( value );
	}
}

module.exports	= ContentSecurityPolicy;