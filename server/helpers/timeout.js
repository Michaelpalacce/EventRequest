'use strict';

/**
 * @brief	Sets a new timeout and returns the timeout object
 *
 * @param	Function func
 * @param	Number delay
 *
 * @return	Object
 */
function setAdvTimeout( func, delay )
{
	if ( typeof func !== 'function' )
	{
		return {
			fireTime	: Date.now(),
			called		: true,
			canceled	: true,
			callback	: ()=>{}
		};
	}

	delay	= typeof delay === 'number' && delay >= 0 ? delay : 0;

	let obj	= {
		fireTime	: Date.now() + delay ,
		called		: false,
		canceled	: false,
		callback	: func
	};

	let callFunc = function()
	{
		obj.called = true;
		func();
	};

	obj.extend = function( ms )
	{
		if ( obj.called || obj.canceled )
			return false;

		clearTimeout( obj.timeout );
		obj.fireTime	+= ms;
		let newDelay	= obj.fireTime - Date.now(); // figure out new ms

		if ( newDelay < 0 )
		{
			newDelay = 0;
		}

		obj.timeout	= setTimeout( callFunc, newDelay );

		return obj;
	};

	obj.cancel	= function() {
		obj.canceled	= true;
		clearTimeout( obj.timeout );
	};

	obj.timeout	= setTimeout( callFunc, delay );

	return obj;
}

module.exports	= setAdvTimeout;
