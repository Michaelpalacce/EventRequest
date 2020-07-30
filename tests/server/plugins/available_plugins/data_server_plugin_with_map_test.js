'use strict';

const DataServerPlugin			= require( '../../../../server/plugins/available_plugins/data_server_plugin' );
const DataServerMap				= require( '../../../../server/components/caching/data_server_map' );
const Router					= require( '../../../../server/components/routing/router' );
const { assert, test, helpers }	= require( '../../../test_helper' );
const path						= require( 'path' );
const fs						= require( 'fs' );

const PROJECT_ROOT				= path.parse( require.main.filename ).dir;
const DEFAULT_PERSIST_FILE		= path.join( PROJECT_ROOT, 'cache' );

/**
 * @brief	Removes the cache file
 */
function removeCache( dataServer )
{
	if ( dataServer )
	{
		dataServer.stop();
	}
	else
	{
		if ( fs.existsSync( DEFAULT_PERSIST_FILE ) )
			fs.unlinkSync( DEFAULT_PERSIST_FILE );
	}
}

test({
	message	: 'DataServerPlugin.with.map.getServer.returns.a.DataServerMap.if.one.is.given.with.options.that.will.not.apply',
	test	: ( done ) => {
		// The dataServerOptions will not be applied
		const options					= {
			dataServerOptions	: { persist: true },
			dataServer			: new DataServerMap( { persist: false } )
		};

		const memoryDataServerPlugin	= new DataServerPlugin( 'plugin_id', options );

		const dataServer				= memoryDataServerPlugin.getServer();

		assert.deepStrictEqual( memoryDataServerPlugin.dataServerOptions, options.dataServerOptions );
		assert.equal( memoryDataServerPlugin.server instanceof DataServerMap, true );
		assert.equal( memoryDataServerPlugin.server.persist, false );

		removeCache( dataServer );

		done();
	}
});

test({
	message	: 'DataServerPlugin.with.map.getPluginMiddleware.returns.a.middleware.that.adds.a.dataServer',
	test	: ( done ) => {
		const options					= { dataServer : new DataServerMap( { persist: false } ) };
		const memoryDataServerPlugin	= new DataServerPlugin( 'id', options );
		const eventRequest				= helpers.getEventRequest();
		const router					= new Router();
		const middleware				= memoryDataServerPlugin.getPluginMiddleware();
		let called						= 0;

		eventRequest._mock({
			method			: 'on',
			shouldReturn	: () => {
				called	++;
			},
			with			: [
				['cleanUp', undefined],
			],
			called			: 1
		});

		assert.equal( 1, middleware.length );

		router.add( middleware[0] );
		router.add( {
			handler	: ( event ) => {
				assert.equal( typeof event.dataServer !== 'undefined', true );
				assert.equal( event.dataServer instanceof DataServerMap, true );
				assert.equal( called, 1 );

				removeCache( event.dataServer );
				done();
			}
		} );

		eventRequest._setBlock( router.getExecutionBlockForCurrentEvent( eventRequest ) );

		eventRequest.next();
	}
});