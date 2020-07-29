'use strict';

// Dependencies
const { assert, test }	= require( './../../test_helper' );
const PluginManager		= require( './../../../server/plugins/plugin_manager' );
const TimeoutPlugin		= require( '../../../server/plugins/available_plugins/timeout_plugin' );
const PluginInterface	= require( '../../../server/plugins/plugin_interface' );

test({
	message	: 'PluginManager addPlugin',
	test	: ( done ) => {
		let pluginManager		= new PluginManager();
		let timeoutPluginOne	= new TimeoutPlugin( 'id1', {} );
		let timeoutPluginTwo	= new TimeoutPlugin( 'id2', {} );

		pluginManager.addPlugin( timeoutPluginOne );
		pluginManager.addPlugin( timeoutPluginTwo );

		done();
	}
});

test({
	message	: 'PluginManager addPlugin throws if plugin is incorrect',
	test	: ( done ) => {
		let pluginManager	= new PluginManager();

		assert.throws(() => {
			pluginManager.addPlugin( {} );
		});

		done();
	}
});

test({
	message	: 'PluginManager addPlugin does not throw if plugin id exists',
	test	: ( done ) => {
		let pluginManager		= new PluginManager();
		let timeoutPluginOne	= new TimeoutPlugin( 'id', {} );
		let timeoutPluginTwo	= new TimeoutPlugin( 'id', {} );

		pluginManager.addPlugin( timeoutPluginOne );

		assert.doesNotThrow( () => {
			pluginManager.addPlugin( timeoutPluginTwo );
		});

		done();
	}
});

test({
	message	: 'PluginManager.isValidPlugin',
	test	: ( done ) => {
		let pluginManager		= new PluginManager();
		let timeoutPlugin		= new TimeoutPlugin( 'id', {} );
		const validPlugin		= {
			getPluginId				: ()=>{ return 'id'; },
			getPluginDependencies	: ()=>{ return []; },
			getPluginMiddleware		: ()=>{ return []; },
			setOptions				: ()=>{},
			setServerOnRuntime		: ()=>{},
		};

		assert.deepStrictEqual( pluginManager.isValidPlugin( timeoutPlugin ), true );
		assert.deepStrictEqual( pluginManager.isValidPlugin( validPlugin ), true );
		assert.deepStrictEqual( pluginManager.isValidPlugin( {
			getPluginDependencies	: ()=>{ return []; },
			getPluginMiddleware		: ()=>{ return []; },
			setOptions				: ()=>{},
			setServerOnRuntime		: ()=>{},
		} ), false );
		assert.deepStrictEqual( pluginManager.isValidPlugin( {
			getPluginId				: ()=>{ return 'id'; },
			getPluginMiddleware		: ()=>{ return []; },
			setOptions				: ()=>{},
			setServerOnRuntime		: ()=>{},
		} ), false );
		assert.deepStrictEqual( pluginManager.isValidPlugin( {
			getPluginId				: ()=>{ return 'id'; },
			getPluginDependencies	: ()=>{ return []; },
			setOptions				: ()=>{},
			setServerOnRuntime		: ()=>{},
		} ), false );
		assert.deepStrictEqual( pluginManager.isValidPlugin( {
			getPluginId				: ()=>{ return 'id'; },
			getPluginDependencies	: ()=>{ return []; },
			getPluginMiddleware		: ()=>{ return []; },
			setServerOnRuntime		: ()=>{},
		} ), false );
		assert.deepStrictEqual( pluginManager.isValidPlugin( {
			getPluginId				: ()=>{ return 'id'; },
			getPluginDependencies	: ()=>{ return []; },
			getPluginMiddleware		: ()=>{ return []; },
			setOptions				: ()=>{},
		} ), false );

		done();
	}
});

test({
	message	: 'PluginManager removePlugin',
	test	: ( done ) => {
		let pluginManager		= new PluginManager();
		let timeoutPluginOne	= new TimeoutPlugin( 'id1', {} );
		let timeoutPluginTwo	= new TimeoutPlugin( 'id2', {} );

		pluginManager.addPlugin( timeoutPluginOne );
		pluginManager.addPlugin( timeoutPluginTwo );

		assert.equal( 2, pluginManager.getAllPluginIds().length );

		pluginManager.removePlugin( 'id2' );

		assert.equal( 1, pluginManager.getAllPluginIds().length );
		assert.deepEqual( ['id1'], pluginManager.getAllPluginIds() );

		done();
	}
});

test({
	message	: 'PluginManager getAllPluginIds',
	test	: ( done ) => {
		let pluginManager		= new PluginManager();
		let timeoutPluginOne	= new TimeoutPlugin( 'id1', {} );
		let timeoutPluginTwo	= new TimeoutPlugin( 'id2', {} );

		pluginManager.addPlugin( timeoutPluginOne );
		pluginManager.addPlugin( timeoutPluginTwo );

		assert.equal( 2, pluginManager.getAllPluginIds().length );
		assert.deepEqual( ['id1', 'id2'], pluginManager.getAllPluginIds() );

		done();
	}
});

test({
	message	: 'PluginManager getPlugin',
	test	: ( done ) => {
		let pluginId		= 'id1';
		let pluginManager	= new PluginManager();
		let timeoutPlugin	= new TimeoutPlugin( pluginId, {} );

		pluginManager.addPlugin( timeoutPlugin );

		assert.equal( true, pluginManager.getPlugin( pluginId ) instanceof PluginInterface );

		done();
	}
});

test({
	message	: 'PluginManager throws if plugin does not exist',
	test	: ( done ) => {
		let pluginManager	= new PluginManager();
		let timeoutPlugin	= new TimeoutPlugin( 'id1', {} );

		pluginManager.addPlugin( timeoutPlugin );

		assert.throws(() => {
			pluginManager.getPlugin( 'wrongid' );
		});

		done();
	}
});

test({
	message	: 'PluginManager hasPlugin',
	test	: ( done ) => {
		let pluginManager	= new PluginManager();
		let timeoutPlugin	= new TimeoutPlugin( 'id1', {} );

		pluginManager.addPlugin( timeoutPlugin );

		assert.equal( true, pluginManager.hasPlugin( 'id1' ) );
		assert.equal( false, pluginManager.hasPlugin( 'id2' ) );

		done();
	}
});
