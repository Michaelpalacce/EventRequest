'use strict';

const { Server }	= require( './../../index' );

let server	= new Server({
	port		: 3333,
	clusters	: 2
});
server.add({
	route	: '/ping',
	method	: 'GET',
	handler	: ( event )=>{
		event.send( 'pong', 200 );
	}
});
server.start(()=>{});
console.log( 'here' );