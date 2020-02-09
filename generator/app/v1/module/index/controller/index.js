'use strict';

const { Server }	= require( 'event_request' );
const Model			= require( './../model/index' );

const app			= Server();

app.get( '/', event => Model.index( event ) );
