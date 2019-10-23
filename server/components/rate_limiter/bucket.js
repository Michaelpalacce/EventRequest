'use strict';

/**
 * @brief	Leaky bucket implementation
 */
class Bucket
{
	/**
	 * @param	Number refillAmount
	 * @param	Number refillTime
	 * @param	Number maxAmount
	 */
	constructor( refillAmount, refillTime, maxAmount )
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
		this.lastUpdate	= Bucket.getCurrentTime();
	}

	/**
	 * @brief	Gets the current available tokens
	 *
	 * @return	Number
	 */
	get()
	{
		return Math.min( this.maxAmount, this.value + this.refillAmount );
	}

	/**
	 * @brief	How much should be refilled given the last update
	 *
	 * @return	Number
	 */
	refillCount()
	{
		return Math.round( ( Bucket.getCurrentTime() - this.lastUpdate ) / this.refillTime );
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
		const refillCount	= this.refillCount();
		this.value			+= refillCount * this.refillAmount;
		this.lastUpdate		+= refillCount * this.refillTime;
		
		if ( this.value >= this.maxAmount )
		{
			this.reset();
		}

		if ( tokens > this.value )
		{
			return false;
		}

		this.value	-= tokens;

		return true;
	}

	/**
	 * @brief	Gets the current timestamp in seconds
	 *
	 * @return	Number
	 */
	static getCurrentTime()
	{
		return Math.floor( Date.now() / 1000 );
	}
}

module.exports	= Bucket;