'use strict';

// Dependencies
const { assert, test }			= require( './../../test_helper' );
const PreLoadedPluginManager	= require( './../../../server/plugins/preloaded_plugins' );

test({
	message	: 'PluginManager does not throw when getting plugins',
	test	: ( done )=>{

		assert.doesNotThrow(()=>{
			PreLoadedPluginManager.getPlugin( 'er_timeout' );
			PreLoadedPluginManager.getPlugin( 'er_env' );
			PreLoadedPluginManager.getPlugin( 'er_static_resources' );
			PreLoadedPluginManager.getPlugin( 'er_cache_server' );
			PreLoadedPluginManager.getPlugin( 'er_session' );
			PreLoadedPluginManager.getPlugin( 'er_security' );
			PreLoadedPluginManager.getPlugin( 'er_templating_engine' );
			PreLoadedPluginManager.getPlugin( 'er_file_stream' );
			PreLoadedPluginManager.getPlugin( 'er_logger' );
			PreLoadedPluginManager.getPlugin( 'er_body_parser_json' );
			PreLoadedPluginManager.getPlugin( 'er_body_parser_form' );
			PreLoadedPluginManager.getPlugin( 'er_body_parser_multipart' );
			PreLoadedPluginManager.getPlugin( 'er_response_cache' );
		});

		done();
	}
});
