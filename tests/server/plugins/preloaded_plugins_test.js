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
		});

		done();
	}
});
