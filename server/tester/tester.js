'use strict';

// Dependencies
const assert		= require( 'assert' );
const Loggur		= require( '../components/logger/loggur' );
const { Console }	= require( '../components/logger/components/logger' );
const Mock			= require( './mocker' );

/**
 * @brief	Constants
 */
const TEST_STATUSES	= {
	failed		: 'failed',
	success		: 'success',
	skipped		: 'skipped',
	incomplete	: 'incomplete',
	pending		: 'pending'
};

/**
 * @brief	Tester class that holds all tests that should be executed
 */
class Tester
{
	constructor()
	{
		this.tests			= [];
		this.errors			= [];
		this.successes		= [];
		this.consoleLogger	= Loggur.createLogger({
			serverName	: 'Tester',
			logLevel	: 'success',
			logLevels	: {
				error	: 100,
				success	: 200,
				info	: 300
			},
			transports	: [
				new Console({
					color		: true,
					logColors	: {
						100	: 'red',
						200	: 'green',
						300	: 'cyan'
					}
				})
			]
		});
	}

	/**
	 * @brief	Initializes the tester and clears up any previously recorded errors or successes
	 *
	 * @details	This is done so we can run the test many times per instance
	 *
	 * @return	void
	 */
	initialize()
	{
		this.errors		= [];
		this.successes	= [];
	}

	/**
	 * @brief	Formats the given test object by adding needed internal fields
	 *
	 * @param	Object test
	 *
	 * @return	Object
	 */
	formatTest( test )
	{
		if ( typeof test !== 'object' || typeof test.message !== 'string' || typeof test.test !== 'function' )
		{
			throw new Error( 'Invalid test provided' );
		}

		if ( test.skipped === true )
		{
			test.status	= TEST_STATUSES.skipped;
		}
		else if ( test.incomplete === true )
		{
			test.status	= TEST_STATUSES.incomplete;
		}
		else
		{
			test.status	= TEST_STATUSES.pending;
		}

		return test;
	}

	/**
	 * @brief	Adds the given test to the queue
	 *
	 * @param	Object test
	 *
	 * @return	void
	 */
	addTest( test )
	{
		this.tests.push( this.formatTest( test ) );
	}

	/**
	 * @brief	Runs all added tests
	 *
	 * @details	This will produce an output directly to the console of the user
	 *
	 * @param	Object options
	 *
	 * @return	void
	 */
	runAllTests( options = {} )
	{
		this.initialize();
		this.consoleLogger.info( `Running ${this.tests.length} tests.` );

		let start			= Date.now();
		let dieOnFirstError	= typeof options.dieOnFirstError === 'boolean' ? options.dieOnFirstError : true;
		let stop			= false;
		let index			= 0;
		let hasFinished		= false;

		let finished	= ()=>{
			this.consoleLogger.info( `Finished in: ${ ( Date.now() - start ) / 1000 }` );
			this.consoleLogger.success( `There were ${this.successes.length} successful tests` );
			this.consoleLogger.error( `There were ${this.errors.length} unsuccessful tests` );
			hasFinished	= true;
		};

		let done	= () =>{
			let test	= this.tests[index];

			if ( stop || test === undefined )
			{
				finished();
				return;
			}

			let testCallback	= test.test;

			/**
			 * @brief	Called if the test passes successfully
			 *
			 * @details	It will output the index of the test as well as the message
			 *
			 * @return	void
			 */
			let successCallback		= () =>{
				test.status	= TEST_STATUSES.success;
				this.successes.push( test );
				this.consoleLogger.success( `${index}. ${test.message}` )
			};

			/**
			 * @brief	Called if there is an error in the test
			 *
			 * @param	mixed err
			 */
			let errorCallback		= ( err ) =>{
				if ( err instanceof Error )
				{
					err	= err.stack;
				}

				test.status	= TEST_STATUSES.failed;
				test.error	= err;
				this.errors.push( test );
				this.consoleLogger.error( `--------------------BEGIN ERROR--------------------` );
				this.consoleLogger.error( `${index}. ${test.message} failed with the following error: ${err}` );
				this.consoleLogger.error( `---------------------END ERROR---------------------` );
				if ( dieOnFirstError )
				{
					stop	= true;
				}
			};

			/**
			 * @brief	Called always when the test finishes ( this callback dispatches either a successCallback or errorCallback )
			 *
			 * @param	mixed err
			 */
			let testDoneCallback	= ( err ) =>{
				if ( hasFinished )
				{
					throw new Error( 'Done called after testing has finished' );
				}

				if ( err )
				{
					errorCallback( err );
				}
				else
				{
					successCallback();
				}
				index	++;
				done();
			};

			try
			{
				testCallback( testDoneCallback );
			}
			catch( e )
			{
				testDoneCallback( e );
			}
		};

		done();

		if ( this.errors.length + this.successes.length !== this.tests.length )
		{
			throw new Error(
				'Test errors and test successes do not match. ' +
				'Some tests may have called done twice or possible async mishandling.'
			);
		}
	}
}

let tester		= new Tester();
module.exports	= {
	Tester,
	Mock,
	assert,
	test		: tester.addTest.bind( tester ),
	runAllTests	: tester.runAllTests.bind( tester )
};
