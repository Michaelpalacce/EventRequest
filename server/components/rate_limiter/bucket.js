'use strict';

/**
 * @brief	Leaky bucket implementation
 */
class Bucket
{
	/**
	 * @details	Refill Amount is how many tokens to refill after the refillTime
	 * 			Refill Time is how often tokens should be renewed
	 * 			Max Amount is the max amount of tokens to be kept
	 *
	 * @param	Number refillAmount
	 * @param	Number refillTime
	 * @param	Number maxAmount
	 */
	constructor( refillAmount = 100, refillTime = 60, maxAmount = 1000 )
	{
		this.refillAmount	= refillAmount;
		this.refillTime		= refillTime;
		this.maxAmount		= maxAmount;

		this.value			= null;
		this.lastUpdate		= null;

		this.reset();
	}

	/**
	 * @brief	Resets the value to the maximum available tokens
	 *
	 * @return	void
	 */
	reset()
	{
		this.value		= this.maxAmount;
		this.lastUpdate	= this._getCurrentTime();
	}

	/**
	 * @brief	Gets the current available tokens
	 *
	 * @return	Number
	 */
	get()
	{
		const refillCount	= this._refillCount();
		this.value			+= refillCount * this.refillAmount;

		return this.value	= Math.min( this.maxAmount, this.value );
	}

	/**
	 * @brief	Get a token
	 *
	 * @details	Returns true if there are tokens left otherwise, return false
	 *
	 * @param	Number tokens
	 *
	 * @return	Boolean
	 */
	reduce( tokens = 1 )
	{
		this.get();

		this.lastUpdate	+= this._refillCount() * this.refillTime;
		
		if ( tokens > this.value )
		{
			return false;
		}

		this.value	-= tokens;

		return true;
	}

	/**
	 * @brief	How much should be refilled given the last update
	 *
	 * @return	Number
	 */
	_refillCount()
	{
		return Math.round( ( this._getCurrentTime() - this.lastUpdate ) / 2 / this.refillTime );
	}

	/**
	 * @brief	Checks if the bucket has all tokens available
	 *
	 * @return	Boolean
	 */
	isFull()
	{
		this.reduce( 0 );

		return this.value	=== this.maxAmount;
	}

	/**
	 * @brief	Gets the current timestamp in seconds
	 *
	 * @return	Number
	 */
	_getCurrentTime()
	{
		return Math.floor( Date.now() / 1000 );
	}
}

module.exports	= Bucket;