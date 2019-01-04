'use strict';

// Dependencies
const { Mock, assert, test, helpers }	= require( './../../test_helper' );
const PreLoadedPluginManager			= require( './../../../server/plugins/preloaded_plugins' );

test({
	message	: '',
	test	: ( done )=>{

		assert.doesNotThrow(()=>{
			PreLoadedPluginManager.getPlugin( 'event_request_timeout' );
			PreLoadedPluginManager.getPlugin( 'event_request_static_resources' );
			PreLoadedPluginManager.getPlugin( 'cache_server' );
			PreLoadedPluginManager.getPlugin( 'event_request_session' );
			PreLoadedPluginManager.getPlugin( 'event_request_templating_engine' );
			PreLoadedPluginManager.getPlugin( 'event_request_file_stream' );
			PreLoadedPluginManager.getPlugin( 'event_request_logger' );
			PreLoadedPluginManager.getPlugin( 'event_request_body_parser' );
			PreLoadedPluginManager.getPlugin( 'event_request_body_parser_json' );
			PreLoadedPluginManager.getPlugin( 'event_request_body_parser_form' );
			PreLoadedPluginManager.getPlugin( 'event_request_body_parser_multipart' );
		});

		done();
	}
});
