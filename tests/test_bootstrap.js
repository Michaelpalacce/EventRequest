'use strict';

const path			= require( 'path' );
const app			= require( '../index' )();
const DataServer	= require( '../server/components/caching/data_server' );

const TEST_ROOT		= path.parse( __dirname ).dir;

app.add({
	route	: '/ping',
	method	: 'GET',
	handler	: ( event )=>{
		event.send( 'pong', 200 );
	}
});

app.listen( 3333, ()=>{});

// Set up a memory server to be used by the tests
const dataServer	= new DataServer({ persist: false, persistPath: path.join( TEST_ROOT, './fixture/cache' )});

module.exports	= {
	server: app, dataServer
};
