'use strict';

const { Server }	= require( './../../index' );

let server	= new Server({
	port		: 3333,
	clusters	: 1
});

server.add({
	route	: '/ping',
	method	: 'GET',
	handler	: ( event )=>{
		event.send( 'pong', 200 );
	}
});

server.start(()=>{});