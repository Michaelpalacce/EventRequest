'use strict';

const { Server }	= require( '../index' );
const DataServer	= require( '../server/components/caching/data_server' );

let server			= Server();

server.add({
	route	: '/ping',
	method	: 'GET',
	handler	: ( event )=>{
		event.send( 'pong', 200 );
	}
});

Server.start( 3333, ()=>{});

// Set up a memory server to be used by the tests
let cachingServer	= new DataServer({ persist: false });

module.exports	= {
	server, cachingServer
};
