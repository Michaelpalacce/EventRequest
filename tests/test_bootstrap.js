'use strict';

const { Server }				= require( '../index' );
const MemoryDataServer			= require( '../server/components/caching/memory/memory_data_server' );
const { Loggur, LOG_LEVELS }	= require( '../server/components/logger/loggur' );

let server			= Server({
	port	: 3333
});

server.add({
	route	: '/ping',
	method	: 'GET',
	handler	: ( event )=>{
		event.send( 'pong', 200 );
	}
});

server.start(()=>{});

// Set up a memory server to be used by the tests
let cachingServer	= new MemoryDataServer();

let onFulfilled		= ( data )=>{
	Loggur.log( data, LOG_LEVELS.info );
};

let onRejected		= ( err )=>{
	Loggur.log( err, LOG_LEVELS.error );
};

cachingServer.setUp( {} ).then( onFulfilled, onRejected );

module.exports	= {
	server, cachingServer
};
