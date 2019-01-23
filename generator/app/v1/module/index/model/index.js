'use strict';

let IndexModel	= {};

// Called on index action
IndexModel.index	= ( event )=>{
	event.send( '<h1>Hello World!</h1>' )
};

module.exports	= IndexModel;