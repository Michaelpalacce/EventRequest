'use strict';

const { Server }	= require( 'event_request' );
const Model			= require( './../model/index' );

let server	= Server();

server.get( '/', event => Model.index( event ) );