'use strict';

let IndexModel	= {};

// Called on index action
IndexModel.index	= ( event )=>{
	event.render( 'index' )
};

module.exports	= IndexModel;