'use strict';

// Dependencies
const assert				= require( 'assert' );
const { Console, Loggur }	= require( '../components/logger/loggur' );
const Mock					= require( './mock' );
const Mocker				= require( './mocker' );

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

const LOG_LEVELS	= {
	error	: 100,
	success	: 200,
	info	: 300,
	warning	: 400
};

const DEFAULT_LOG_LEVEL	= LOG_LEVELS.warning;

/**
 * @brief	Tester class that holds all tests that should be executed
 */
class Tester
{
	constructor()
	{
		this.tests	= [];
	}

	/**
	 * @brief	Initializes the tester and clears up any previously recorded errors or successes
	 *
	 * @details	This is done so we can run the test many times per instance
	 *
	 * @return	void
	 */
	initialize( options )
	{
		this.errors			= [];
		this.successes		= [];
		this.skipped		= [];
		this.incomplete		= [];
		Loggur.disableDefault();
		this.consoleLogger	= Loggur.createLogger({
			serverName	: 'Tester',
			logLevel	: DEFAULT_LOG_LEVEL,
			logLevels	: LOG_LEVELS,
			transports	: [
				new Console({
					color		: true,
					logLevels	: LOG_LEVELS,
					logLevel	: DEFAULT_LOG_LEVEL,
					logColors	: {
						100	: 'red',
						200	: 'green',
						300	: 'cyan',
						400	: 'magenta'
					}
				})
			]
		});
		this.start				= Date.now();
		this.dieOnFirstError	= typeof options.dieOnFirstError === 'boolean' ? options.dieOnFirstError : true;
		this.debug				= typeof options.debug === 'boolean' ? options.debug : false;
		this.silent				= typeof options.silent === 'boolean' ? options.silent : false;
		this.filter				= typeof options.filter === 'string' ? options.filter : false;
		this.callback			= typeof options.callback === 'function' ? options.callback : ( err )=>{
			process.exit( err ? 1 : 0 );
		};
		this.stop			= false;
		this.index			= 0;
		this.hasFinished	= false;

		const argv	= process.argv.slice( 2 );

		for ( let command of argv )
		{
			switch ( true )
			{
				case command.match( /--filter=/ ) !== null:
					this.filter	= command.substring( 9 );
					break;
				case command.match( /--silent/ ) !== null:
					this.silent	= true;
					break;
				case command.match( /--debug/ ) !== null:
					this.debug	= true;
					break;
				case command.match( /--dieOnFirstError=/ ) !== null:
					this.dieOnFirstError	= command.substring( 18 ) == 1;
					break;
				default:
					break;
			}
		}

		if ( this.silent )
		{
			// Will display only errors
			this.consoleLogger.logLevel	= LOG_LEVELS.error;
		}
	}

	/**
	 * @brief	Formats the given test object by adding needed internal fields
	 *
	 * @param	Object test
	 *
	 * @return	Array
	 */
	formatTest( test )
	{
		if ( typeof test !== 'object' || typeof test.message !== 'string' || typeof test.test !== 'function' )
		{
			throw new Error( 'Invalid test provided' );
		}
		let tests	= [];

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

		if ( Array.isArray( test.dataProvider ) )
		{
			let i	= 0;

			for ( const data of test.dataProvider )
			{
				const newTest	= {};

				newTest.message	= test.message + '#' + i;
				newTest.status	= test.status;

				newTest.test	= ( done )=>{
					const newData	= [done].concat( data );
					const response	= test.test.apply( this, newData );

					if ( response instanceof Promise )
					{
						response.catch(( error )=>{
							setImmediate(()=>{
								done( error );
							});
						});
					}
				};

				tests.push( newTest );

				++ i;
			}
		}
		else
		{
			tests.push( test );
		}

		return tests;
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
		this.tests	= this.tests.concat( this.formatTest( test ) );
	}

	/**
	 * @brief	Called if the test passes successfully
	 *
	 * @details	It will output the index of the test as well as the message
	 *
	 * @return	void
	 */
	successCallback( test )
	{
		test.status	= TEST_STATUSES.success;
		this.successes.push( test );
		this.consoleLogger.success( `${this.index}. ${test.message}` );
	};

	/**
	 * @brief	Called if there is an error in the test
	 *
	 * @param	Object test
	 * @param	mixed err
	 */
	errorCallback( test, error )
	{
		if ( error instanceof Error )
		{
			if ( this.debug )
			{
				error	= error.stack;
			}
			else
			{
				error	= error.message;
			}
		}

		test.status	= TEST_STATUSES.failed;
		test.error	= error;
		this.errors.push( test );
		this.consoleLogger.error( `--------------------BEGIN ERROR--------------------` );
		this.consoleLogger.error( `${this.index}. ${test.message} failed with the following error: ${error}` );
		this.consoleLogger.error( `---------------------END ERROR---------------------` );
		if ( this.dieOnFirstError )
		{
			this.stop	= true;
			this.finished();
		}
	};

	/**
	 * @brief	Called when all the tests have finished
	 *
	 * @return	void
	 */
	finished()
	{
		this.hasFinished	= true;

		const logPromises	= [];

		logPromises.push( this.consoleLogger.error( `Finished in: ${ ( Date.now() - this.start ) / 1000 }` ) );
		logPromises.push( this.consoleLogger.success( `There were ${this.successes.length} successful tests` ) );
		logPromises.push( this.consoleLogger.error( `There were ${this.errors.length} unsuccessful tests` ) );
		logPromises.push( this.consoleLogger.warning( `There were ${this.skipped.length} skipped tests` ) );
		logPromises.push( this.consoleLogger.warning( `There were ${this.incomplete.length} incomplete tests` ) );

		// Done so logging can occur by adding this to the end of the event loop
		setImmediate(()=>{
			this.callback( this.errors.length > 0 ? 'Errors while testing' : false );
		});
	};

	/**
	 * @brief	Called by the done function of the tests
	 *
	 * @param	Object test
	 * @param	mixed err
	 *
	 * @return	void
	 */
	doneCallback( test, err )
	{
		if ( this.hasFinished || this.stop )
		{
			throw new Error( 'Done called after finishing up. There could be a potential error!' );
			return;
		}

		if ( err )
		{
			this.errorCallback( test, err );
		}
		else
		{
			this.successCallback( test );
		}

		this.done();
	}

	/**
	 * @brief	Checks the given test's status and determines what should happen
	 *
	 * @param	Object test
	 *
	 * @return	Boolean
	 */
	checkTestStatus( test )
	{
		switch ( test.status )
		{
			case TEST_STATUSES.incomplete:
				this.incomplete.push( test );
				this.consoleLogger.warning( `${this.index}. INCOMPLETE ${test.message}` );
				return true;

			case TEST_STATUSES.skipped:
				this.skipped.push( test );
				this.consoleLogger.warning( `${this.index}. SKIPPED ${test.message}` );
				return true;

			default:
				return false;
		}
	}

	/**
	 * @brief	Call next test
	 *
	 * @return	void
	 */
	done()
	{
		let test	= this.tests.shift();

		if ( this.stop || test === undefined )
		{
			this.finished();
			return;
		}

		if ( this.filter !== false && test.message.indexOf( this.filter ) === -1 )
		{
			this.done();
			return;
		}

		++ this.index;

		let status	= this.checkTestStatus( test );
		if ( status	=== true )
		{
			this.done();
			return;
		}

		/**
		 * @brief	Wrapper for the done callback to add the test to the callback
		 */
		let callback	= ( err )=>{
			this.doneCallback( test, err );
		};

		try
		{
			const testToExecute	= test.test;
			const response		= testToExecute( callback );

			if ( response instanceof Promise )
			{
				response.catch(( error )=>{
					setImmediate(()=>{
						this.doneCallback( test, error );
					});
				});
			}
		}
		catch ( error )
		{
			if ( ! this.stop && ! this.hasFinished )
			{
				this.doneCallback( test, error );
			}
			else
			{
				throw error;
			}
		}
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
		this.initialize( options );
		this.consoleLogger.error( `${this.tests.length} tests found.` );
		if ( this.filter !== false )
		{
			this.consoleLogger.warning( `Filtering according to: ${this.filter}` );
		}

		this.done();
	}
}

let tester		= new Tester();
module.exports	= {
	Tester,
	Mock,
	Mocker,
	assert,
	logger			: tester.consoleLogger,
	test			: tester.addTest.bind( tester ),
	runAllTests		: tester.runAllTests.bind( tester )
};
