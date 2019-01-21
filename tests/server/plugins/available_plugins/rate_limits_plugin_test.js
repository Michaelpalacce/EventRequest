'use strict';

// Dependencies
const { assert, test, helpers, Mock }	= require( '../../../test_helper' );
const RateLimitsPlugin					= require( '../../../../server/plugins/available_plugins/rate_limits_plugin' );
const Router							= require( '../../../../server/components/routing/router' );

test({
	message	: 'RateLimitsPlugin.constructor does not throw',
	test	: ( done )=>{
		new RateLimitsPlugin( 'id', {} );
		done();
	}
});

test({
	message	: 'RateLimitsPlugin.setServerOnRuntime attaches an event for eventRequestResolved',
	test	: ( done )=>{
		let plugin		= new RateLimitsPlugin( 'id', {} );
		let MockServer	= Mock( helpers.getServer().constructor );
		let server		= new MockServer();
		let called		= false;

		server._mock({
			method			: 'on',
			shouldReturn	: ()=>{
				called	= true;
			},
			called			: 1,
			with			: [
				['eventRequestResolved', undefined]
			]
		});

		plugin.setServerOnRuntime( server );

		called === true ? done() : done( 'eventRequestResolved should have been attached to the server but was not' );
	}
});

test({
	message	: 'RateLimitsPlugin.setServerOnRuntime eventRequestResolved checks if it should be passed or not',
	test	: ( done )=>{
		let plugin			= new RateLimitsPlugin( 'id', {} );
		let MockServer		= Mock( helpers.getServer().constructor );
		let eventRequest	= helpers.getEventRequest( undefined, '/' );
		let request			= eventRequest.request;
		let response		= eventRequest.response;
		let server			= new MockServer();

		eventRequest.setBlock( [{}, {}, {}] );

		plugin.setServerOnRuntime( server );

		server.emit( 'eventRequestResolved', { eventRequest, request, response } );
		server.emit( 'eventRequestBlockSet', { eventRequest, block: [] } );

		assert.equal( 3, eventRequest.block.length );

		for ( let i = 0; i < 101; ++ i )
		{
			server.emit( 'eventRequestResolved', { eventRequest, request, response } );
			server.emit( 'eventRequestBlockSet', { eventRequest, block: [] } );

			if ( i < 99 )
			{
				assert.equal( 3, eventRequest.block.length );
			}
			else
			{
				assert.equal( 1, eventRequest.block.length );
			}
		}

		done();
	}
});
