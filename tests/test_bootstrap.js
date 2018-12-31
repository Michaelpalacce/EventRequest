'use strict';

const { Server }	= require( '../index' );

let server			= new Server({
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

module.exports	= {
	server
};
