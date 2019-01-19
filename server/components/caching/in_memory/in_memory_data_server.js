'use strict';

const { DataServer, SERVER_STATES }	= require( './../data_server' );

/**
 * @brief	InMemoryDataServer that stores data in the process.dataServer variable
 */
class InMemoryDataServer extends DataServer
{
	constructor( options = {} )
	{
		super( options );

		this.timeouts		= {};
		this.memoryLimit	= 0;
		this.isSetUp		= false;
	}

	/**
	 * @copydoc	DataServer::sanitize
	 */
	sanitize( options )
	{
	}

	/**
	 * @copydoc	DataServer::setUp
	 */
	setUp( options = {} )
	{
		return new Promise( ( resolve, reject )=>{
			if ( typeof process.dataServer === 'undefined' )
			{
				process.dataServer	= {};
				this.timeouts		= {};
				this.isSetUp		= true;
			}
			else
			{
				reject( 'There is another instance of the data server running.' );
			}

			resolve( false );
		});
	}

	/**
	 * @copydoc	DataServer::createNamespace
	 */
	createNamespace( namespace, options = {} )
	{
		return new Promise( ( resolve, reject ) =>{
			if ( this.isSetUp !== true )
			{
				reject( 'Server not set up' );
				return;
			}

			this.existsNamespace( namespace, options ).then( ( exists )=>{
				if ( ! exists )
				{
					process.dataServer[namespace]	= {};

					resolve( false );
				}
				else
				{
					reject( 'Namespace already exists' );
				}
			} ).catch( reject );
		})
	}

	/**
	 * @copydoc	DataServer::createNamespace
	 */
	existsNamespace( namespace, options = {} )
	{
		return new Promise( ( resolve, reject )=>{
			if ( this.isSetUp !== true )
			{
				reject( 'Server not set up' );
				return;
			}

			resolve( typeof process.dataServer[namespace] !== 'undefined' );
		});
	}

	/**
	 * @copydoc	DataServer::removeNamespace
	 */
	removeNamespace( namespace, options = {} )
	{
		return new Promise( ( resolve, reject )=>{
			if ( this.isSetUp !== true )
			{
				reject( 'Server not set up' );
				return;
			}

			this.existsNamespace( namespace, options ).then( ( exists )=>{
				if ( ! exists )
				{
					reject( 'Namespace does not exists' );
				}
				else
				{
					delete process.dataServer[namespace];

					resolve( false );
				}
			} ).catch( reject );
		});
	}

	/**
	 * @copydoc	DataServer::create
	 */
	create( namespace, recordName, data = {}, options = {} )
	{
		return new Promise( ( resolve, reject ) => {
			this.existsNamespace( namespace ).then( ( exists )=>{
				if ( ! exists )
				{
					reject( 'Namespace does not exist' );
					return;
				}

				if ( exists )
				{
					this.clearTimeoutFromData( namespace, recordName );
				}

				process.dataServer[namespace][recordName]	= data;
				this.addTimeoutToData( namespace, recordName, this.getTTL( options ) );

				resolve( false );
			}).catch( reject );
		})
	}

	/**
	 * @brief	Clears up the timeout from the data
	 *
	 * @param	String namespace
	 * @param	String recordName
	 *
	 * @return	void
	 */
	clearTimeoutFromData( namespace, recordName )
	{
		let keyPair	= namespace + '||' + recordName;

		clearTimeout( this.timeouts[keyPair] );
		delete this.timeouts[keyPair];
	}

	/**
	 * @brief	Adds a timeout to the given data
	 *
	 * @param	String namespace
	 * @param	String recordName
	 * @param	Number ttl
	 *
	 * @return	void
	 */
	addTimeoutToData( namespace, recordName, ttl )
	{
		this.clearTimeoutFromData( namespace, recordName );

		if ( ttl <= 0 )
		{
			// Introduce a constant
			ttl	= 24 * 60 * 60 * 1000;
		}

		let keyPair	= namespace + '||' + recordName;
		this.timeouts[keyPair]	= setTimeout( () => {
			if ( typeof process.dataServer[namespace] !== 'undefined' )
			{
				delete process.dataServer[namespace][recordName];
			}

			delete this.timeouts[keyPair];
		}, ttl );
	}

	/**
	 * @brief	Extracts the ttl from the options
	 *
	 * @param	object options
	 *
	 * @return	Number
	 */
	getTTL( options )
	{
		return ( typeof options === 'object' && typeof options.ttl === 'number' && options.ttl > 0 )
			? options.ttl
			: 0;
	}
}

module.exports	= InMemoryDataServer;