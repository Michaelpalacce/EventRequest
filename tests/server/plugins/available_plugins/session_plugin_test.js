'use strict';

// Dependencies
const { assert, test, helpers }	= require( '../../../test_helper' );
const SessionPlugin				= require( './../../../../server/plugins/available_plugins/session_plugin' );
test({
	message	: 'SessionPlugin getPluginDependencies returns er_cache_server',
	test	: ( done )=>{
		let plugin	= new SessionPlugin( 'id' );

		assert.deepStrictEqual( ['er_cache_server'], plugin.getPluginDependencies() );

		done();
	}
});
