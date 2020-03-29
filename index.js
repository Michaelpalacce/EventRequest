'use strict';

// Dependencies
const Logging	= require( './server/components/logger/loggur' );
const Testing	= require( './server/tester/tester' );
const Server	= require( './server/server' );

exports.Server	= Server;
exports.Testing	= Testing;
exports.Loggur	= Logging.Loggur;
exports.Logging	= Logging;

// const CSP		= require( './server/components/security/content_security_policy' );
//
// const csp	= new CSP();
//
// csp.enableSelf();
// csp.setReportOnly( '/cspReport', false );
// csp.setReportOnlyWithReportTo( '/test/hey', false );
// csp.upgradeInsecureRequests();
// csp.addFrameAncestors( 'self' );
// csp.addFrameAncestors( 'www.google.com' );
// csp.restrictFormActionUrl( 'self' );
// csp.restrictFormActionUrl( '/test.php' );
// csp.allowSandboxValue( 'allow-presentation' );
// csp.allowSandboxValue( 'allow-presentation' );
// csp.allowSandboxValue( 'allow-presentation' );
// csp.enableSandbox();
//
// csp.addScriptSrc( 'self' );
// csp.addScriptSrc( 'www.google.com' );
// csp.addScriptSrc( 'www.google.com' );
// csp.addScriptSrc( 'www.google.com' );
// csp.addScriptSrc( 'www.google.com' );
// csp.addImgSrc( 'www.google.com' );
// csp.addImgSrc( 'https://*.example.com' );
// csp.addChildSrc( 'none' );
// csp.addChildSrc( 'www.google.com' );
// csp.addDefaultSrc( 'none' );
// csp.addDefaultSrc( 'www.google.com' );
// csp.addConnectSrc( 'none' );
// csp.addConnectSrc( 'self' );
// csp.addConnectSrc( 'www.google.com' );
//
// csp.addFontSrc( 'none' );
// csp.addFontSrc( 'self' );
// csp.addFontSrc( 'www.google.com' );
//
// csp.addFrameSrc( 'none' );
// csp.addFrameSrc( 'self' );
// csp.addFrameSrc( 'www.google.com' );
//
// csp.addManifestSrc( 'none' );
// csp.addManifestSrc( 'self' );
// csp.addManifestSrc( 'www.google.com' );
//
// csp.addMediaSrc( 'none' );
// csp.addMediaSrc( 'self' );
// csp.addMediaSrc( 'www.google.com' );
//
// csp.addStyleSrc( 'none' );
// csp.addStyleSrc( 'self' );
// csp.addStyleSrc( 'www.google.com' );
//
// csp.addObjectSrc( 'none' );
// csp.addObjectSrc( 'self' );
// csp.addObjectSrc( 'www.google.com' );
//
// csp.addBaseUri( 'none' );
// csp.addBaseUri( 'self' );
// csp.addBaseUri( 'www.google.com' );
//
// csp.allowPluginType( 'application/json' );
// csp.allowPluginType( 'application/vnd.adobe.air-application-installer-package+zip' );
//
//
// console.log( `${csp.getHeader()}: ${csp.build()}` );